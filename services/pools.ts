import { apiHelpers } from '@/config/api';
import { API_ROUTES } from '@/constants/api-routes';
import { Pool, PoolMembership, LeaderboardEntry, LeaderboardFilters, PaginatedResponse } from '@/types';

export const poolService = {
  getActivePool: async (): Promise<Pool | null> => {
    const response = await apiHelpers.get(API_ROUTES.POOLS.GET_ACTIVE);
    return response.docs[0] || null;
  },

  getMyPool: async (): Promise<PoolMembership | null> => {
    return apiHelpers.get(API_ROUTES.CUSTOM.MY_POOL);
  },

  getLeaderboard: async (filters: LeaderboardFilters): Promise<PaginatedResponse<LeaderboardEntry>> => {
    const queryParams = new URLSearchParams({
      page: String(filters.page || 1),
      limit: String(filters.limit || 100),
    });

    return apiHelpers.get(`${API_ROUTES.CUSTOM.LEADERBOARD(filters.poolId)}?${queryParams}`);
  },
};
