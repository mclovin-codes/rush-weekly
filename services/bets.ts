import { apiHelpers } from '@/config/api';
import { API_ROUTES } from '@/constants/api-routes';
import {
  PaginatedResponse,
  Bet,
  BetFilters,
  PopulatedBet,
  PlaceBetRequest,
  PlaceBetResponse,
  PlaceParlayRequest,
  PlaceParlayResponse
} from '@/types';
import * as qs from 'qs-esm';

export const betService = {
  getAll: async (filters: BetFilters): Promise<PaginatedResponse<PopulatedBet>> => {
    const queryParams: Record<string, any> = {
      depth: 3,
    };

    const where: Record<string, any> = {};

    if (filters.userId) {
      where.user = { equals: filters.userId };
    }

    if (filters.poolId) {
      where.pool = { equals: filters.poolId };
    }

    if (filters.gameId) {
      where.game = { equals: filters.gameId };
    }

    if (filters.status) {
      where.status = { equals: filters.status };
    }

    queryParams.page = filters.page || 1;
    queryParams.limit = filters.limit || 20;

    if (Object.keys(where).length > 0) {
      queryParams.where = where;
    }

    queryParams.sort = '-createdAt';

    const queryString = qs.stringify(queryParams, { encode: false });
    return apiHelpers.get(`${API_ROUTES.BETS.GET}?${queryString}`);
  },

  placeBet: async (data: PlaceBetRequest): Promise<PlaceBetResponse> => {
    return apiHelpers.post(API_ROUTES.BETS.PLACE, data);
  },

  getMyBets: async (): Promise<PopulatedBet[]> => {
    try {
      const response = await apiHelpers.get(`${API_ROUTES.CUSTOM.MY_BETS}?depth=3`);

      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      }

      if (response?.docs && Array.isArray(response.docs)) {
        return response.docs;
      }

      // Return empty array if no data
      console.warn('Unexpected response format from my-bets:', response);
      return [];
    } catch (error) {
      console.error('Error fetching my bets:', error);
      return [];
    }
  },

  placeParlay: async (data: PlaceParlayRequest): Promise<PlaceParlayResponse> => {
    console.log('=== placeParlay SERVICE ===');
    console.log('API URL:', API_ROUTES.BETS.PARLAY);
    console.log('Request data:', JSON.stringify(data, null, 2));
    const response = await apiHelpers.post(API_ROUTES.BETS.PARLAY, data);
    console.log('Raw response from apiHelpers.post:', response);
    return response;
  },
};