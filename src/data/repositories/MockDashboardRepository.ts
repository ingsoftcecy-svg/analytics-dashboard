// src/data/repositories/MockDashboardRepository.ts
import type { DashboardData, TendenciaPoint, XRPoint, ScatterPoint, QQPoint } from '../../domain/entities/DashboardData';
import type { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';

export class MockDashboardRepository implements IDashboardRepository {
  async getDashboardData(): Promise<DashboardData> {
    // Simulamos un retraso de red para ver el estado de carga
    await new Promise(resolve => setTimeout(resolve, 800));

    // 1. Tendencia (16 valores de la captura)
    const tendenciaVals = [17.58, 16.37, 13.18, 14.98, 13.98, 15.00, 11.40, 21.20, 15.60, 15.18, 14.98, 14.98, 11.88, 16.58, 16.18, 16.98];
    const tendencia: TendenciaPoint[] = tendenciaVals.map((val, i) => ({ date: `Lote ${i + 1}`, value: val }));

    // 2. XR
    const xData = [16.97, 14.08, 13.20, 18.40, 15.08, 14.28, 16.38, 16.98];
    const rData = [1.21, 1.80, 3.60, 5.60, 0.62, 3.10, 0.40, 0.00];
    const xr: XRPoint[] = xData.map((val, i) => ({ date: `Sub ${i + 1}`, xValue: val, rValue: rData[i] }));

    // 3. Scatter (generamos una vez para la carga)
    const scatter: ScatterPoint[] = Array.from({length: 16}, (_, i) => {
      const volumen = 500 + Math.random() * 200;
      return { x: volumen, y: tendenciaVals[i] };
    });

    // 4. QQ
    const qq: QQPoint[] = Array.from({length: 16}, (_, i) => {
      const q = -2 + (i * 0.26);
      const val = 15.38 + q * 2.22 + (Math.random() * 0.5 - 0.25);
      return { q, val };
    });

    return {
      options: {
        areas: ['Cocimientos', 'Fermentación'],
        indicadores: ['Tiempo Calentamiento'],
        procesos: ['Molienda'],
        marcas: ['Corona'],
        etapas: ['Mosto Caliente'],
        puestos: [],
        productos: [],
        fermentadores: []
      },
      unit: 'min',
      kpis: {
        promedio: 15.38,
        desvEstandar: 2.22,
        cp: 1.15,
        cpk: 1.02,
        pp: 1.08,
        ppk: 0.95,
        fueraEsp: 6.25,
        muestras: 16
      },
      stats: {
        n: 16,
        media: 15.38,
        mediana: 15.09,
        min: 11.40,
        max: 21.20,
        desvEstandar: 2.22,
        cv: 14.43,
        asimetria: 0.85,
        curtosis: 1.20
      },
      tendencia,
      xr,
      histogram: {
        bins: ['11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'],
        frequencies: [2, 1, 2, 4, 3, 2, 1, 0, 0, 0, 1, 0],
        curve: [1.2, 1.5, 2.8, 3.5, 4.0, 3.5, 2.8, 1.5, 0.8, 0.3, 1.2, 0]
      },
      boxplot: {
        labels: ['Olla 1', 'Olla 2', 'Olla 3', 'Olla 4'],
        series: [
          [11.88, 13.5, 15, 16, 16.98],
          [11.40, 13.18, 13.98, 16.18, 17.58],
          [14.98, 14.98, 15.00, 15.18, 21.20],
          [14.98, 15.5, 16, 16.5, 16.58]
        ]
      },
      scatter,
      qq,
      correlations: {
        labels: ['Tiempo Calentamiento', 'Temperatura Inicial', 'pH'],
        matrix: [
          [1.0, -0.73, 0.45],
          [-0.73, 1.0, -0.12],
          [0.45, -0.12, 1.0]
        ]
      },
      limits: {
        lsl: 10, usl: 20, ucl_x: 18, lcl_x: 12, ucl_r: 5, lcl_r: 0
      }
    };
  }
}
