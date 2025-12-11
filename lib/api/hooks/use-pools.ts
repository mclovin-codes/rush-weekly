import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Pool, PaginatedResponse, QueryParams } from '../types';

const fetchPools = async (params?: QueryParams): Promise<PaginatedResponse<Pool>> => {
  const { data } = await apiClient.get('/pools', { params });
  return data;
};

const fetchPool = async (id: string): Promise<Pool> => {
  const { data } = await apiClient.get(`/pools/${id}`);
  return data;
};

const createPool = async (pool: Partial<Pool>): Promise<Pool> => {
  const { data } = await apiClient.post('/pools', pool);
  return data;
};

const updatePool = async ({ id, ...pool }: Partial<Pool> & { id: string }): Promise<Pool> => {
  const { data } = await apiClient.patch(`/pools/${id}`, pool);
  return data;
};

const deletePool = async (id: string): Promise<void> => {
  await apiClient.delete(`/pools/${id}`);
};

export const usePools = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['pools', params],
    queryFn: () => fetchPools(params),
  });
};

export const usePool = (id: string) => {
  return useQuery({
    queryKey: ['pools', id],
    queryFn: () => fetchPool(id),
    enabled: !!id,
  });
};

export const useCreatePool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pools'] });
    },
  });
};

export const useUpdatePool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePool,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pools'] });
      queryClient.invalidateQueries({ queryKey: ['pools', variables.id] });
    },
  });
};

export const useDeletePool = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePool,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pools'] });
    },
  });
};
