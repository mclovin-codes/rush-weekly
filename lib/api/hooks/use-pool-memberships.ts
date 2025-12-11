import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { PoolMembership, PaginatedResponse, QueryParams } from '../types';

const fetchPoolMemberships = async (params?: QueryParams): Promise<PaginatedResponse<PoolMembership>> => {
  const { data } = await apiClient.get('/pool-memberships', { params });
  return data;
};

const fetchPoolMembership = async (id: string): Promise<PoolMembership> => {
  const { data } = await apiClient.get(`/pool-memberships/${id}`);
  return data;
};

const createPoolMembership = async (membership: Partial<PoolMembership>): Promise<PoolMembership> => {
  const { data } = await apiClient.post('/pool-memberships', membership);
  return data;
};

const updatePoolMembership = async ({ id, ...membership }: Partial<PoolMembership> & { id: string }): Promise<PoolMembership> => {
  const { data } = await apiClient.patch(`/pool-memberships/${id}`, membership);
  return data;
};

const deletePoolMembership = async (id: string): Promise<void> => {
  await apiClient.delete(`/pool-memberships/${id}`);
};

export const usePoolMemberships = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['pool-memberships', params],
    queryFn: () => fetchPoolMemberships(params),
  });
};

export const usePoolMembership = (id: string) => {
  return useQuery({
    queryKey: ['pool-memberships', id],
    queryFn: () => fetchPoolMembership(id),
    enabled: !!id,
  });
};

export const useCreatePoolMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPoolMembership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool-memberships'] });
    },
  });
};

export const useUpdatePoolMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePoolMembership,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pool-memberships'] });
      queryClient.invalidateQueries({ queryKey: ['pool-memberships', variables.id] });
    },
  });
};

export const useDeletePoolMembership = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePoolMembership,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pool-memberships'] });
    },
  });
};
