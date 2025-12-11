import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Team, PaginatedResponse, QueryParams } from '../types';

const fetchTeams = async (params?: QueryParams): Promise<PaginatedResponse<Team>> => {
  const { data } = await apiClient.get('/teams', { params });
  return data;
};

const fetchTeam = async (id: string): Promise<Team> => {
  const { data } = await apiClient.get(`/teams/${id}`);
  return data;
};

const createTeam = async (team: Partial<Team>): Promise<Team> => {
  const { data } = await apiClient.post('/teams', team);
  return data;
};

const updateTeam = async ({ id, ...team }: Partial<Team> & { id: string }): Promise<Team> => {
  const { data } = await apiClient.patch(`/teams/${id}`, team);
  return data;
};

const deleteTeam = async (id: string): Promise<void> => {
  await apiClient.delete(`/teams/${id}`);
};

export const useTeams = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['teams', params],
    queryFn: () => fetchTeams(params),
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => fetchTeam(id),
    enabled: !!id,
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTeam,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', variables.id] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};
