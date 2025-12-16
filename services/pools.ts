import { apiHelpers } from '@/config/api';
import { API_ROUTES } from '@/constants/api-routes';
import { Pool, PoolMembership, LeaderboardEntry, LeaderboardFilters, PaginatedResponse } from '@/types';
import * as qs from 'qs-esm';

export const poolService = {
  getActivePool: async (): Promise<Pool | null> => {
    const response = await apiHelpers.get(API_ROUTES.POOLS.GET_ACTIVE);
    return response.docs[0] || null;
  },

  getMyPool: async (userId: string): Promise<PoolMembership | null> => {
    // Build query to get user's membership in the active pool
    const queryParams = {
      where: {
        user: { equals: userId },
        'pool.isActive': { equals: true },
      },
      depth: 1,
    };

    const queryString = qs.stringify(queryParams, { encode: false });
    const response = await apiHelpers.get(`${API_ROUTES.POOL_MEMBERSHIPS.GET}?${queryString}`);

    return response.docs?.[0] || null;
  },

  getLeaderboard: async (filters: LeaderboardFilters): Promise<PaginatedResponse<LeaderboardEntry>> => {
    // Build query to get all memberships for a pool, sorted by score
    const queryParams = {
      where: {
        pool: { equals: filters.poolId },
      },
      sort: '-score',
      depth: 1,
      page: filters.page || 1,
      limit: filters.limit || 100,
    };

    const queryString = qs.stringify(queryParams, { encode: false });
    return apiHelpers.get(`${API_ROUTES.POOL_MEMBERSHIPS.GET}?${queryString}`);
  },
};
