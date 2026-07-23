// src/data/repositories/FirebaseDashboardRepository.ts
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebase/config';
import type { DashboardData, TendenciaPoint, XRPoint, ScatterPoint, QQPoint, CorrelationMatrixData } from '../../domain/entities/DashboardData';
import type { IDashboardRepository, DashboardFilters } from '../../domain/repositories/IDashboardRepository';
import { calculateMean, calculateStdDev, calculateMedian, calculateCpCpk, generateHistogram } from '../../utils/statistics';

export class FirebaseDashboardRepository implements IDashboardRepository {
  async getDashboardData(filters?: DashboardFilters): Promise<DashboardData> {
    const q = query(collection(db, 'mediciones'));
    const snapshot = await getDocs(q);
    
    let allData = snapshot.docs.map(doc => doc.data() as any);

    // Filter by Pilar (Tab name)
    if (filters?.pilar && filters.pilar !== 'Todos') {
      const targetPilar = filters.pilar.toLowerCase().trim();
      allData = allData.filter(d => {
        if (!d.Pilar) return false;
        return String(d.Pilar).toLowerCase().trim() === targetPilar;
      });
    }

    // Extraer opciones dinámicas DESPUÉS de filtrar por Pilar, pero ANTES de los filtros secundarios
    const extractUnique = (key: string) => {
      const set = new Set<string>();
      allData.forEach(d => {
        if (d[key] && typeof d[key] === 'string') {
          set.add(d[key].trim());
        }
      });
      return Array.from(set).sort();
    };

    const dynamicOptions = {
      areas: extractUnique('Area'),
      indicadores: extractUnique('Indicador'),
      procesos: extractUnique('Proceso'),
      marcas: extractUnique('Marca'),
      etapas: extractUnique('Etapa'),
      puestos: extractUnique('Puesto'),
      productos: extractUnique('Producto'),
      fermentadores: extractUnique('Fermentador'),
    };

    // Filter by Area de Planta
    if (filters?.area && filters.area !== 'Todas') {
      const targetArea = filters.area.toLowerCase().trim();
      allData = allData.filter(d => {
        if (!d.Area) return false;
        return String(d.Area).toLowerCase().trim().includes(targetArea);
      });
    }

    // Filtros Adicionales Dinámicos
    const additionalFilters = [
      { key: 'Proceso', value: filters?.proceso, ignore: ['Todos', 'Todas'] },
      { key: 'Marca', value: filters?.marca, ignore: ['Todos', 'Todas'] },
      { key: 'Etapa', value: filters?.etapa, ignore: ['Todos', 'Todas'] },
      { key: 'Puesto', value: filters?.puesto, ignore: ['Todos', 'Todas'] },
      { key: 'Producto', value: filters?.producto, ignore: ['Todos', 'Todas'] },
      { key: 'Fermentador', value: filters?.fermentador, ignore: ['Todos', 'Todas'] }
    ];

    additionalFilters.forEach(f => {
      if (f.value && !f.ignore.includes(f.value)) {
        const target = f.value.toLowerCase().trim();
        allData = allData.filter(d => {
          if (!d[f.key]) return false;
          return String(d[f.key]).toLowerCase().trim() === target;
        });
      }
    });

    // Guardar los datos base (filtrados por Pilar, Area, etc., pero NO por Indicador)
    const baseData = [...allData];

    // Filter by Indicador robustamente (ignorando saltos de línea, mayúsculas y espacios extra)
    let primaryData = [...allData];
    if (filters?.indicador && filters.indicador !== 'Todos') {
      const target = filters.indicador.toLowerCase().replace(/\s+/g, ' ').trim();
      primaryData = primaryData.filter(d => {
        if (!d.Indicador) return false;
        const val = String(d.Indicador).toLowerCase().replace(/\s+/g, ' ').trim();
        return val === target || val.includes(target);
      });
    }

    let secondaryData: any[] = [];
    if (filters?.indicadorCorrelacion && filters.indicadorCorrelacion !== 'Todos' && filters.indicadorCorrelacion !== filters?.indicador) {
      const targetCorr = filters.indicadorCorrelacion.toLowerCase().replace(/\s+/g, ' ').trim();
      secondaryData = [...allData].filter(d => {
        if (!d.Indicador) return false;
        const val = String(d.Indicador).toLowerCase().replace(/\s+/g, ' ').trim();
        return val === targetCorr || val.includes(targetCorr);
      });
    }

    allData = primaryData;
    
    if (allData.length === 0) {
      return {
        options: dynamicOptions,
        kpis: { promedio: 0, desvEstandar: 0, cp: 0, cpk: 0, pp: 0, ppk: 0, fueraEsp: 0, muestras: 0 },
        stats: { n: 0, media: 0, mediana: 0, min: 0, max: 0, desvEstandar: 0, cv: 0, asimetria: 0, curtosis: 0 },
        tendencia: [],
        xr: [],
        histogram: { bins: [], frequencies: [], curve: [] },
        boxplot: { labels: [], series: [] },
        scatter: [],
        qq: [],
        correlations: [],
        limits: { lsl: 0, usl: 0, ucl_x: 0, lcl_x: 0, ucl_r: 0, lcl_r: 0 }
      } as any;
    }

    // Sort by Consecutivo to maintain time series order
    allData.sort((a, b) => {
      const seqA = parseInt(a.Consecutivo) || 0;
      const seqB = parseInt(b.Consecutivo) || 0;
      return seqA - seqB;
    });

    const values = allData.map(d => {
      let valStr = String(d.Resultado || '0').replace(',', '.');
      return parseFloat(valStr);
    });

    const mean = calculateMean(values);
    const stdDev = calculateStdDev(values, mean);
    const median = calculateMedian(values);
    
    // Diccionario de especificaciones (LSL y USL) según el Indicador
    const specs: Record<string, {lsl: number, usl: number}> = {
      'tiempo de calentamiento': { lsl: 10, usl: 20 }, // Puedes ajustar estos valores reales
      'temperatura': { lsl: 75, usl: 85 },
      'ph': { lsl: 5.0, usl: 5.5 }
    };

    const indKey = filters?.indicador?.toLowerCase().trim() || '';
    const lsl = filters?.customLSL !== undefined ? filters.customLSL : (specs[indKey]?.lsl ?? (mean - (3 * stdDev))); // Fallback a 3 sigma si no se conoce
    const usl = filters?.customUSL !== undefined ? filters.customUSL : (specs[indKey]?.usl ?? (mean + (3 * stdDev)));
    
    const cpData = calculateCpCpk(values, lsl, usl, mean, stdDev);
    
    const tendencia: TendenciaPoint[] = values.map((val, i) => ({
      date: `N° ${allData[i].Consecutivo || i + 1}`,
      value: val
    }));

    // XR Chart
    const xr: XRPoint[] = [];
    const subgroupSize = 5;
    for (let i = 0; i < values.length; i += subgroupSize) {
      const chunk = values.slice(i, i + subgroupSize);
      if (chunk.length > 1) {
        const xValue = calculateMean(chunk);
        const rValue = Math.max(...chunk) - Math.min(...chunk);
        xr.push({ date: `Sub ${Math.floor(i / subgroupSize) + 1}`, xValue, rValue });
      }
    }

    const rMean = xr.length > 0 ? calculateMean(xr.map(p => p.rValue)) : 0;
    const xDoubleBar = xr.length > 0 ? calculateMean(xr.map(p => p.xValue)) : mean;
    const ucl_x = filters?.customUCL_X !== undefined ? filters.customUCL_X : xDoubleBar + (0.577 * rMean);
    const lcl_x = filters?.customLCL_X !== undefined ? filters.customLCL_X : xDoubleBar - (0.577 * rMean);
    const ucl_r = filters?.customUCL_R !== undefined ? filters.customUCL_R : 2.114 * rMean;
    const lcl_r = filters?.customLCL_R !== undefined ? filters.customLCL_R : 0 * rMean;
    
    // Calculate fueraEsp percentage
    const fueraEspCount = values.filter(v => v < lsl || v > usl).length;
    const fueraEsp = values.length > 0 ? (fueraEspCount / values.length) * 100 : 0;

    const hist = generateHistogram(values, Math.min(...values), Math.max(...values), 12);
    
    // Boxplot logic
    const equipos = [...new Set(allData.map(d => d.Equipo ? `${d.Equipo} ${d['Numero de Equipo'] || ''}`.trim() : 'General'))];
    const boxplotSeries = equipos.map(eq => {
      return allData
        .filter(d => (d.Equipo ? `${d.Equipo} ${d['Numero de Equipo'] || ''}`.trim() : 'General') === eq)
        .map(d => parseFloat(String(d.Resultado).replace(',', '.')));
    });

    const qq: QQPoint[] = values.slice(0, 100).map((v, i) => ({ q: -3 + (i * (6 / Math.min(values.length, 100))), val: v }));

    // Cálculo real de Correlación NxN y Dispersión 1 a 1
    const scatter: ScatterPoint[] = [];

    const sortBySeq = (a: any, b: any) => {
      const seqA = parseInt(a.Consecutivo) || 0;
      const seqB = parseInt(b.Consecutivo) || 0;
      return seqA - seqB;
    };

    if (secondaryData.length > 0) {
      // Ordenar secundario igual que el primario (por consecutivo)
      secondaryData.sort(sortBySeq);

      const valuesSecondary = secondaryData.map(d => {
        let valStr = String(d.Resultado || '0').replace(',', '.');
        return parseFloat(valStr);
      });

      const maxLen = Math.min(values.length, valuesSecondary.length);
      
      // Llenar scatter plot
      for (let i = 0; i < maxLen; i++) {
        scatter.push({ x: values[i], y: valuesSecondary[i] });
      }
    }

    // Matriz de Correlación NxN
    const uniqueIndicators = dynamicOptions.indicadores || [];
    const matrix: (number | null)[][] = [];

    // Agrupar baseData por indicador para mayor eficiencia
    const indicatorGroups: Record<string, any[]> = {};
    baseData.forEach((d: any) => {
      if (!d.Indicador) return;
      const rawName = String(d.Indicador);
      const target = rawName.toLowerCase().replace(/\s+/g, ' ').trim();
      const actualName = uniqueIndicators.find(ind => ind.toLowerCase().replace(/\s+/g, ' ').trim() === target) || rawName;
      if (!indicatorGroups[actualName]) indicatorGroups[actualName] = [];
      indicatorGroups[actualName].push(d);
    });

    const indicatorDataMap: Record<string, number[]> = {};
    uniqueIndicators.forEach(ind => {
      const group = indicatorGroups[ind] || [];
      group.sort(sortBySeq);
      indicatorDataMap[ind] = group.map(d => parseFloat(String(d.Resultado || '0').replace(',', '.')));
    });

    for (let i = 0; i < uniqueIndicators.length; i++) {
      const rowData = indicatorDataMap[uniqueIndicators[i]];
      const rowCorrelations: (number | null)[] = [];
      
      for (let j = 0; j < uniqueIndicators.length; j++) {
        if (i === j) {
          rowCorrelations.push(1.0);
        } else {
          const colData = indicatorDataMap[uniqueIndicators[j]];
          const maxLen = Math.min(rowData.length, colData.length);
          let pearsonR: number | null = null;
          
          if (maxLen > 1) {
            const meanX = rowData.slice(0, maxLen).reduce((a, b) => a + b, 0) / maxLen;
            const meanY = colData.slice(0, maxLen).reduce((a, b) => a + b, 0) / maxLen;
            let num = 0;
            let denX = 0;
            let denY = 0;
            for (let k = 0; k < maxLen; k++) {
              const dx = rowData[k] - meanX;
              const dy = colData[k] - meanY;
              num += dx * dy;
              denX += dx * dx;
              denY += dy * dy;
            }
            if (denX > 0 && denY > 0) {
              pearsonR = num / Math.sqrt(denX * denY);
            }
          }
          rowCorrelations.push(pearsonR);
        }
      }
      matrix.push(rowCorrelations);
    }

    const correlationsData: CorrelationMatrixData = {
      labels: uniqueIndicators,
      matrix: matrix
    };

    // Extracción dinámica de la unidad de medida (UM) del primer registro que la contenga
    let unidadMedida = '';
    const recordConUm = allData.find(d => d.UM && String(d.UM).trim() !== '');
    if (recordConUm) {
      unidadMedida = String(recordConUm.UM).trim();
    }

    return {
      options: dynamicOptions,
      unit: unidadMedida,
      kpis: {
        promedio: mean,
        desvEstandar: stdDev,
        cp: cpData.cp,
        cpk: cpData.cpk,
        pp: cpData.pp,
        ppk: cpData.ppk,
        fueraEsp: fueraEsp, 
        muestras: values.length
      },
      stats: {
        n: values.length,
        media: mean,
        mediana: median,
        min: Math.min(...values),
        max: Math.max(...values),
        desvEstandar: stdDev,
        cv: mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0,
        asimetria: 0,
        curtosis: 0
      },
      tendencia,
      xr,
      histogram: {
        bins: hist.bins,
        frequencies: hist.frequencies,
        curve: hist.curve
      },
      boxplot: { labels: equipos, series: boxplotSeries },
      scatter,
      qq,
      correlations: correlationsData,
      limits: { lsl, usl, ucl_x, lcl_x, ucl_r, lcl_r }
    };
  }
}
