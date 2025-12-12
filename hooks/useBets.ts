import { useQuery } from '@tanstack/react-query';
import { betService } from '@/services/bets';
import { PopulatedBet, BetFilters, PaginatedResponse } from '@/types';
import { authClient } from '@/lib/auth-client';

/**
 * Hook to fetch current user's bets
 * Uses the standard bets endpoint with user filter
 */
export const useMyBets = () => {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery<PopulatedBet[]>({
    queryKey: ['my-bets', userId],
    queryFn: async () => {
      if (!userId) {
        console.warn('No user ID found, returning empty bets');
        return [];
      }

      try {
        const response = await betService.getAll({
          userId: userId,
          limit: 100, // Get all user's bets
        });

        return response.docs || [];
      } catch (error) {
        console.error('Error fetching user bets:', error);
        return [];
      }
    },
    enabled: !!userId, // Only run query if we have a user ID
    staleTime: 1000 * 30, // 30 seconds - bets data should be relatively fresh
  });
};

/**
 * Hook to fetch bets with filters
 */
export const useBets = (filters: BetFilters) => {
  return useQuery<PaginatedResponse<PopulatedBet>>({
    queryKey: ['bets', filters],
    queryFn: () => betService.getAll(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
};
