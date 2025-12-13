import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors, Fonts, Typography } from '@/constants/theme';

export default function TermsOfServiceScreen() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: December 13, 2024</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using RUSH, you accept and agree to be bound by the terms and provision of this agreement.
            If you do not agree to abide by the above, please do not use this service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Virtual Credits</Text>
          <Text style={styles.paragraph}>
            RUSH uses virtual credits for entertainment purposes only. Virtual credits have no cash value and cannot be
            withdrawn, transferred, or redeemed for real money or prizes.
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Credits are for gameplay only</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>No real money prizes or payouts</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Credits cannot be transferred between users</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Weekly Pool Membership</Text>
          <Text style={styles.paragraph}>
            Membership grants access to weekly fantasy pools. Each pool runs for one week and requires an active membership
            to participate. Memberships are billed according to the selected plan (weekly, monthly, or annually).
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. User Conduct</Text>
          <Text style={styles.paragraph}>
            Users agree to use RUSH in a fair and responsible manner. The following activities are prohibited:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Using multiple accounts to gain unfair advantage</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Sharing accounts with other users</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Attempting to manipulate or exploit the platform</Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>Harassing or abusing other users</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Account Termination</Text>
          <Text style={styles.paragraph}>
            We reserve the right to suspend or terminate accounts that violate these terms. Users may delete their account
            at any time through the account settings.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We reserve the right to modify these terms at any time. Users will be notified of significant changes via
            email or in-app notification.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Contact</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms of Service, please contact us through the Help & Support section.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  lastUpdated: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontStyle: 'italic',
  },
  sectionTitle: {
    ...Typography.title.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 12,
  },
  paragraph: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 8,
  },
  bullet: {
    ...Typography.body.medium,
    color: Colors.dark.tint,
    marginRight: 12,
    width: 20,
  },
  bulletText: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    flex: 1,
    lineHeight: 24,
  },
  bottomPadding: {
    height: 40,
  },
});
