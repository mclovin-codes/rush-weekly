import { useQuery } from '@tanstack/react-query';
import { gameService } from '@/services/games';
import { GameFilters } from '@/types';

export const gameKeys = {
  all: ['games'] as const,
  lists: () => [...gameKeys.all, 'list'] as const,
  list: (filters: GameFilters) => [...gameKeys.lists(), JSON.stringify(filters)] as const,
  details: () => [...gameKeys.all, 'detail'] as const,
  detail: (id: string) => [...gameKeys.details(), id] as const,
};

export const useGames = (filters: GameFilters) => {
  return useQuery({
    queryKey: gameKeys.list(filters),
    queryFn: () => gameService.getAll(filters),
  });
};

export const useGameById = (id: string) => {
  return useQuery({
    queryKey: gameKeys.detail(id),
    queryFn: () => gameService.getById(id),
    enabled: !!id,
  });
};