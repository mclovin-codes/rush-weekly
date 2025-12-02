import { useQuery } from '@tanstack/react-query';
import { poolService } from '@/services/pools';
import { LeaderboardFilters } from '@/types';

export const poolKeys = {
  all: ['pools'] as const,
  active: () => [...poolKeys.all, 'active'] as const,
  myPool: () => [...poolKeys.all, 'my-pool'] as const,
  leaderboard: (poolId: string) => [...poolKeys.all, 'leaderboard', poolId] as const,
};

export const useActivePool = () => {
  return useQuery({
    queryKey: poolKeys.active(),
    queryFn: () => poolService.getActivePool(),
  });
};

export const useMyPool = () => {
  return useQuery({
    queryKey: poolKeys.myPool(),
    queryFn: () => poolService.getMyPool(),
  });
};

export const useLeaderboard = (filters: LeaderboardFilters) => {
  return useQuery({
    queryKey: poolKeys.leaderboard(filters.poolId),
    queryFn: () => poolService.getLeaderboard(filters),
    enabled: !!filters.poolId,
  });
};
