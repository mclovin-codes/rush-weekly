import { useQuery } from '@tanstack/react-query';
import { getLeagues, GetLeaguesParams, LeaguesResponse } from '@/services/leagues';

export const useLeagues = (params?: GetLeaguesParams) => {
  return useQuery<LeaguesResponse>({
    queryKey: ['leagues', params],
    queryFn: () => getLeagues(params),
    staleTime: 1000 * 60 * 10, // 10 minutes - leagues don't change often
  });
};
