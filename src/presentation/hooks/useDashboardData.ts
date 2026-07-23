// src/presentation/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import type { DashboardData } from '../../domain/entities/DashboardData';
import type { IDashboardRepository, DashboardFilters } from '../../domain/repositories/IDashboardRepository';

export const useDashboardData = (repository: IDashboardRepository, filters?: DashboardFilters) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await repository.getDashboardData(filters);
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error fetching data'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repository, filters?.pilar, filters?.indicador, filters?.indicadorCorrelacion, filters?.area, filters?.planta, filters?.proceso, filters?.marca, filters?.etapa, filters?.puesto, filters?.producto, filters?.fermentador, filters?.customLSL, filters?.customUSL, filters?.customUCL_X, filters?.customLCL_X, filters?.customUCL_R, filters?.customLCL_R]);

  return { data, isLoading, error };
};
