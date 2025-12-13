import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@rush_onboarding_completed';

export const onboardingStorage = {
  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  },

  /**
   * Mark onboarding as completed
   */
  async markOnboardingComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
    }
  },

  /**
   * Clear onboarding status (for testing/reset purposes)
   */
  async clearOnboardingStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
    } catch (error) {
      console.error('Error clearing onboarding status:', error);
    }
  },
};
