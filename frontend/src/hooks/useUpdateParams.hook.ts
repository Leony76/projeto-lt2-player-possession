import { useCallback } from 'react';
import type { SetURLSearchParams } from 'react-router-dom';

type ParamsUpdates = Record<string, string | null>;

export const useUpdateParams = (
  setSearchParams: SetURLSearchParams
) => {

  const updateParams = useCallback((
    updates: ParamsUpdates
  ): void => {

    setSearchParams(prev => {
      const params = new URLSearchParams(prev);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      return params;
    });

  }, [setSearchParams]);

  return { updateParams };
};