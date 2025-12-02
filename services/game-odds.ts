import { apiHelpers } from '@/config/api';
import { API_ROUTES } from '@/constants/api-routes';
import { GameOdds, PopulatedGameOdds } from '@/types';

export const gameOddsService = {
  getByGameId: async (gameId: string): Promise<GameOdds[]> => {
    const response = await apiHelpers.get(API_ROUTES.GAME_ODDS.GET_BY_GAME(gameId));
    return response.docs;
  },

  getActiveOdds: async (gameId: string): Promise<GameOdds | null> => {
    const odds = await gameOddsService.getByGameId(gameId);
    return odds.find(o => o.isActive) || null;
  },
};