import { useQuery } from '@tanstack/react-query';
import { gameService } from '@/services/games';
import { GameFilters, PaginatedResponse, PopulatedGame } from '@/types';

export const useGames = (filters: GameFilters) => {
  return useQuery<PaginatedResponse<PopulatedGame>>({
    queryKey: ['games', filters],
    queryFn: () => gameService.getAll(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes - games data changes more frequently
  });
};

export const useGame = (gameId: string) => {
  return useQuery<PopulatedGame>({
    queryKey: ['game', gameId],
    queryFn: () => gameService.getById(gameId),
    enabled: !!gameId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
