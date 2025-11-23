import { ScrollView, StyleSheet, View, Text, Switch } from 'react-native';
import React, { useState } from 'react';

import { Colors } from '@/constants/theme';

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
            trackColor={{ false: Colors.dark.background, true: Colors.dark.tint }}
          />
        </View>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Game results</Text>
          <Switch
            value={notifications.gameResults}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, gameResults: value }))}
            trackColor={{ false: Colors.dark.background, true: Colors.dark.tint }}
          />
        </View>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Rank changes</Text>
          <Switch
            value={notifications.rankChanges}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, rankChanges: value }))}
            trackColor={{ false: Colors.dark.background, true: Colors.dark.tint }}
          />
        </View>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Friend activity</Text>
          <Switch
            value={notifications.friendActivity}
            onValueChange={(value) => setNotifications(prev => ({ ...prev, friendActivity: value }))}
            trackColor={{ false: Colors.dark.background, true: Colors.dark.tint }}
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
            trackColor={{ false: Colors.dark.background, true: Colors.dark.tint }}
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
            trackColor={{ false: Colors.dark.background, true: Colors.dark.tint }}
          />
        </View>
        <View style={styles.switchItem}>
          <Text style={styles.switchLabel}>Friend requests</Text>
          <Switch
            value={true}
            trackColor={{ false: Colors.dark.background, true: Colors.dark.tint }}
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
  section: {
    backgroundColor: Colors.dark.card,
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
  },
  subscriptionCard: {
    alignItems: 'center',
  },
  subscriptionHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  subscriptionStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.dark.success,
  },
  subscriptionDetails: {
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionPlan: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  subscriptionRenewal: {
    fontSize: 14,
    color: Colors.dark.icon,
    marginTop: 4,
  },
  manageButton: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  manageButtonText: {
    fontSize: 16,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.background,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  menuItemValue: {
    fontSize: 16,
    color: Colors.dark.icon,
  },
  menuItemArrow: {
    fontSize: 16,
    color: Colors.dark.icon,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.background,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  dangerItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.background,
  },
  dangerText: {
    fontSize: 16,
    color: Colors.dark.danger,
    fontWeight: '500',
  },
});