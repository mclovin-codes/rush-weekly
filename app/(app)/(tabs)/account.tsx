import { ScrollView, StyleSheet, View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

import { Colors, Fonts, Typography } from '@/constants/theme';
import { authClient } from "@/lib/auth-client";
import { apiHelpers } from "@/config/api";

export default function AccountScreen() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [notifications, setNotifications] = useState({
    newWeek: true,
    gameResults: true,
    rankChanges: false,
  });

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

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

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>SETTINGS</Text>
      </View>

      {/* Weekly Pass Card */}
      <View style={styles.section}>
        <View style={styles.passCard}>
          <View style={styles.passHeader}>
            <View>
              <Text style={styles.passTitle}>Weekly Pass</Text>
              <Text style={styles.passStatus}>ACTIVE</Text>
            </View>
            <Text style={styles.passPrice}>$25</Text>
          </View>
          
          <Text style={styles.passRenewal}>Renews Monday, Nov 30</Text>
          
          <TouchableOpacity style={styles.manageButton}>
            <Text style={styles.manageButtonText}>Manage Membership</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <Ionicons name="wallet-outline" size={20} color={Colors.dark.tint} />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Buy-Back Credits</Text>
            <Text style={styles.menuSubtitle}>Reload your credits balance</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
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