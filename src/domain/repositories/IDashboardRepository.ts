// src/domain/repositories/IDashboardRepository.ts
import type { DashboardData } from '../entities/DashboardData';

export interface DashboardFilters {
  pilar?: string;
  indicador?: string;
  indicadorCorrelacion?: string;
  planta?: string;
  area?: string;
  proceso?: string;
  marca?: string;
  etapa?: string;
  puesto?: string;
  producto?: string;
  fermentador?: string;
  customLSL?: number;
  customUSL?: number;
  customUCL_X?: number;
  customLCL_X?: number;
  customUCL_R?: number;
  customLCL_R?: number;
}

export interface IDashboardRepository {
  getDashboardData(filters?: DashboardFilters): Promise<DashboardData>;
}
