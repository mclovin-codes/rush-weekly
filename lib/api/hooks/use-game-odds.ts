import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { GameOdds, PaginatedResponse, QueryParams } from '../types';

const fetchGameOdds = async (params?: QueryParams): Promise<PaginatedResponse<GameOdds>> => {
  const { data } = await apiClient.get('/game-odds', { params });
  return data;
};

const fetchGameOdd = async (id: string): Promise<GameOdds> => {
  const { data } = await apiClient.get(`/game-odds/${id}`);
  return data;
};

const createGameOdd = async (gameOdd: Partial<GameOdds>): Promise<GameOdds> => {
  const { data } = await apiClient.post('/game-odds', gameOdd);
  return data;
};

const updateGameOdd = async ({ id, ...gameOdd }: Partial<GameOdds> & { id: string }): Promise<GameOdds> => {
  const { data } = await apiClient.patch(`/game-odds/${id}`, gameOdd);
  return data;
};

const deleteGameOdd = async (id: string): Promise<void> => {
  await apiClient.delete(`/game-odds/${id}`);
};

export const useGameOdds = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['game-odds', params],
    queryFn: () => fetchGameOdds(params),
  });
};

export const useGameOdd = (id: string) => {
  return useQuery({
    queryKey: ['game-odds', id],
    queryFn: () => fetchGameOdd(id),
    enabled: !!id,
  });
};

export const useCreateGameOdd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGameOdd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-odds'] });
    },
  });
};

export const useUpdateGameOdd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGameOdd,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['game-odds'] });
      queryClient.invalidateQueries({ queryKey: ['game-odds', variables.id] });
    },
  });
};

export const useDeleteGameOdd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGameOdd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-odds'] });
    },
  });
};
