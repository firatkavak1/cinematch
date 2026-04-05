import { useQuery } from '@tanstack/react-query';

import { fetchRandomMovie } from '../domain/api';

export const useRandomMovie = (enabled: boolean, options?: { yearFrom?: number; yearTo?: number }) => {
  return useQuery({
    queryKey: ['randomMovie', options?.yearFrom, options?.yearTo, Date.now()],
    queryFn: () => fetchRandomMovie(options),
    enabled,
    retry: 1,
    staleTime: 0,
    gcTime: 0,
  });
};
