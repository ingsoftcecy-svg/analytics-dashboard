// src/data/repositories/MockDashboardRepository.ts
import type { DashboardData, TendenciaPoint, XRPoint, ScatterPoint, QQPoint } from '../../domain/entities/DashboardData';
import type { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';

export class MockDashboardRepository implements IDashboardRepository {
  async getDashboardData(): Promise<DashboardData> {
    // Simulamos un retraso de red para ver el estado de carga
    await new Promise(resolve => setTimeout(resolve, 800));

    // 1. Tendencia
    const tendenciaVals = [77.5, 78.2, 78.1, 77.8, 79.1, 78.5, 76.9, 78.8, 80.2, 78.4, 78.1, 79.5, 78.0, 77.6, 78.9, 79.4, 80.5, 77.1, 76.5, 78.4, 79.0, 80.1];
    const tendencia: TendenciaPoint[] = tendenciaVals.map((val, i) => ({ date: `May ${i + 1}`, value: val }));

    // 2. XR
    const xData = [79.5, 78.8, 79.1, 79.9, 80.2, 78.4, 79.6, 78.9, 79.4, 80.5, 79.1, 78.5, 79.4, 78.8];
    const rData = [1.2, 1.5, 0.8, 1.9, 2.1, 0.5, 1.1, 0.9, 1.4, 2.5, 1.0, 0.7, 1.3, 1.0];
    const xr: XRPoint[] = xData.map((val, i) => ({ date: `May ${i + 1}`, xValue: val, rValue: rData[i] }));

    // 3. Scatter (generamos una vez para la carga)
    const scatter: ScatterPoint[] = Array.from({length: 100}, () => {
      const temp = 16 + Math.random() * 8;
      const atenuacion = 60 + temp * 0.8 + (Math.random() * 4 - 2);
      return { x: temp, y: atenuacion };
    });

    // 4. QQ
    const qq: QQPoint[] = Array.from({length: 30}, (_, i) => {
      const q = -3 + (i * 0.2);
      const val = 78.64 + q * 1.48 + (Math.random() * 0.5 - 0.25);
      return { q, val };
    });

    return {
      kpis: {
        promedio: 78.64,
        desvEstandar: 1.48,
        cp: 1.67,
        cpk: 1.52,
        pp: 1.61,
        ppk: 1.46,
        fueraEsp: 0.27,
        muestras: 125
      },
      stats: {
        n: 125,
        media: 78.64,
        mediana: 78.70,
        min: 74.80,
        max: 81.30,
        desvEstandar: 1.48,
        cv: 1.88,
        asimetria: -0.15,
        curtosis: -0.32
      },
      tendencia,
      xr,
      histogram: {
        bins: ['73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84'],
        frequencies: [1, 2, 5, 10, 18, 26, 21, 15, 8, 4, 1, 0],
        curve: [0.5, 1.5, 4, 9.5, 17, 26.5, 20, 14, 7.5, 3.5, 1, 0.2]
      },
      boxplot: {
        labels: ['F-01', 'F-02', 'F-03', 'F-04', 'F-05', 'F-06', 'F-07', 'F-08'],
        series: [
          [76, 78, 79, 80, 82], // F-01
          [77, 78.5, 79.5, 80.5, 81.5], // F-02
          [75, 77.5, 79, 80, 81], // F-03
          [76, 78, 79.5, 81, 82], // F-04
          [77, 78.5, 79.8, 81, 82.5], // F-05
          [76.5, 78, 79.2, 80.5, 82], // F-06
          [77, 78.2, 79.1, 80.1, 81.5], // F-07
          [75, 77, 78.5, 79.5, 80.5]  // F-08
        ]
      },
      scatter,
      qq,
      correlations: [
        { variable: 'pH', ph: 1.00, temp: -0.62, fan: 0.41, o2: -0.31, tiempo: 0.22, atenuacion: -0.58, esteres: 0.35 },
        { variable: 'Temp. (°C)', ph: -0.62, temp: 1.00, fan: -0.55, o2: 0.48, tiempo: -0.33, atenuacion: 0.83, esteres: -0.40 },
        { variable: 'FAN', ph: 0.41, temp: -0.55, fan: 1.00, o2: -0.28, tiempo: 0.65, atenuacion: 0.62, esteres: 0.58 },
        { variable: 'O2 (ppb)', ph: -0.31, temp: 0.48, fan: -0.28, o2: 1.00, tiempo: -0.25, atenuacion: -0.32, esteres: -0.15 },
        { variable: 'Tiempo', ph: 0.22, temp: -0.33, fan: 0.65, o2: -0.25, tiempo: 1.00, atenuacion: 0.45, esteres: 0.30 },
        { variable: 'Atenuación', ph: -0.58, temp: 0.83, fan: 0.62, o2: -0.32, tiempo: 0.45, atenuacion: 1.00, esteres: -0.50 },
        { variable: 'Ésteres', ph: 0.35, temp: -0.40, fan: 0.58, o2: -0.15, tiempo: 0.30, atenuacion: -0.50, esteres: 1.00 }
      ]
    };
  }
}
