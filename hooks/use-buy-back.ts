import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/users';
import { BuyBackEligibility, BuyBackCreditsResponse } from '@/types';

export const buyBackKeys = {
  all: ['buyBack'] as const,
  eligibility: () => [...buyBackKeys.all, 'eligibility'] as const,
};

export const useBuyBackEligibility = () => {
  return useQuery({
    queryKey: buyBackKeys.eligibility(),
    queryFn: async (): Promise<BuyBackEligibility> => {
      console.log('[useBuyBackEligibility] Fetching eligibility...');
      const response = await userService.checkBuyBackEligibility();
      console.log('[useBuyBackEligibility] Parsed eligibility:', {
        eligible: response.eligible,
        pl: response.pl,
        message: response.message,
        reason: response.reason,
        amount: response.amount,
        daysRemaining: response.daysRemaining,
      });
      return response;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useBuyBackCredits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<BuyBackCreditsResponse> => {
      return await userService.buyBackCredits();
    },
    onSuccess: (data) => {
      // Invalidate and refetch eligibility
      queryClient.invalidateQueries({ queryKey: buyBackKeys.eligibility() });
      // Invalidate user queries to refresh credits
      queryClient.invalidateQueries({ queryKey: ['user'] });
      console.log('[useBuyBackCredits] Buy-back successful!', data);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        'Failed to buy back credits';
      console.error('[useBuyBackCredits] Buy-back failed:', errorMessage);
    },
  });
};

export const useBuyBack = () => {
  const { data: eligibility, isLoading: checking, refetch } = useBuyBackEligibility();
  const buyBack = useBuyBackCredits();

  const handleBuyBack = async () => {
    console.log('[useBuyBack] Initiating buy-back...');
    return await buyBack.mutateAsync();
  };

  const refreshEligibility = async () => {
    console.log('[useBuyBack] Refreshing eligibility...');
    await refetch();
  };

  const result = {
    eligibility: eligibility || null,
    checking,
    buying: buyBack.isPending,
    buyBack: handleBuyBack,
    checkEligibility: refreshEligibility,
  };

  console.log('[useBuyBack] Hook state:', {
    eligibility: result.eligibility,
    checking: result.checking,
    buying: result.buying,
  });

  return result;
};
