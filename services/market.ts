import { apiHelpers } from '@/config/api';
import { MarketGame, MarketGamesFilters } from '@/types';
import * as qs from 'qs-esm';

export const marketService = {
  /**
   * Fetch games with odds included from the market API
   * This replaces the need for separate games + odds calls
   *
   * @param filters - Filter options for games
   * @returns Array of MarketGame objects with odds included
   */
  getGames: async (filters: MarketGamesFilters): Promise<MarketGame[]> => {
    const queryParams: Record<string, any> = {};

    if (filters.leagueID) {
      queryParams.leagueID = filters.leagueID;
    }

    if (filters.status) {
      queryParams.status = filters.status;
    }

    if (filters.oddsAvailable !== undefined) {
      queryParams.oddsAvailable = filters.oddsAvailable;
    }

    if (filters.limit) {
      queryParams.limit = filters.limit;
    }

    const queryString = qs.stringify(queryParams, { encode: false });
    const endpoint = `/api/market/games${queryString ? `?${queryString}` : ''}`;

    return apiHelpers.get(endpoint);
  },
};
