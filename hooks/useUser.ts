import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/users';
import { User, PopulatedBet } from '@/types';
import { authClient } from '@/lib/auth-client';
import { betService } from '@/services/bets';

/**
 * Hook to fetch current user's full data from the API
 */
export const useCurrentUser = () => {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery<User>({
    queryKey: ['current-user', userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('No user ID in session');
      }
      // Use GET by ID instead of GET ME since /api/users/me is broken
      console.log('[useCurrentUser] Fetching user by ID:', userId);
      return userService.getById(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to fetch user's betting statistics
 */
export const useUserStats = () => {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery<{
    totalBets: number;
    wonBets: number;
    lostBets: number;
    pushBets: number;
    pendingBets: number;
    winRate: number;
  }>({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) {
        return {
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          pushBets: 0,
          pendingBets: 0,
          winRate: 0,
        };
      }

      try {
        const response = await betService.getAll({
          userId,
          limit: 1000, // Get all user bets
        });

        const bets = response.docs || [];
        const wonBets = bets.filter((bet) => bet.status === 'won').length;
        const lostBets = bets.filter((bet) => bet.status === 'lost').length;
        const pushBets = bets.filter((bet) => bet.status === 'push').length;
        const pendingBets = bets.filter((bet) => bet.status === 'pending').length;
        const totalBets = bets.length;
        const settledBets = wonBets + lostBets;
        const winRate = settledBets > 0 ? Math.round((wonBets / settledBets) * 100) : 0;

        return {
          totalBets,
          wonBets,
          lostBets,
          pushBets,
          pendingBets,
          winRate,
        };
      } catch (error) {
        console.error('Error fetching user stats:', error);
        return {
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          pushBets: 0,
          pendingBets: 0,
          winRate: 0,
        };
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60, // 1 minute
  });
};
