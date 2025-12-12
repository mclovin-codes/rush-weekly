import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { authClient } from "@/lib/auth-client";
import { Colors, Fonts, Typography } from '@/constants/theme';

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();
  const email = (params.email as string) || '';
  const username = (params.username as string) || '';
  const isNewUser = (params.isNewUser as string) === 'true';

  const [isResending, setIsResending] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleResendVerification = async () => {
    if (!email) {
      Alert.alert('Error', 'Email address not found');
      return;
    }

    setIsResending(true);
    try {
      // Attempt to resend verification email
      // Note: Better Auth may handle this differently, adjust as needed
      const { data, error } = await (authClient as any).sendVerificationEmail?.({
        email: email.trim()
      });

      if (error) {
        console.error('Resend verification error:', error);
        Alert.alert(
          'Error',
          error.message || 'Failed to resend verification email. Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Email Sent',
        'Verification email has been resent. Please check your inbox.',
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Unexpected resend verification error:', err);
      Alert.alert(
        'Info',
        'Verification email was already sent. Please check your inbox and spam folder.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/(auth)/login');
  };

  const handleContinueToOnboarding = () => {
    router.replace('/(auth)/onboarding');
  };

  const handleCheckVerification = async () => {
    try {
      // Refresh session to check if email is now verified
      const { data: session } = await authClient.getSession();

      if (session?.user?.emailVerified) {
        const destination = isNewUser ? '/(auth)/onboarding' : '/(app)/(tabs)';
        const message = isNewUser
          ? 'Your email has been verified. Let\'s complete your onboarding!'
          : 'Your email has been verified. You can now access the app.';

        Alert.alert(
          'Success!',
          message,
          [
            {
              text: 'Continue',
              onPress: () => router.replace(destination),
            },
          ]
        );
      } else {
        Alert.alert(
          'Not Verified Yet',
          'Please check your email and click the verification link. It may take a few minutes to arrive.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Check verification error:', error);
      Alert.alert('Error', 'Failed to check verification status');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={64} color={Colors.dark.tint} />
          </View>

          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We&apos;ve sent a verification link to{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
            {'\n\n'}
            Click the link in the email to verify your account and unlock all features.
          </Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.dark.tint} />
            <Text style={styles.infoText}>
              Check your inbox and spam folder. The link will expire in 24 hours.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleCheckVerification}
          >
            <Text style={styles.buttonText}>I'VE VERIFIED MY EMAIL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleContinueToOnboarding}
          >
            <Text style={styles.secondaryButtonText}>SKIP FOR NOW</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleResendVerification}
            disabled={isResending}
          >
            <Text style={styles.linkText}>
              {isResending ? 'Sending...' : 'Resend verification email'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={handleSignOut}
            disabled={isSigningOut}
          >
            <Text style={[styles.linkText, styles.signOutText]}>
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            Having trouble? Contact support at{' '}
            <Text style={styles.emailLink}>support@rush.com</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 80,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    ...Typography.title.large,
    color: Colors.dark.text,
    textAlign: 'center',
    fontFamily: Fonts.display,
    marginBottom: 16,
  },
  subtitle: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emailHighlight: {
    color: Colors.dark.tint,
    fontFamily: Fonts.medium,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: 16,
    gap: 12,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.dark.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
    letterSpacing: 1,
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 24,
  },
  linkButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  linkText: {
    ...Typography.body.medium,
    color: Colors.dark.tint,
    fontWeight: '600',
  },
  signOutText: {
    color: Colors.dark.textSecondary,
  },
  helpText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  emailLink: {
    color: Colors.dark.tint,
    textDecorationLine: 'underline',
  },
});
