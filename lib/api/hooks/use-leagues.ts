import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { League, PaginatedResponse, QueryParams } from '../types';

const fetchLeagues = async (params?: QueryParams): Promise<PaginatedResponse<League>> => {
  const { data } = await apiClient.get('/leagues', { params });
  return data;
};

const fetchLeague = async (id: string): Promise<League> => {
  const { data } = await apiClient.get(`/leagues/${id}`);
  return data;
};

const createLeague = async (league: Partial<League>): Promise<League> => {
  const { data } = await apiClient.post('/leagues', league);
  return data;
};

const updateLeague = async ({ id, ...league }: Partial<League> & { id: string }): Promise<League> => {
  const { data } = await apiClient.patch(`/leagues/${id}`, league);
  return data;
};

const deleteLeague = async (id: string): Promise<void> => {
  await apiClient.delete(`/leagues/${id}`);
};

export const useLeagues = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['leagues', params],
    queryFn: () => fetchLeagues(params),
  });
};

export const useLeague = (id: string) => {
  return useQuery({
    queryKey: ['leagues', id],
    queryFn: () => fetchLeague(id),
    enabled: !!id,
  });
};

export const useCreateLeague = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLeague,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
    },
  });
};

export const useUpdateLeague = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLeague,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
      queryClient.invalidateQueries({ queryKey: ['leagues', variables.id] });
    },
  });
};

export const useDeleteLeague = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLeague,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leagues'] });
    },
  });
};
