import { apiHelpers } from '@/config/api';
import { API_ROUTES } from '@/constants/api-routes';
import { User } from '@/types';

export const userService = {
  getMe: async (): Promise<User> => {
    return apiHelpers.get(API_ROUTES.USERS.GET_ME);
  },

  getById: async (id: string): Promise<User> => {
    return apiHelpers.get(API_ROUTES.USERS.GET_BY_ID(id));
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    return apiHelpers.patch(API_ROUTES.USERS.UPDATE(id), data);
  },
};
