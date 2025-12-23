import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors, Fonts, Typography } from '@/constants/theme';

export default function HelpSupportScreen() {
  const handleEmailSupport = () => {
    Linking.openURL('mailto:gm@gilbertmpanga.com');
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Section */}
        <View style={styles.section}>
          <View style={styles.contactCard}>
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={32} color={Colors.dark.tint} />
            </View>
            <Text style={styles.contactTitle}>Get in Touch</Text>
            <Text style={styles.contactSubtitle}>
              Have questions? We&apos;re here to help!
            </Text>
            <TouchableOpacity style={styles.emailButton} onPress={handleEmailSupport}>
              <Ionicons name="send" size={20} color={Colors.dark.background} />
              <Text style={styles.emailButtonText}>Email Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={24} color={Colors.dark.tint} />
              <Text style={styles.faqQuestion}>What is RUSH?</Text>
            </View>
            <Text style={styles.faqAnswer}>
              RUSH is a fantasy sports platform where you compete with others using virtual credits.
              Join weekly pools, make predictions, and climb the leaderboards!
            </Text>
          </View>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={24} color={Colors.dark.tint} />
              <Text style={styles.faqQuestion}>How do virtual credits work?</Text>
            </View>
            <Text style={styles.faqAnswer}>
              Virtual credits are used to make predictions in pools. They have no cash value and are for
              entertainment only. You can reload credits anytime through the account screen.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={24} color={Colors.dark.tint} />
              <Text style={styles.faqQuestion}>How do weekly pools work?</Text>
            </View>
            <Text style={styles.faqAnswer}>
              Each week you&apos;re matched with ~100 players. Everyone starts with 1,000 credits. Use your sports
              knowledge to make smart picks and climb the leaderboard before the week ends!
            </Text>
          </View>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={24} color={Colors.dark.tint} />
              <Text style={styles.faqQuestion}>Can I win real money?</Text>
            </View>
            <Text style={styles.faqAnswer}>
              No. RUSH is for entertainment only. There are no cash prizes or payouts. Virtual credits
              cannot be withdrawn or redeemed for real money.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={24} color={Colors.dark.tint} />
              <Text style={styles.faqQuestion}>How do I cancel my membership?</Text>
            </View>
            <Text style={styles.faqAnswer}>
              You can manage or cancel your membership anytime through the Account settings screen.
              Your access will continue until the end of your current billing period.
            </Text>
          </View>

          <View style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={24} color={Colors.dark.tint} />
              <Text style={styles.faqQuestion}>I forgot my password</Text>
            </View>
            <Text style={styles.faqAnswer}>
              Use the &quot;Forgot password?&quot; link on the login screen to reset your password. We&apos;ll send a
              reset link to your registered email address.
            </Text>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push('/(app)/terms-of-service')}
          >
            <View style={styles.linkIcon}>
              <Ionicons name="document-text-outline" size={20} color={Colors.dark.tint} />
            </View>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push('/(app)/privacy-policy')}
          >
            <View style={styles.linkIcon}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.dark.tint} />
            </View>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.dark.textSecondary} />
          </TouchableOpacity>
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
  contactCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  contactIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.tint + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  contactTitle: {
    ...Typography.title.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 8,
  },
  contactSubtitle: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.tint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    gap: 8,
  },
  emailButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.display,
  },
  sectionTitle: {
    ...Typography.title.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 16,
  },
  faqCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  faqQuestion: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
    flex: 1,
  },
  faqAnswer: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
    paddingLeft: 36,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  linkIcon: {
    marginRight: 12,
  },
  linkText: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    flex: 1,
  },
  bottomPadding: {
    height: 40,
  },
});
