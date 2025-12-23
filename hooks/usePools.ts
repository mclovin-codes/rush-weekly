import { useQuery } from '@tanstack/react-query';
import { poolService } from '@/services/pools';
import { Pool, PoolMembership, PaginatedResponse } from '@/types';
import { authClient } from '@/lib/auth-client';

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
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery<PoolMembership | null>({
    queryKey: ['my-pool', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return poolService.getMyPool(userId);
    },
    enabled: !!userId, // Only fetch when we have a user ID
    staleTime: 1000 * 60, // 1 minute - membership info changes when bets are placed
    retry: 1, // Only retry once if it fails
  });
};

/**
 * Hook to fetch leaderboard for a specific pool
 * Returns pool memberships sorted by score (descending)
 * Rank calculation is done on the frontend
 */
export const useLeaderboard = (poolId: string | null | undefined, options?: { limit?: number }) => {
  return useQuery<PaginatedResponse<PoolMembership>>({
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
