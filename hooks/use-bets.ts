import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { betService } from '@/services/bets';
import { BetFilters, PlaceBetRequest } from '@/types';
import { poolKeys } from './use-pools';
// import { toast } from 'sonner';

export const betKeys = {
  all: ['bets'] as const,
  lists: () => [...betKeys.all, 'list'] as const,
  list: (filters: BetFilters) => [...betKeys.lists(), JSON.stringify(filters)] as const,
  myBets: () => [...betKeys.all, 'my-bets'] as const,
};

export const useBets = (filters: BetFilters) => {
  return useQuery({
    queryKey: betKeys.list(filters),
    queryFn: () => betService.getAll(filters),
  });
};

export const useMyBets = () => {
  return useQuery({
    queryKey: betKeys.myBets(),
    queryFn: () => betService.getMyBets(),
  });
};

export const usePlaceBet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlaceBetRequest) => betService.placeBet(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: betKeys.all });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: poolKeys.all });
      console.log('Bet placed successfully!', data);
    //   toast.success('Bet placed successfully!', {
    //     description: `Remaining credits: ${data.remainingCredits}`,
    //   });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to place bet';
    console.error(errorMessage);
    //   toast.error('Bet failed', {
    //     description: errorMessage,
    //   });
    },
  });
};