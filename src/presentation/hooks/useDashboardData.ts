// src/presentation/hooks/useDashboardData.ts
import { useState, useEffect } from 'react';
import type { DashboardData } from '../../domain/entities/DashboardData';
import type { IDashboardRepository } from '../../domain/repositories/IDashboardRepository';

export const useDashboardData = (repository: IDashboardRepository) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await repository.getDashboardData();
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
  }, [repository]);

  return { data, isLoading, error };
};
