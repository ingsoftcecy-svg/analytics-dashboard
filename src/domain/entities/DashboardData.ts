// src/domain/entities/DashboardData.ts

export interface KPIData {
  promedio: number;
  desvEstandar: number;
  cp: number;
  cpk: number;
  pp: number;
  ppk: number;
  fueraEsp: number; // percentage
  muestras: number;
}

export interface DescriptiveStats {
  n: number;
  media: number;
  mediana: number;
  min: number;
  max: number;
  desvEstandar: number;
  cv: number; // percentage
  asimetria: number;
  curtosis: number;
}

export interface TendenciaPoint {
  date: string;
  value: number;
}

export interface XRPoint {
  date: string;
  xValue: number;
  rValue: number;
}

export interface HistogramData {
  bins: string[];
  frequencies: number[];
  curve: number[];
}

export interface BoxPlotData {
  labels: string[];
  series: number[][]; // Each sub-array is data for one box
}

export interface ScatterPoint {
  x: number; // Temperature
  y: number; // Attenuation
}

export interface QQPoint {
  q: number; // Theoretical quantile
  val: number; // Attenuation
}

export interface CorrelationMatrixData {
  labels: string[];
  matrix: (number | null)[][];
}

export interface ChartLimits {
  lsl: number;
  usl: number;
  ucl_x: number;
  lcl_x: number;
  ucl_r: number;
  lcl_r: number;
}

export interface DashboardData {
  options?: {
    areas: string[];
    indicadores: string[];
    procesos: string[];
    marcas: string[];
    etapas: string[];
    puestos: string[];
    productos: string[];
    fermentadores: string[];
  };
  unit?: string;
  kpis: KPIData;
  stats: DescriptiveStats;
  tendencia: TendenciaPoint[];
  xr: XRPoint[];
  histogram: HistogramData;
  boxplot: BoxPlotData;
  scatter: ScatterPoint[];
  qq: QQPoint[];
  correlations: CorrelationMatrixData;
  limits: ChartLimits;
}
