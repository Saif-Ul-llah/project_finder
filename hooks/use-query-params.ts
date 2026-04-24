'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateQueryParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const getParam = useCallback(
    (key: string, defaultValue?: string | number) => {
      return searchParams.get(key) || defaultValue;
    },
    [searchParams]
  );

  const getNumericParam = useCallback(
    (key: string, defaultValue: number = 1) => {
      const value = searchParams.get(key);
      return value ? parseInt(value, 10) : defaultValue;
    },
    [searchParams]
  );

  return {
    updateQueryParams,
    getParam,
    getNumericParam,
    searchParams,
  };
}
