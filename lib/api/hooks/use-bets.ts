import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { Bet, PaginatedResponse, QueryParams } from '../types';

const fetchBets = async (params?: QueryParams): Promise<PaginatedResponse<Bet>> => {
  const { data } = await apiClient.get('/bets', { params });
  return data;
};

const fetchBet = async (id: string): Promise<Bet> => {
  const { data } = await apiClient.get(`/bets/${id}`);
  return data;
};

const createBet = async (bet: Partial<Bet>): Promise<Bet> => {
  const { data } = await apiClient.post('/bets', bet);
  return data;
};

const updateBet = async ({ id, ...bet }: Partial<Bet> & { id: string }): Promise<Bet> => {
  const { data } = await apiClient.patch(`/bets/${id}`, bet);
  return data;
};

const deleteBet = async (id: string): Promise<void> => {
  await apiClient.delete(`/bets/${id}`);
};

export const useBets = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['bets', params],
    queryFn: () => fetchBets(params),
  });
};

export const useBet = (id: string) => {
  return useQuery({
    queryKey: ['bets', id],
    queryFn: () => fetchBet(id),
    enabled: !!id,
  });
};

export const useCreateBet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateBet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBet,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
      queryClient.invalidateQueries({ queryKey: ['bets', variables.id] });
    },
  });
};

export const useDeleteBet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bets'] });
    },
  });
};
