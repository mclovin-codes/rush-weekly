import { ScrollView, StyleSheet, View, Text, Switch } from 'react-native';
import React, { useState } from 'react';

import { Colors, Fonts } from '@/constants/theme';

export default function AccountScreen() {
  const [notifications, setNotifications] = useState({
    newWeek: true,
    gameResults: true,
    rankChanges: false,
    friendActivity: true,
  });

  const [settings, setSettings] = useState({
    darkTheme: true,
  });

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>ACCOUNT</Text>
      </View>

      {/* Subscription Status Card */}
      <View style={styles.section}>
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <Text style={styles.subscriptionEmoji}>🎟️</Text>
            <Text style={styles.subscriptionStatus}>ACTIVE SUBSCRIPTION</Text>
          </View>
          <View style={styles.subscriptionDetails}>
            <Text style={styles.subscriptionPlan}>Weekly Pass</Text>
            <Text style={styles.subscriptionRenewal}>Renews: Monday, Nov 30</Text>
          </View>
          <View style={styles.manageButton}>
            <Text style={styles.manageButtonText}>Manage Subscription</Text>
          </View>
        </View>
      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Payment Method on File</Text>
          <Text style={styles.menuItemValue}>•••• 4242</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Purchase History</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Buy-Back Credits</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>New week started</Text>
          <Switch
            value={notifications.newWeek}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, newWeek: value }))}
            trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
            thumbColor={Colors.dark.text}
            ios_backgroundColor={Colors.dark.cardElevated}
          />
        </View>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Game results</Text>
          <Switch
            value={notifications.gameResults}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, gameResults: value }))}
            trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
            thumbColor={Colors.dark.text}
            ios_backgroundColor={Colors.dark.cardElevated}
          />
        </View>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Rank changes</Text>
          <Switch
            value={notifications.rankChanges}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, rankChanges: value }))}
            trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
            thumbColor={Colors.dark.text}
            ios_backgroundColor={Colors.dark.cardElevated}
          />
        </View>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Friend activity</Text>
          <Switch
            value={notifications.friendActivity}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, friendActivity: value }))}
            trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
            thumbColor={Colors.dark.text}
            ios_backgroundColor={Colors.dark.cardElevated}
          />
        </View>
      </View>

      {/* App Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Default stake amount</Text>
          <Text style={styles.menuItemValue}>100 units</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Odds format</Text>
          <Text style={styles.menuItemValue}>American</Text>
        </View>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Dark Theme</Text>
          <Switch
            value={settings.darkTheme}
            onValueChange={(value) => setSettings(prev => ({ ...prev, darkTheme: value }))}
            trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
            thumbColor={Colors.dark.text}
            ios_backgroundColor={Colors.dark.cardElevated}
          />
        </View>
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Profile visibility</Text>
          <Switch
            value={true}
            trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
            thumbColor={Colors.dark.text}
            ios_backgroundColor={Colors.dark.cardElevated}
          />
        </View>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Friend requests</Text>
          <Switch
            value={true}
            trackColor={{ false: Colors.dark.cardElevated, true: Colors.dark.tint }}
            thumbColor={Colors.dark.text}
            ios_backgroundColor={Colors.dark.cardElevated}
          />
        </View>
      </View>

      {/* Support & Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & Legal</Text>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>How to Play / Tutorial</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Rules & Guidelines</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Support / Contact</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Terms of Service</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </View>
        <View style={styles.menuItem}>
          <Text style={styles.menuItemText}>Responsible Gaming</Text>
          <Text style={styles.menuItemArrow}>→</Text>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        <View style={styles.dangerItem}>
          <Text style={styles.dangerText}>Cancel Subscription</Text>
        </View>
        <View style={styles.dangerItem}>
          <Text style={styles.dangerText}>Delete Account</Text>
        </View>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontFamily: Fonts.display,
    color: Colors.dark.text,
    letterSpacing: 4,
  },
  section: {
    backgroundColor: Colors.dark.card,
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
  },
  subscriptionCard: {
    alignItems: 'center',
    backgroundColor: Colors.dark.cardElevated,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.tint + '30',
  },
  subscriptionHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  subscriptionStatus: {
    fontSize: 14,
    fontFamily: Fonts.condensed,
    color: Colors.dark.success,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  subscriptionDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subscriptionPlan: {
    fontSize: 24,
    fontFamily: Fonts.primaryBold,
    color: Colors.dark.text,
  },
  subscriptionRenewal: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  manageButton: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  manageButtonText: {
    fontSize: 16,
    fontFamily: Fonts.primaryBold,
    color: Colors.dark.background,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: Fonts.primaryBold,
    color: Colors.dark.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: Fonts.primary,
    color: Colors.dark.text,
    flex: 1,
  },
  menuItemValue: {
    fontSize: 16,
    fontFamily: Fonts.primary,
    color: Colors.dark.textSecondary,
  },
  menuItemArrow: {
    fontSize: 16,
    color: Colors.dark.textSecondary,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: Fonts.primary,
    color: Colors.dark.text,
    flex: 1,
  },
  dangerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  dangerText: {
    fontSize: 16,
    fontFamily: Fonts.primary,
    color: Colors.dark.danger,
    fontWeight: '600',
  },
});