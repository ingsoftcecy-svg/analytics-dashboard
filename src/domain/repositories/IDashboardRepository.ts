// src/domain/repositories/IDashboardRepository.ts
// src/domain/repositories/IDashboardRepository.ts
import type { DashboardData } from '../entities/DashboardData';

export interface IDashboardRepository {
  getDashboardData(): Promise<DashboardData>;
}
