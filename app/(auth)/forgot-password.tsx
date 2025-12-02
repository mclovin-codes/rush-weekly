import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert,ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Fonts, Typography } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetLink = () => {
    if (!email) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 2000);
  };

  const handleResendLink = () => {
    if (!email) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert('Success', 'Reset link has been resent');
    }, 1500);
  };

  const handleBackToLogin = () => {
    // This will be handled by the parent component
    console.log('Back to login');
  };

  const handleQuickLogin = () => {
    Alert.alert('Alternative Login', 'Use your social media account to login and reset password');
  };

  const renderStep1 = () => (
    <View>
      <View style={styles.iconContainer}>
        <Ionicons name="mail-unread" size={48} color={Colors.dark.tint} />
      </View>

      <Text style={styles.title}>Forgot Your Password?</Text>
      <Text style={styles.subtitle}>
        Enter your email address and {`we'll`} send you a link to reset your password.
        The link will expire after 1 hour for security reasons.
      </Text>

      <View style={styles.emailContainer}>
        <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color={Colors.dark.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor={Colors.dark.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
        onPress={handleSendResetLink}
        disabled={isLoading}
      >
        {isLoading ? (
          <Text style={styles.sendButtonText}>Sending...</Text>
        ) : (
          <Text style={styles.sendButtonText}>SEND RESET LINK</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.alternativeText}>Or try these options:</Text>

      <View style={styles.quickLoginContainer}>
        <TouchableOpacity
          style={[styles.quickLoginOption, styles.quickLoginGoogle]}
          onPress={handleQuickLogin}
        >
          <Ionicons name="logo-google" size={20} color={Colors.dark.text} />
          <Text style={styles.quickLoginText}>Sign in with Google</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickLoginOption, styles.quickLoginPhone]}
          onPress={() => Alert.alert('Phone Reset', 'Reset via phone verification coming soon')}
        >
          <Ionicons name="call" size={20} color={Colors.dark.text} />
          <Text style={styles.quickLoginText}>Reset via Phone</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.securityNotice}>
        <Ionicons name="information-circle" size={16} color={Colors.dark.textSecondary} />
        <Text style={styles.securityText}>
          For your security, we only send reset links to registered email addresses.
          If you {`don't`} receive an email within 5 minutes, check your spam folder.
        </Text>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <View style={styles.successIconContainer}>
        <Ionicons name="checkmark-circle" size={48} color={Colors.dark.success} />
      </View>

      <Text style={styles.title}>Reset Link Sent!</Text>
      <Text style={styles.subtitle}>
        {`We've`} sent a password reset link to{' '}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionTitle}>Next Steps:</Text>
        <View style={styles.instructionList}>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <Text style={styles.instructionText}>
              Check your email inbox
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <Text style={styles.instructionText}>
              Open the email from RUSH
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <Text style={styles.instructionText}>
              Click the {`"Reset Password"`} button
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>4</Text>
            </View>
            <Text style={styles.instructionText}>
              Create your new password
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.timerContainer}>
        <Ionicons name="timer" size={20} color={Colors.dark.textSecondary} />
        <Text style={styles.timerText}>
          Reset link expires in 59:47
        </Text>
      </View>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendLink}
        disabled={isLoading}
      >
        {isLoading ? (
          <Text style={styles.resendButtonText}>Sending...</Text>
        ) : (
          <Text style={styles.resendButtonText}>RESEND LINK</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.changeEmailButton}
        onPress={() => setStep(1)}
      >
        <Ionicons name="refresh" size={20} color={Colors.dark.tint} />
        <Text style={styles.changeEmailText}>Try Different Email</Text>
      </TouchableOpacity>

      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>Need Help?</Text>
        <View style={styles.helpOptions}>
          <TouchableOpacity
            style={styles.helpOption}
            onPress={() => Alert.alert('Support', 'Our support team is available 24/7 to help you with any issues')}
          >
            <Ionicons name="headset" size={20} color={Colors.dark.tint} />
            <Text style={styles.helpText}>Contact Support</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.helpOption}
            onPress={() => Alert.alert('FAQ', 'Check our FAQ for common password reset issues')}
          >
            {/* <Ionicons="help-circle" size={20} color={Colors.dark.tint} /> */}
            <Text style={styles.helpText}>FAQ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
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
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...Typography.title.large,
    color: Colors.dark.text,
    textAlign: 'center',
    fontFamily: Fonts.display,
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emailHighlight: {
    color: Colors.dark.tint,
    fontFamily: Fonts.medium,
  },
  emailContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...Typography.body.medium,
    color: Colors.dark.text,
    paddingVertical: 16,
  },
  sendButton: {
    backgroundColor: Colors.dark.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.dark.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  sendButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
  alternativeText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  quickLoginContainer: {
    gap: 12,
    marginBottom: 24,
  },
  quickLoginOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
  },
  quickLoginGoogle: {
    backgroundColor: Colors.dark.card,
    borderColor: Colors.dark.border,
  },
  quickLoginPhone: {
    backgroundColor: Colors.dark.card,
    borderColor: Colors.dark.border,
  },
  quickLoginText: {
    ...Typography.body.medium,
    color: Colors.dark.text,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.dark.card,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  securityText: {
    ...Typography.body.small,
    color: Colors.dark.text,
    flex: 1,
    marginLeft: 8,
    lineHeight: 16,
  },
  instructionContainer: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  instructionTitle: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    marginBottom: 16,
  },
  instructionList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    ...Typography.emphasis.small,
    color: Colors.dark.background,
    fontFamily: Fonts.bold,
  },
  instructionText: {
    ...Typography.body.small,
    color: Colors.dark.text,
    flex: 1,
    lineHeight: 18,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.warning + '15',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.warning + '30',
    gap: 8,
  },
  timerText: {
    ...Typography.body.small,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
  },
  resendButton: {
    backgroundColor: Colors.dark.card,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 16,
  },
  resendButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.tint,
  },
  changeEmailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  changeEmailText: {
    ...Typography.emphasis.small,
    color: Colors.dark.tint,
  },
  helpContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  helpTitle: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  helpOptions: {
    gap: 12,
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
  },
  helpText: {
    ...Typography.body.small,
    color: Colors.dark.text,
  },
});