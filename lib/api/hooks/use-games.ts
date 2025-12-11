import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Game, PaginatedResponse, QueryParams } from '../types';

const fetchGames = async (params?: QueryParams): Promise<PaginatedResponse<Game>> => {
  const { data } = await apiClient.get('/games', { params });
  return data;
};

const fetchGame = async (id: string): Promise<Game> => {
  const { data } = await apiClient.get(`/games/${id}`);
  return data;
};

const createGame = async (game: Partial<Game>): Promise<Game> => {
  const { data } = await apiClient.post('/games', game);
  return data;
};

const updateGame = async ({ id, ...game }: Partial<Game> & { id: string }): Promise<Game> => {
  const { data } = await apiClient.patch(`/games/${id}`, game);
  return data;
};

const deleteGame = async (id: string): Promise<void> => {
  await apiClient.delete(`/games/${id}`);
};

export const useGames = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['games', params],
    queryFn: () => fetchGames(params),
  });
};

export const useGame = (id: string) => {
  return useQuery({
    queryKey: ['games', id],
    queryFn: () => fetchGame(id),
    enabled: !!id,
  });
};

export const useCreateGame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGame,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['games', variables.id] });
    },
  });
};

export const useDeleteGame = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    },
  });
};
