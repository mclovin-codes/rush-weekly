import { useQuery } from '@tanstack/react-query';
import { poolService } from '@/services/pools';
import { Pool, PoolMembership, LeaderboardEntry, PaginatedResponse } from '@/types';

/**
 * Hook to fetch the active pool
 */
export const useActivePool = () => {
  return useQuery<Pool | null>({
    queryKey: ['active-pool'],
    queryFn: () => poolService.getActivePool(),
    staleTime: 1000 * 60 * 5, // 5 minutes - pool info doesn't change often
  });
};

/**
 * Hook to fetch current user's pool membership
 */
export const useMyPool = () => {
  return useQuery<PoolMembership | null>({
    queryKey: ['my-pool'],
    queryFn: () => poolService.getMyPool(),
    staleTime: 1000 * 60, // 1 minute - membership info changes when bets are placed
    retry: 1, // Only retry once if it fails
  });
};

/**
 * Hook to fetch leaderboard for a specific pool
 */
export const useLeaderboard = (poolId: string | null | undefined, options?: { limit?: number }) => {
  return useQuery<PaginatedResponse<LeaderboardEntry>>({
    queryKey: ['leaderboard', poolId, options?.limit],
    queryFn: () => {
      if (!poolId) {
        throw new Error('Pool ID is required');
      }
      return poolService.getLeaderboard({
        poolId,
        limit: options?.limit || 100,
      });
    },
    enabled: !!poolId, // Only fetch when we have a pool ID
    staleTime: 1000 * 30, // 30 seconds - leaderboard updates frequently
  });
};
