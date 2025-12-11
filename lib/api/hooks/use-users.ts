import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { User, PaginatedResponse, QueryParams } from '../types';

const fetchUsers = async (params?: QueryParams): Promise<PaginatedResponse<User>> => {
  const { data } = await apiClient.get('/users', { params });
  return data;
};

const fetchUser = async (id: string): Promise<User> => {
  const { data } = await apiClient.get(`/users/${id}`);
  return data;
};

const createUser = async (user: Partial<User>): Promise<User> => {
  const { data } = await apiClient.post('/users', user);
  return data;
};

const updateUser = async ({ id, ...user }: Partial<User> & { id: string }): Promise<User> => {
  const { data } = await apiClient.patch(`/users/${id}`, user);
  return data;
};

const deleteUser = async (id: string): Promise<void> => {
  await apiClient.delete(`/users/${id}`);
};

export const useUsers = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => fetchUsers(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
