import { apiHelpers } from '@/config/api';
import { API_ROUTES } from '@/constants/api-routes';
import { PaginatedResponse, Game, GameFilters, PopulatedGame } from '@/types';
import * as qs from 'qs-esm';

export const gameService = {
  getAll: async (filters: GameFilters): Promise<PaginatedResponse<PopulatedGame>> => {
    const queryParams: Record<string, any> = {
      depth: 2,
    };

    const where: Record<string, any> = {};

    if (filters.leagueId) {
      where.league = { equals: filters.leagueId };
    }

    if (filters.status) {
      where.status = { equals: filters.status };
    }

    if (filters.startTimeAfter) {
      where.startTime = { greater_than_equal: filters.startTimeAfter };
    }

    if (filters.startTimeBefore) {
      where.startTime = { ...where.startTime, less_than_equal: filters.startTimeBefore };
    }

    queryParams.page = filters.page || 1;
    queryParams.limit = filters.limit || 10;

    if (Object.keys(where).length > 0) {
      queryParams.where = where;
    }

    queryParams.sort = '-startTime';

    const queryString = qs.stringify(queryParams, { encode: false });
    return apiHelpers.get(`${API_ROUTES.GAMES.GET}?${queryString}`);
  },

  getById: async (id: string): Promise<PopulatedGame> => {
    return apiHelpers.get(`${API_ROUTES.GAMES.GET_BY_ID(id)}?depth=2`);
  },
};