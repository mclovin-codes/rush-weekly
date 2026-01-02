import { ScrollView, StyleSheet, View, Text, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';

import { Colors, Fonts, Typography } from '@/constants/theme';
import { authClient } from "@/lib/auth-client";
import { apiHelpers } from "@/config/api";
import { API_ROUTES } from "@/constants/api-routes";
import { useCurrentUser } from '@/hooks/useUser';
import { useActivePool, useMyPool } from '@/hooks/usePools';
import MembershipBottomSheet, { MembershipBottomSheetRef } from '@/components/MembershipBottomSheet';
import BuyBackCreditsBottomSheet, { BuyBackCreditsBottomSheetRef } from '@/components/BuyBackCreditsBottomSheet';

export default function AccountScreen() {
  console.log('[AccountScreen] Component rendering');

  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: currentUser, isLoading: isLoadingUser, refetch: refetchUser } = useCurrentUser();
  const { refetch: refetchActivePool } = useActivePool();
  const { refetch: refetchMyPool } = useMyPool();
  const membershipBottomSheetRef = useRef<MembershipBottomSheetRef>(null);
  const buyBackCreditsBottomSheetRef = useRef<BuyBackCreditsBottomSheetRef>(null);

 
  const [notifications, setNotifications] = useState({
    newWeek: true,
    gameResults: true,
    rankChanges: false,
  });

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isActivatingMembership, setIsActivatingMembership] = useState(false);
  const [isPurchasingCredits, setIsPurchasingCredits] = useState(false);

  // Check if subscription is active
  const isSubscriptionActive = currentUser?.is_paid_member &&
    currentUser?.subscription_end_date &&
    new Date(currentUser.subscription_end_date) > new Date();

  // Format subscription renewal date
  const getSubscriptionRenewalText = () => {
    if (!currentUser?.subscription_end_date) return 'Not subscribed';

    const endDate = new Date(currentUser.subscription_end_date);
    const now = new Date();

    if (endDate < now) {
      return 'Expired';
    }

    // Calculate days remaining
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 7) {
      return `Expires in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
    }

    return `Renews ${endDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`;
  };

  const signOut = async () => {
    try {
      await authClient.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error("Sign out error:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleDeleteAccount = () => {
    // First confirmation
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeletion,
        },
      ]
    );
  };

  const confirmDeletion = () => {
    // Second confirmation for safety
    Alert.alert(
      'Final Confirmation',
      'This will permanently delete:\n\n• Your account\n• All your bets\n• Your pool memberships\n• All personal data\n\nThis cannot be undone. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: performDeletion,
        },
      ]
    );
  };

  const performDeletion = async () => {
    setIsDeletingAccount(true);

    try {
      // Step 1: Delete from Better Auth first
      await (authClient as any).deleteUser({
        callbackURL: '/(auth)/login', // Redirect after deletion
      });

      // Step 2: Call the backend delete-account endpoint
      // This will cascade delete all related data (bets, pool memberships, etc.)
      await apiHelpers.delete('/api/users/delete-account');

      // Step 3: Show success message and redirect
      Alert.alert(
        'Account Deleted',
        'Your account has been permanently deleted.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Redirect to login screen
              router.replace('/(auth)/login');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error('Account deletion error:', error);
      setIsDeletingAccount(false);

      Alert.alert(
        'Deletion Failed',
        error?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleActivateMembership = async (duration: 'week' | 'month' | 'year') => {
    console.log('========================================');
    console.log('[AccountScreen] MEMBERSHIP ACTIVATION STARTED');
    console.log('[AccountScreen] Session data:', JSON.stringify(session, null, 2));
    console.log('[AccountScreen] User ID:', currentUser?.id);
    console.log('[AccountScreen] Session user ID:', session?.user?.id);
    console.log('[AccountScreen] Session token:', session?.session?.token);
    console.log('[AccountScreen] Current user data:', JSON.stringify(currentUser, null, 2));

    // Test session validity
    console.log('[AccountScreen] Testing session validity...');
    try {
      const sessionTest = await apiHelpers.get(API_ROUTES.USERS.GET_ME);
      console.log('[AccountScreen] ✅ Session test passed, user:', sessionTest?.username);
    } catch (sessionError) {
      console.error('[AccountScreen] ❌ Session test failed:', sessionError);
    }
    console.log('========================================');

    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to activate membership');
      return;
    }

    if (!currentUser?.id) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    setIsActivatingMembership(true);

    try {
      // Step 1: Calculate subscription end date
      const now = new Date();
      const endDate = new Date(now);

      switch (duration) {
        case 'week':
          endDate.setDate(endDate.getDate() + 7);
          break;
        case 'month':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'year':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      console.log('[AccountScreen] Subscription end date:', endDate.toISOString());

      // Step 2: Check for existing active pool or create one
      console.log('[AccountScreen] Checking for active pools...');
      const activePools = await apiHelpers.get(API_ROUTES.POOLS.GET_ACTIVE);
      console.log('[AccountScreen] Active pools response:', activePools);

      let poolId: string;
      let poolName: string;
      let isNewPool = false;

      if (activePools?.docs && activePools.docs.length > 0) {
        // Join existing active pool
        const existingPool = activePools.docs[0];
        poolId = existingPool.id;
        poolName = existingPool.name || `Pool ${existingPool.id.slice(0, 8)}`;
        console.log('[AccountScreen] Found existing active pool:', poolName);
        console.log('[AccountScreen] Pool ID:', poolId);
        console.log('[AccountScreen] Full pool data:', JSON.stringify(existingPool, null, 2));
      } else {
        // No active pool exists, create a new one
        console.log('[AccountScreen] No active pool found, creating new pool...');
        isNewPool = true;

        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const poolData = {
          name: `Weekly Pool - ${weekStart.toLocaleDateString()}`,
          week_start: weekStart.toISOString(),
          week_end: weekEnd.toISOString(),
          is_active: true,
          initialCredits: 1000,
          entryFee: 0,
        };

        const newPool = await apiHelpers.post(API_ROUTES.POOLS.CREATE, poolData);
        poolId = newPool.id || newPool.doc?.id;
        poolName = poolData.name;

        if (!poolId) {
          throw new Error('Failed to create pool');
        }

        console.log('[AccountScreen] Created new pool:', poolName);
      }

      // Step 3: Activate membership and add credits
      console.log('========================================');
      console.log('[AccountScreen] STEP 3: ACTIVATING MEMBERSHIP & ADDING CREDITS');
      const currentCredits = currentUser.current_credits || currentUser.credits || 0;
      const newCredits = currentCredits + 1000; // Add 1000 credits to current balance

      console.log('[AccountScreen] BEFORE UPDATE:');
      console.log('[AccountScreen]   Current credits:', currentCredits);
      console.log('[AccountScreen]   Credits to add: 1000');
      console.log('[AccountScreen]   New total will be:', newCredits);

      const updatePayload = {
        is_paid_member: true,
        subscription_end_date: endDate.toISOString(),
        current_credits: newCredits,
      };
      console.log('[AccountScreen] Update payload:', JSON.stringify(updatePayload, null, 2));
      console.log('[AccountScreen] Update URL:', `/api/users/${currentUser.id}`);

      // Try custom endpoint first, fallback to direct patch
      let updateResponse;
      try {
        // Try custom activation endpoint that has proper permissions
        console.log('[AccountScreen] Trying custom activation endpoint...');
        console.log('[AccountScreen] Endpoint:', API_ROUTES.USERS.ACTIVATE_MEMBERSHIP);
        console.log('[AccountScreen] Payload:', JSON.stringify({ duration, credits_to_add: 1000 }, null, 2));

        updateResponse = await apiHelpers.post(API_ROUTES.USERS.ACTIVATE_MEMBERSHIP, {
          duration,
          credits_to_add: 1000,
        });

        console.log('[AccountScreen] ✅ Used custom activation endpoint successfully');
      } catch (customEndpointError: any) {
        console.error('[AccountScreen] ❌ Custom endpoint failed:', customEndpointError);
        console.error('[AccountScreen] Error response:', customEndpointError?.response?.data);
        console.error('[AccountScreen] Error status:', customEndpointError?.response?.status);

        // If it's an auth error, don't fallback - throw it
        if (customEndpointError?.response?.status === 401) {
          throw new Error('Authentication failed. Please log out and log back in.');
        }

        console.log('[AccountScreen] ⚠️ Custom endpoint not available, trying direct patch...');
        // Fallback to direct patch (will likely fail with permissions error)
        updateResponse = await apiHelpers.patch(`/api/users/${currentUser.id}`, updatePayload);
      }

      console.log('[AccountScreen] AFTER UPDATE:');
      console.log('[AccountScreen] API Response:', JSON.stringify(updateResponse, null, 2));
      console.log('[AccountScreen] Response credits:', updateResponse?.current_credits);

      // Verify the update was successful
      if (!updateResponse?.current_credits) {
        console.error('[AccountScreen] ❌ Update failed - no credits in response!');
        throw new Error('Failed to update credits. Response: ' + JSON.stringify(updateResponse));
      }

      console.log('[AccountScreen] ✅ Credits updated successfully to:', updateResponse.current_credits);
      console.log('========================================');

      // Step 4: Check if user already has membership in this pool
      console.log('[AccountScreen] Checking for existing pool membership...');
      try {
        const existingMembership = await apiHelpers.get(
          `${API_ROUTES.POOL_MEMBERSHIPS.GET}?where[pool][equals]=${poolId}&where[user][equals]=${currentUser.id}`
        );

        if (existingMembership?.docs && existingMembership.docs.length > 0) {
          console.log('[AccountScreen] User already has membership in this pool, skipping creation');
        } else {
          // Create pool membership
          console.log('[AccountScreen] Creating pool membership...');
          const membershipData = {
            pool: poolId,
            user: currentUser.id,
            score: 0,
            initial_credits_at_start: 1000,
          };

          await apiHelpers.post(API_ROUTES.POOL_MEMBERSHIPS.CREATE, membershipData);
          console.log('[AccountScreen] Pool membership created successfully!');
        }
      } catch (membershipError: any) {
        // If it's a duplicate error, that's okay
        if (membershipError?.response?.status === 409 || membershipError?.message?.includes('duplicate')) {
          console.log('[AccountScreen] Membership already exists (caught duplicate error)');
        } else {
          throw membershipError;
        }
      }

      // Refresh all data to update UI
      console.log('========================================');
      console.log('[AccountScreen] STEP 5: REFRESHING ALL DATA');
      console.log('[AccountScreen] Starting refetch...');

      const refetchResults = await Promise.all([
        refetchUser(),
        refetchActivePool(),
        refetchMyPool(),
      ]);

      console.log('[AccountScreen] Refetch complete!');
      console.log('[AccountScreen] User refetch result:', refetchResults[0]?.data?.current_credits);
      console.log('[AccountScreen] Active pool refetch result:', refetchResults[1]?.data?.id);
      console.log('[AccountScreen] My pool refetch result:', refetchResults[2]?.data?.id);
      console.log('========================================');

      // Close bottom sheet
      membershipBottomSheetRef.current?.close();

      console.log('========================================');
      console.log('[AccountScreen] SUCCESS! MEMBERSHIP ACTIVATED');
      console.log('[AccountScreen] Expected credits:', newCredits);
      console.log('[AccountScreen] Actual credits from API:', updateResponse.current_credits);
      console.log('[AccountScreen] Pool:', poolName);
      console.log('[AccountScreen] Was new pool?', isNewPool);
      console.log('========================================');

      // Use actual credits from API response
      const finalCredits = updateResponse.current_credits || newCredits;
      const creditsAdded = finalCredits - currentCredits;

      // Show success message
      const successMessage = isNewPool
        ? `Welcome to RUSH!\n\nPool: ${poolName || 'Active Pool'}\n\n+${creditsAdded.toLocaleString()} credits added!\nNew balance: ${finalCredits.toLocaleString()} credits\n\nGood luck!`
        : `Welcome to RUSH!\n\nYou've joined: ${poolName || 'Active Pool'}\n\n+${creditsAdded.toLocaleString()} credits added!\nNew balance: ${finalCredits.toLocaleString()} credits\n\nGood luck!`;

      console.log('[AccountScreen] Showing success alert:', successMessage);

      Alert.alert(
        'Membership Activated! 🎉',
        successMessage,
        [{
          text: 'Get Started',
          onPress: () => {
            console.log('[AccountScreen] User clicked Get Started, navigating to home...');
            router.replace('/(app)/(tabs)');
          }
        }]
      );
    } catch (error: any) {
      console.error('[AccountScreen] Membership activation error:', error);
      console.error('[AccountScreen] Error details:', JSON.stringify(error, null, 2));
      console.error('[AccountScreen] Error response:', error?.response?.data);

      const errorMessage = error?.response?.data?.error
        || error?.response?.data?.message
        || error?.message
        || 'Something went wrong. Please try again.';

      Alert.alert(
        'Activation Failed',
        `Error: ${errorMessage}\n\nCheck the console for more details.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsActivatingMembership(false);
    }
  };

  const handlePurchaseCredits = async (amount: number) => {
    if (!currentUser?.id) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    setIsPurchasingCredits(true);

    try {
      // Add 1000 credits to current balance (testing phase)
      const currentCredits = currentUser.current_credits || currentUser.credits || 0;
      const creditsToAdd = 1000;
      const newCredits = currentCredits + creditsToAdd;

      console.log('[AccountScreen] Adding credits:', creditsToAdd);
      console.log('[AccountScreen] Current balance:', currentCredits);
      console.log('[AccountScreen] New balance:', newCredits);

      // Call API to add credits
      await apiHelpers.patch(`/api/users/${currentUser.id}`, {
        current_credits: newCredits,
      });

      // Close bottom sheet
      buyBackCreditsBottomSheetRef.current?.close();

      // Refresh user data
      await refetchUser();

      // Show success message
      Alert.alert(
        'Credits Added!',
        `+${creditsToAdd.toLocaleString()} credits added for testing purposes.\n\nNew balance: ${newCredits.toLocaleString()} credits`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Credits purchase error:', error);
      Alert.alert(
        'Purchase Failed',
        error?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsPurchasingCredits(false);
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>SETTINGS</Text>
      </View>

      {isLoadingUser ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.tint} />
          <Text style={styles.loadingText}>Loading account...</Text>
        </View>
      ) : (
        <>
          {/* User Info */}
          <View style={styles.section}>
            <View style={styles.userInfoCard}>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Username</Text>
                <Text style={styles.userInfoValue}>{currentUser?.username || session?.user?.name || 'User'}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Email</Text>
                <Text style={styles.userInfoValue}>{currentUser?.email || session?.user?.email}</Text>
              </View>
              <View style={[styles.userInfoRow, styles.userInfoRowLast]}>
                <Text style={styles.userInfoLabel}>Credits Balance</Text>
                <Text style={[styles.userInfoValue, styles.creditsValue]}>
                  {currentUser?.current_credits || currentUser?.credits || 0}
                </Text>
              </View>
            </View>
          </View>

          {/* Weekly Pass Card */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
            <View style={styles.passCard}>
              <View style={styles.passHeader}>
                <View>
                  <Text style={styles.passTitle}>Weekly Pass</Text>
                  <Text style={[
                    styles.passStatus,
                    !isSubscriptionActive && styles.passStatusInactive
                  ]}>
                    {isSubscriptionActive ? 'ACTIVE' : 'INACTIVE'}
                  </Text>
                </View>
                {isSubscriptionActive && (
                  <View style={styles.passIcon}>
                    <Ionicons name="checkmark-circle" size={32} color={Colors.dark.success} />
                  </View>
                )}
              </View>

              <Text style={styles.passRenewal}>{getSubscriptionRenewalText()}</Text>

              {!isSubscriptionActive ? (
                <TouchableOpacity
                  style={styles.activateButton}
                  onPress={() => {
                    console.log('Activate button pressed');
                    membershipBottomSheetRef.current?.open();
                  }}
                >
                  <Text style={styles.activateButtonText}>Activate Membership</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.manageButton}>
                  <Text style={styles.manageButtonText}>Manage Membership</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            console.log('Buy-Back Credits pressed');
            buyBackCreditsBottomSheetRef.current?.open();
          }}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="wallet-outline" size={20} color={Colors.dark.tint} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Buy-Back Credits</Text>
            <Text style={styles.menuSubtitle}>Reload your credits balance</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(auth)/forgot-password')}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="lock-closed-outline" size={20} color={Colors.dark.tint} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Change Password</Text>
            <Text style={styles.menuSubtitle}>Update your password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>New week started</Text>
            <Text style={styles.settingDescription}>When new pools begin</Text>
          </View>
          <Switch
            value={notifications.newWeek}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, newWeek: value }))}
            trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
            thumbColor={Colors.dark.text}
            ios_backgroundColor={Colors.dark.cardElevated}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Game results</Text>
            <Text style={styles.settingDescription}>Updates for completed games</Text>
          </View>
          <Switch
            value={notifications.gameResults}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, gameResults: value }))}
            trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
            thumbColor={Colors.dark.text}
            ios_backgroundColor={Colors.dark.cardElevated}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Rank changes</Text>
            <Text style={styles.settingDescription}>Leaderboard movements</Text>
          </View>
          <Switch
            value={notifications.rankChanges}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, rankChanges: value }))}
            trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
            thumbColor={Colors.dark.text}
            ios_backgroundColor={Colors.dark.cardElevated}
          />
        </View>
      </View> */}

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(app)/terms-of-service')}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="document-text-outline" size={20} color={Colors.dark.tint} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(app)/privacy-policy')}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.dark.tint} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(app)/help-support')}
        >
          <View style={styles.menuIcon}>
            <Ionicons name="help-circle-outline" size={20} color={Colors.dark.tint} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.dark.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, isDeletingAccount && styles.deleteButtonDisabled]}
          onPress={handleDeleteAccount}
          disabled={isDeletingAccount}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.dark.danger} />
          <Text style={styles.deleteText}>
            {isDeletingAccount ? 'Deleting Account...' : 'Delete Account'}
          </Text>
        </TouchableOpacity>
      </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Membership Activation Bottom Sheet */}
      <MembershipBottomSheet
        ref={membershipBottomSheetRef}
        onActivate={handleActivateMembership}
        isLoading={isActivatingMembership}
      />

      {/* Buy-Back Credits Bottom Sheet */}
      <BuyBackCreditsBottomSheet
        ref={buyBackCreditsBottomSheetRef}
        onPurchase={handlePurchaseCredits}
        isLoading={isPurchasingCredits}
        currentCredits={currentUser?.current_credits || 0}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    backgroundColor: Colors.dark.card,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  screenTitle: {
    ...Typography.title.large,
    color: Colors.dark.text,
    letterSpacing: 2,
    fontFamily: Fonts.display,
  },

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  loadingText: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    marginTop: 16,
  },

  // User Info Card
  userInfoCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  userInfoRowLast: {
    borderBottomWidth: 0,
  },
  userInfoLabel: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
  },
  userInfoValue: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
  },
  creditsValue: {
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 18,
  },

  // Weekly Pass Card
  passCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  passTitle: {
    ...Typography.title.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 4,
  },
  passStatus: {
    ...Typography.meta.small,
    color: Colors.dark.success,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  passStatusInactive: {
    color: Colors.dark.textSecondary,
  },
  passIcon: {
    marginLeft: 12,
  },
  passPrice: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
  },
  passRenewal: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
  },
  manageButton: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  manageButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    letterSpacing: 0.5,
  },
  activateButton: {
    backgroundColor: Colors.dark.success,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activateButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    letterSpacing: 0.5,
  },

  // Section
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
    letterSpacing: 1,
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.dark.tint + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },

  // Setting Items (with switches)
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    marginBottom: 2,
  },
  settingDescription: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },

  // Action Buttons
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.danger,
    gap: 8,
  },
  logoutText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.danger,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.danger + '15',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.danger,
    gap: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.danger,
  },

  bottomPadding: {
    height: 40,
  },
});