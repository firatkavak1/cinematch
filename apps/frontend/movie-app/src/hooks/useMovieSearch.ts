import { useMutation } from '@tanstack/react-query';

import { searchMovies } from '../domain/api';

export const useMovieSearch = () => {
  return useMutation({
    mutationFn: (query: string) => searchMovies(query),
  });
};
