import { useQuery } from '@tanstack/react-query';
import { marketService } from '@/services/market';
import { MarketGame, MarketGamesFilters } from '@/types';

/**
 * Hook to fetch games with odds from the market API
 * This is optimized to fetch both games and odds in a single API call
 *
 * Performance: 1 API call instead of 1 + N calls (where N = number of games)
 */
export const useMarketGames = (filters: MarketGamesFilters) => {
  return useQuery<MarketGame[]>({
    queryKey: ['market-games', filters],
    queryFn: () => marketService.getGames(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes - odds change frequently
    enabled: !!filters.leagueID, // Only fetch when we have a league selected
  });
};
