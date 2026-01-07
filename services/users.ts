import { apiHelpers } from '@/config/api';
import { API_ROUTES } from '@/constants/api-routes';
import { User, BuyBackEligibility, BuyBackCreditsResponse } from '@/types';

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await apiHelpers.get(API_ROUTES.USERS.GET_ME);

    console.log('[UserService] getMe response:', JSON.stringify(response, null, 2));

    // Extract user from the wrapped response
    // If response has a 'user' property, use it (even if null)
    // Otherwise assume response is already the user object
    if ('user' in response) {
      if (response.user === null) {
        console.error('[UserService] Backend returned null user - user not found in database');
        throw new Error('User not found in database. Please check backend /api/users/me endpoint.');
      }
      return response.user;
    }

    return response;
  },

  getById: async (id: string): Promise<User> => {
    return apiHelpers.get(API_ROUTES.USERS.GET_BY_ID(id));
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    return apiHelpers.patch(API_ROUTES.USERS.UPDATE(id), data);
  },

  checkBuyBackEligibility: async (): Promise<BuyBackEligibility> => {
    console.log('[userService] Checking buy-back eligibility...');
    const response = await apiHelpers.get(API_ROUTES.USERS.BUY_BACK_ELIGIBILITY);
    console.log('[userService] Eligibility response:', JSON.stringify(response, null, 2));
    return response;
  },

  buyBackCredits: async (): Promise<BuyBackCreditsResponse> => {
    console.log('[userService] Buying back credits...');
    const response = await apiHelpers.post(API_ROUTES.USERS.BUY_BACK_CREDITS);
    console.log('[userService] Buy-back response:', JSON.stringify(response, null, 2));
    return response;
  },
};
