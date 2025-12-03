import { ScrollView, StyleSheet, View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';

import { Colors, Fonts, Typography } from '@/constants/theme';
import { authClient } from "@/lib/auth-client";


export default function AccountScreen() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [notifications, setNotifications] = useState({
    newWeek: true,
    gameResults: true,
    rankChanges: false,
    friendActivity: true,
    betReminders: true,
    prizeAlerts: true,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    allowFriendRequests: true,
    showInLeaderboard: true,
    shareResults: false,
  });

  // Calculate subscription metrics
  const currentPlan = 'Weekly Pass';
  const renewalDate = 'Monday, Nov 30';
  const daysUntilRenewal = 3;
  const planPrice = '$25';
  const planBenefits = ['Full competition access', 'Unlimited bets', 'Prize eligibility', 'Premium features'];

  const signOut = async () => {
    try {
      // Sign out from better-auth
      await authClient.signOut();

      

      // Navigate to auth screen
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
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>ACCOUNT SETTINGS</Text>

        {/* Subscription Overview */}
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View style={styles.subscriptionLeft}>
              <Text style={styles.planName}>{currentPlan}</Text>
              <Text style={styles.planStatus}>ACTIVE</Text>
            </View>
            <View style={styles.subscriptionRight}>
              <Text style={styles.planPrice}>{planPrice}</Text>
              <Text style={styles.renewalInfo}>Renews in {daysUntilRenewal} days</Text>
            </View>
          </View>

          <View style={styles.subscriptionDetails}>
            <Text style={styles.renewalDate}>Next renewal: {renewalDate}</Text>
            <View style={styles.benefitsList}>
              {planBenefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={styles.benefitText}>• {benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.manageButton}>
            <Text style={styles.manageButtonText}>MANAGE MEMBERSHIP</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Account Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT MANAGEMENT</Text>

        <View style={styles.managementGrid}>
          <TouchableOpacity style={styles.managementItem}>
            <View style={styles.managementIcon}>
              <Ionicons name="card" size={20} color={Colors.dark.tint} />
            </View>
            <View style={styles.managementContent}>
              <Text style={styles.managementTitle}>Payment Methods</Text>
              <Text style={styles.managementSubtitle}>•••• 4242</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.managementItem}>
            <View style={styles.managementIcon}>
              <Ionicons name="receipt" size={20} color={Colors.dark.tint} />
            </View>
            <View style={styles.managementContent}>
              <Text style={styles.managementTitle}>Transaction History</Text>
              <Text style={styles.managementSubtitle}>View all payments</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.managementItem}>
            <View style={styles.managementIcon}>
              <Ionicons name="wallet" size={20} color={Colors.dark.tint} />
            </View>
            <View style={styles.managementContent}>
              <Text style={styles.managementTitle}>Buy-Back Credits</Text>
              <Text style={styles.managementSubtitle}>Available: 2</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NOTIFICATION PREFERENCES</Text>

        <View style={styles.preferenceGroup}>
          <Text style={styles.groupTitle}>Competition Alerts</Text>
          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>New week started</Text>
              <Text style={styles.preferenceDescription}>Get notified when new competitions begin</Text>
            </View>
            <Switch
              value={notifications.newWeek}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, newWeek: value }))}
              trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
              thumbColor={Colors.dark.text}
              ios_backgroundColor={Colors.dark.cardElevated}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Game results</Text>
              <Text style={styles.preferenceDescription}>Instant updates for completed games</Text>
            </View>
            <Switch
              value={notifications.gameResults}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, gameResults: value }))}
              trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
              thumbColor={Colors.dark.text}
              ios_backgroundColor={Colors.dark.cardElevated}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Rank changes</Text>
              <Text style={styles.preferenceDescription}>Movement in leaderboard standings</Text>
            </View>
            <Switch
              value={notifications.rankChanges}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, rankChanges: value }))}
              trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
              thumbColor={Colors.dark.text}
              ios_backgroundColor={Colors.dark.cardElevated}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceInfo}>
              <Text style={styles.preferenceLabel}>Prize alerts</Text>
              <Text style={styles.preferenceDescription}>When you qualify for prize zone</Text>
            </View>
            <Switch
              value={notifications.prizeAlerts}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, prizeAlerts: value }))}
              trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
              thumbColor={Colors.dark.text}
              ios_backgroundColor={Colors.dark.cardElevated}
            />
          </View>
        </View>

     
      </View>

  

      {/* Account Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT ACTIONS</Text>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.primaryAction}>
            <View style={styles.primaryActionIcon}>
              <Ionicons name="person-outline" size={20} color={Colors.dark.text} />
            </View>
            <View style={styles.primaryActionContent}>
              <Text style={styles.primaryActionTitle}>Edit Profile</Text>
              <Text style={styles.primaryActionSubtitle}>Update your information</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryAction}>
            <View style={styles.secondaryActionIcon}>
              <Ionicons name="pause-circle" size={20} color={Colors.dark.text} />
            </View>
            <View style={styles.secondaryActionContent}>
              <Text style={styles.secondaryActionTitle}>Pause Membership</Text>
              <Text style={styles.secondaryActionSubtitle}>Temporarily stop billing</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutAction} onPress={handleLogout}>
            <View style={styles.logoutActionIcon}>
              <Ionicons name="log-out" size={20} color={Colors.dark.warning} />
            </View>
            <View style={styles.logoutActionContent}>
              <Text style={styles.logoutActionTitle}>Logout</Text>
              <Text style={styles.logoutActionSubtitle}>Sign out of your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.dark.warning} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerAction}>
            <View style={styles.dangerActionIcon}>
              <Ionicons name="alert-circle" size={20} color={Colors.dark.danger} />
            </View>
            <View style={styles.dangerActionContent}>
              <Text style={styles.dangerActionTitle}>Danger Zone</Text>
              <Text style={styles.dangerActionSubtitle}>Account deletion & cancellation</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.dark.danger} />
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  screenTitle: {
    ...Typography.title.large,
    color: Colors.dark.text,
    letterSpacing: 3,
    marginBottom: 20,
    fontFamily: Fonts.display,
  },

  // Subscription Card
  subscriptionCard: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subscriptionLeft: {
    flex: 1,
  },
  planName: {
    ...Typography.teamName.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 4,
  },
  planStatus: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.success,
    textTransform: 'uppercase',
  },
  subscriptionRight: {
    alignItems: 'flex-end',
  },
  planPrice: {
    ...Typography.title.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 2,
  },
  renewalInfo: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  subscriptionDetails: {
    marginBottom: 20,
  },
  renewalDate: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
  },
  benefitsList: {
    gap: 6,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  manageButton: {
    backgroundColor: Colors.dark.tint,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  manageButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    letterSpacing: 0.5,
  },

  // Section
  section: {
    backgroundColor: Colors.dark.card,
    marginTop: 16,
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionTitle: {
    ...Typography.sectionHeader.medium,
    color: Colors.dark.text,
    marginBottom: 20,
    fontFamily: Fonts.display,
  },

  // Management Grid
  managementGrid: {
    gap: 12,
  },
  managementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  managementIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.dark.tint + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
  },
  managementContent: {
    flex: 1,
  },
  managementTitle: {
    ...Typography.body.medium,
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    marginBottom: 2,
  },
  managementSubtitle: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  managementArrow: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
  },

  // Preferences
  preferenceGroup: {
    marginBottom: 20,
  },
  groupTitle: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    marginBottom: 2,
  },
  preferenceDescription: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },

  // Privacy Grid
  privacyGrid: {
    gap: 16,
  },
  privacyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  privacyLabel: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    flex: 1,
  },
  privacyToggle: {
    marginLeft: 16,
  },

  // Legal Grid
  legalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legalItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  legalTitle: {
    ...Typography.body.medium,
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  legalSubtitle: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },

  // Actions
  actionGrid: {
    gap: 16,
  },

  // Primary Action
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardElevated,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 16,
  },
  primaryActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.dark.tint + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.tint + '30',
  },
  primaryActionContent: {
    flex: 1,
  },
  primaryActionTitle: {
    ...Typography.body.medium,
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    marginBottom: 2,
  },
  primaryActionSubtitle: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },

  // Secondary Action
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardElevated,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 16,
  },
  secondaryActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.dark.text + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryActionContent: {
    flex: 1,
  },
  secondaryActionTitle: {
    ...Typography.body.medium,
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    marginBottom: 2,
  },
  secondaryActionSubtitle: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },

  // Logout Action
  logoutAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.warning + '15',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.warning + '40',
    gap: 16,
  },
  logoutActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.dark.warning + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutActionContent: {
    flex: 1,
  },
  logoutActionTitle: {
    ...Typography.body.medium,
    ...Typography.emphasis.medium,
    color: Colors.dark.warning,
    marginBottom: 2,
  },
  logoutActionSubtitle: {
    ...Typography.body.small,
    color: Colors.dark.warning + '80',
  },

  // Danger Action
  dangerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.danger + '15',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.danger + '40',
    gap: 16,
  },
  dangerActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.dark.danger + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerActionContent: {
    flex: 1,
  },
  dangerActionTitle: {
    ...Typography.body.medium,
    ...Typography.emphasis.medium,
    color: Colors.dark.danger,
    marginBottom: 2,
  },
  dangerActionSubtitle: {
    ...Typography.body.small,
    color: Colors.dark.danger + '80',
  },

  bottomPadding: {
    height: 40,
  },
});