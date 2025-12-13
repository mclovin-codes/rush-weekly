import { ScrollView, StyleSheet, View, Text, Switch, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import { useRouter } from 'expo-router';

import { Colors, Fonts, Typography } from '@/constants/theme';
import { authClient } from "@/lib/auth-client";
import { apiHelpers } from "@/config/api";
import { useCurrentUser } from '@/hooks/useUser';
import MembershipBottomSheet, { MembershipBottomSheetRef } from '@/components/MembershipBottomSheet';
import BuyBackCreditsBottomSheet, { BuyBackCreditsBottomSheetRef } from '@/components/BuyBackCreditsBottomSheet';

export default function AccountScreen() {
  console.log('[AccountScreen] Component rendering');

  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { data: currentUser, isLoading: isLoadingUser, refetch: refetchUser } = useCurrentUser();
  const membershipBottomSheetRef = useRef<MembershipBottomSheetRef>(null);
  const buyBackCreditsBottomSheetRef = useRef<BuyBackCreditsBottomSheetRef>(null);

  console.log('[AccountScreen] Membership ref current:', !!membershipBottomSheetRef.current);
  console.log('[AccountScreen] BuyBack ref current:', !!buyBackCreditsBottomSheetRef.current);

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
    if (!currentUser?.id) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    setIsActivatingMembership(true);

    try {
      // Calculate subscription end date based on duration
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

      // Call API to activate membership
      await apiHelpers.patch(`/api/users/${currentUser.id}`, {
        is_paid_member: true,
        subscription_end_date: endDate.toISOString(),
        current_credits: currentUser.current_credits || 1000,
      });

      // Close bottom sheet
      membershipBottomSheetRef.current?.close();

      // Refresh user data
      await refetchUser();

      // Show success message
      Alert.alert(
        'Membership Activated!',
        `Your ${duration}ly membership has been activated. Welcome to RUSH!`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Membership activation error:', error);
      Alert.alert(
        'Activation Failed',
        error?.message || 'Something went wrong. Please try again.',
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
      // Calculate new credit balance
      const newCredits = (currentUser.current_credits || 0) + amount;

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
        `Successfully added ${amount.toLocaleString()} credits to your account.\n\nNew balance: ${newCredits.toLocaleString()} credits`,
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
      <View style={styles.section}>
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
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="document-text-outline" size={20} color={Colors.dark.tint} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="shield-checkmark-outline" size={20} color={Colors.dark.tint} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
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