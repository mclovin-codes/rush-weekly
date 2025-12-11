import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Sport, PaginatedResponse, QueryParams } from '../types';

const fetchSports = async (params?: QueryParams): Promise<PaginatedResponse<Sport>> => {
  const { data } = await apiClient.get('/sports', { params });
  return data;
};

const fetchSport = async (id: string): Promise<Sport> => {
  const { data } = await apiClient.get(`/sports/${id}`);
  return data;
};

const createSport = async (sport: Partial<Sport>): Promise<Sport> => {
  const { data } = await apiClient.post('/sports', sport);
  return data;
};

const updateSport = async ({ id, ...sport }: Partial<Sport> & { id: string }): Promise<Sport> => {
  const { data } = await apiClient.patch(`/sports/${id}`, sport);
  return data;
};

const deleteSport = async (id: string): Promise<void> => {
  await apiClient.delete(`/sports/${id}`);
};

export const useSports = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['sports', params],
    queryFn: () => fetchSports(params),
  });
};

export const useSport = (id: string) => {
  return useQuery({
    queryKey: ['sports', id],
    queryFn: () => fetchSport(id),
    enabled: !!id,
  });
};

export const useCreateSport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
    },
  });
};

export const useUpdateSport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSport,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
      queryClient.invalidateQueries({ queryKey: ['sports', variables.id] });
    },
  });
};

export const useDeleteSport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sports'] });
    },
  });
};
