import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors, Fonts, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface SignupScreenProps {
  onSignupComplete?: () => void;
}

export default function SignupScreen({ onSignupComplete }: SignupScreenProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
    marketingConsent: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const { username, email, password, confirmPassword, agreeToTerms, agreeToPrivacy, marketingConsent } = formData;

  const handleNext = () => {
    if (step === 1) {
      if (!username || !email) {
        Alert.alert('Validation Error', 'Please enter both username and email');
        return;
      }
      if (!email.includes('@')) {
        Alert.alert('Validation Error', 'Please enter a valid email address');
        return;
      }
      if (username.length < 3) {
        Alert.alert('Validation Error', 'Username must be at least 3 characters');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!password || !confirmPassword) {
        Alert.alert('Validation Error', 'Please enter and confirm your password');
        return;
      }
      if (password.length < 8) {
        Alert.alert('Validation Error', 'Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Validation Error', 'Passwords do not match');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSignup = () => {
    if (!agreeToTerms || !agreeToPrivacy) {
      Alert.alert('Validation Error', 'Please agree to Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Signup successful');
      if (onSignupComplete) {
        onSignupComplete();
      }
    }, 2000);
  };

  const handleQuickSignup = (provider: string) => {
    Alert.alert('Quick Signup', `Signup with ${provider} feature coming soon`);
  };

const renderStep1 = () => (
    <View>
      <View style={styles.compactStepIndicator}>
        <View style={[styles.stepDot, styles.stepDotActive]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot]} />
      </View>

      <Text style={styles.compactStepTitle}>Basic Info</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Username</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={Colors.dark.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Choose a username"
            placeholderTextColor={Colors.dark.textSecondary}
            value={username}
            onChangeText={(text) => setFormData({...formData, username: text})}
            autoCapitalize="none"
            autoComplete="username"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={Colors.dark.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Your email address"
            placeholderTextColor={Colors.dark.textSecondary}
            value={email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>
      </View>

      <View style={styles.stepNavigation}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>CONTINUE</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.dark.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <View style={styles.compactStepIndicator}>
        <View style={[styles.stepDot, styles.stepDotCompleted]} />
        <View style={[styles.stepLine, styles.stepLineCompleted]} />
        <View style={[styles.stepDot, styles.stepDotActive]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot]} />
      </View>

      <Text style={styles.compactStepTitle}>Security</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.dark.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Create password"
            placeholderTextColor={Colors.dark.textSecondary}
            value={password}
            onChangeText={(text) => setFormData({...formData, password: text})}
            secureTextEntry={!showPassword}
            autoComplete="password"
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.dark.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Confirm Password</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={Colors.dark.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor={Colors.dark.textSecondary}
            value={confirmPassword}
            onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.dark.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stepNavigation}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={16} color={Colors.dark.textSecondary} />
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>CONTINUE</Text>
          <Ionicons name="arrow-forward" size={16} color={Colors.dark.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <View style={styles.compactStepIndicator}>
        <View style={[styles.stepDot, styles.stepDotCompleted]} />
        <View style={[styles.stepLine, styles.stepLineCompleted]} />
        <View style={[styles.stepDot, styles.stepDotCompleted]} />
        <View style={[styles.stepLine, styles.stepLineCompleted]} />
        <View style={[styles.stepDot, styles.stepDotActive]} />
      </View>

      <Text style={styles.compactStepTitle}>Terms</Text>

      <View style={styles.compactTermsContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData({...formData, agreeToTerms: !agreeToTerms})}
        >
          <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
            {agreeToTerms && (
              <Ionicons name="checkmark" size={12} color={Colors.dark.background} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>I agree to Terms of Service</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData({...formData, agreeToPrivacy: !agreeToPrivacy})}
        >
          <View style={[styles.checkbox, agreeToPrivacy && styles.checkboxChecked]}>
            {agreeToPrivacy && (
              <Ionicons name="checkmark" size={12} color={Colors.dark.background} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>I agree to Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData({...formData, marketingConsent: !marketingConsent})}
        >
          <View style={[styles.checkbox, marketingConsent && styles.checkboxChecked]}>
            {marketingConsent && (
              <Ionicons name="checkmark" size={12} color={Colors.dark.background} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>
            Marketing emails
            <Text style={styles.optionalText}> (optional)</Text>
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.stepNavigation}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={16} color={Colors.dark.textSecondary} />
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.signupButtonText}>CREATING...</Text>
          ) : (
            <Text style={styles.signupButtonText}>CREATE ACCOUNT</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        {/* Header */}
        <View style={styles.sleekHeader}>
          <View style={[styles.miniLogo, { backgroundColor: Colors.dark.tint }]}>
            <Text style={styles.miniLogoText}>R</Text>
          </View>
          <Text style={[styles.headerTitle, { color: Colors.dark.text }]}>
            Join the Rush
          </Text>
        </View>

        {/* Login Link */}
        <View style={styles.loginPrompt}>
          <Text style={[styles.loginPromptText, { color: Colors.dark.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={[styles.loginPromptLink, { color: Colors.dark.tint }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <View style={styles.formContainer}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </View>

        {/* Quick Signup */}
        <View style={styles.quickSignupSection}>
          <Text style={[styles.quickSignupLabel, { color: Colors.dark.textSecondary }]}>
            Or continue with
          </Text>
          <View style={styles.quickSignupButtons}>
            <TouchableOpacity
              style={[styles.quickSignupButton, { backgroundColor: Colors.dark.cardElevated, borderColor: Colors.dark.border }]}
              onPress={() => handleQuickSignup('Google')}
            >
              <Ionicons name="logo-google" size={18} color={Colors.dark.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickSignupButton, { backgroundColor: Colors.dark.cardElevated, borderColor: Colors.dark.border }]}
              onPress={() => handleQuickSignup('Apple')}
            >
              <Ionicons name="logo-apple" size={18} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>
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
  form: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  sleekHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  miniLogo: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.glow,
  },
  miniLogoText: {
    ...Typography.title.medium,
    fontSize: 20,
    fontWeight: '900',
    color: Colors.dark.background,
    fontFamily: Fonts.display,
  },
  headerTitle: {
    ...Typography.title.small,
    textAlign: 'center',
    fontFamily: Fonts.display,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  loginPromptText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  loginPromptLink: {
    ...Typography.body.small,
    fontWeight: '600',
    color: Colors.dark.tint,
  },
  formContainer: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: Spacing.xl,
    minHeight: 320,
  },
  compactStepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.border,
  },
  stepDotActive: {
    backgroundColor: Colors.dark.tint,
  },
  stepDotCompleted: {
    backgroundColor: Colors.dark.success,
  },
  stepLine: {
    width: 20,
    height: 1,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 4,
  },
  stepLineCompleted: {
    backgroundColor: Colors.dark.success,
  },
  compactStepTitle: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontFamily: Fonts.display,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.body.small,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: Spacing.sm,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body.medium,
    color: Colors.dark.text,
    paddingVertical: Spacing.sm,
  },
  passwordToggle: {
    padding: Spacing.xs,
  },
  compactTermsContainer: {
    marginBottom: Spacing.md,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: Colors.dark.tint,
    borderColor: Colors.dark.tint,
  },
  checkboxLabel: {
    ...Typography.body.small,
    color: Colors.dark.text,
    flex: 1,
    lineHeight: 16,
  },
  optionalText: {
    color: Colors.dark.textSecondary,
    fontWeight: '400',
  },
  stepNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.dark.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: Spacing.xs,
  },
  backButtonText: {
    ...Typography.body.small,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.dark.tint,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  nextButtonText: {
    ...Typography.body.small,
    fontWeight: '600',
    color: Colors.dark.background,
    letterSpacing: 0.5,
  },
  signupButton: {
    flex: 1,
    backgroundColor: Colors.dark.tint,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonDisabled: {
    backgroundColor: Colors.dark.textSecondary,
  },
  signupButtonText: {
    ...Typography.body.small,
    fontWeight: '600',
    color: Colors.dark.background,
    letterSpacing: 0.5,
  },
  quickSignupSection: {
    alignItems: 'center',
  },
  quickSignupLabel: {
    ...Typography.body.small,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickSignupButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickSignupButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});