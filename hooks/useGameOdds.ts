import { useQuery } from '@tanstack/react-query';
import { gameOddsService } from '@/services/game-odds';
import { GameOdds } from '@/types';

/**
 * Hook to fetch active odds for a specific game
 */
export const useGameOdds = (gameId: string | undefined) => {
  return useQuery<GameOdds | null>({
    queryKey: ['game-odds', gameId],
    queryFn: async () => {
      if (!gameId) return null;
      return gameOddsService.getActiveOdds(gameId);
    },
    enabled: !!gameId,
    staleTime: 1000 * 60 * 2, // 2 minutes - odds change frequently
  });
};
