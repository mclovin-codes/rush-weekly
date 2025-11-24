import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Fonts, Typography } from '@/constants/theme';

export default function SignupScreen() {
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
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Handle successful signup
      console.log('Signup successful');
    }, 2000);
  };

  const handleQuickSignup = (provider: string) => {
    Alert.alert('Quick Signup', `Signup with ${provider} feature coming soon`);
  };

  const renderStep1 = () => (
    <View>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepDotActive]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot]} />
      </View>

      <Text style={styles.stepTitle}>Create Your Account</Text>
      <Text style={styles.stepSubtitle}>Step 1 of 3: Basic Information</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>USERNAME</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color={Colors.dark.textSecondary} style={styles.inputIcon} />
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
        <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="mail" size={20} color={Colors.dark.textSecondary} style={styles.inputIcon} />
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
          <Text style={styles.nextButtonText}>NEXT</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.dark.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepDotCompleted]} />
        <View style={[styles.stepLine, styles.stepLineCompleted]} />
        <View style={[styles.stepDot, styles.stepDotActive]} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot]} />
      </View>

      <Text style={styles.stepTitle}>Set Your Password</Text>
      <Text style={styles.stepSubtitle}>Step 2 of 3: Security Setup</Text>

      <View style={styles.passwordRequirements}>
        <Text style={styles.requirementsTitle}>Password Requirements:</Text>
        <View style={styles.requirementItem}>
          <Ionicons
            name={password.length >= 8 ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={password.length >= 8 ? Colors.dark.success : Colors.dark.textSecondary}
          />
          <Text style={styles.requirementText}>At least 8 characters</Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons
            name={/[a-z]/.test(password) ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={/[a-z]/.test(password) ? Colors.dark.success : Colors.dark.textSecondary}
          />
          <Text style={styles.requirementText}>One lowercase letter</Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons
            name={/[A-Z]/.test(password) ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={/[A-Z]/.test(password) ? Colors.dark.success : Colors.dark.textSecondary}
          />
          <Text style={styles.requirementText}>One uppercase letter</Text>
        </View>
        <View style={styles.requirementItem}>
          <Ionicons
            name={/[0-9]/.test(password) ? "checkmark-circle" : "ellipse-outline"}
            size={16}
            color={/[0-9]/.test(password) ? Colors.dark.success : Colors.dark.textSecondary}
          />
          <Text style={styles.requirementText}>One number</Text>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>PASSWORD</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color={Colors.dark.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Create a strong password"
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
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.dark.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed" size={20} color={Colors.dark.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
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
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              color={Colors.dark.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stepNavigation}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.dark.textSecondary} />
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>NEXT</Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.dark.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepDotCompleted]} />
        <View style={[styles.stepLine, styles.stepLineCompleted]} />
        <View style={[styles.stepDot, styles.stepDotCompleted]} />
        <View style={[styles.stepLine, styles.stepLineCompleted]} />
        <View style={[styles.stepDot, styles.stepDotActive]} />
      </View>

      <Text style={styles.stepTitle}>Finalize Your Account</Text>
      <Text style={styles.stepSubtitle}>Step 3 of 3: Terms & Preferences</Text>

      <View style={styles.termsContainer}>
        <Text style={styles.termsTitle}>Legal Requirements</Text>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData({...formData, agreeToTerms: !agreeToTerms})}
        >
          <View style={[styles.checkbox, agreeToTerms && styles.checkboxChecked]}>
            {agreeToTerms && (
              <Ionicons name="checkmark" size={14} color={Colors.dark.background} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>I agree to the Terms of Service</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData({...formData, agreeToPrivacy: !agreeToPrivacy})}
        >
          <View style={[styles.checkbox, agreeToPrivacy && styles.checkboxChecked]}>
            {agreeToPrivacy && (
              <Ionicons name="checkmark" size={14} color={Colors.dark.background} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>I agree to the Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData({...formData, marketingConsent: !marketingConsent})}
        >
          <View style={[styles.checkbox, marketingConsent && styles.checkboxChecked]}>
            {marketingConsent && (
              <Ionicons name="checkmark" size={14} color={Colors.dark.background} />
            )}
          </View>
          <Text style={styles.checkboxLabel}>I want to receive promotional emails</Text>
          <Text style={styles.checkboxSubtext}>(Optional)</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bonusContainer}>
        <View style={styles.bonusHeader}>
          <Ionicons name="gift" size={24} color={Colors.dark.warning} />
          <View style={styles.bonusTextContainer}>
            <Text style={styles.bonusTitle}>Welcome Bonus!</Text>
            <Text style={styles.bonusSubtitle}>Get 100 bonus units when you complete signup</Text>
          </View>
        </View>
        <View style={styles.bonusDetails}>
          <Text style={styles.bonusDetail}>• Instant deposit match up to 50 units</Text>
          <Text style={styles.bonusDetail}>• Free entry to next competition</Text>
          <Text style={styles.bonusDetail}>• VIP access for first week</Text>
        </View>
      </View>

      <View style={styles.stepNavigation}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.dark.textSecondary} />
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.signupButtonText}>Creating Account...</Text>
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
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
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
    padding: 24,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.border,
  },
  stepDotActive: {
    backgroundColor: Colors.dark.tint,
  },
  stepDotCompleted: {
    backgroundColor: Colors.dark.success,
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 8,
  },
  stepLineCompleted: {
    backgroundColor: Colors.dark.success,
  },
  stepTitle: {
    ...Typography.title.medium,
    color: Colors.dark.text,
    textAlign: 'center',
    fontFamily: Fonts.display,
    marginBottom: 4,
  },
  stepSubtitle: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
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
  passwordToggle: {
    marginLeft: 12,
    padding: 4,
  },
  passwordRequirements: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  requirementsTitle: {
    ...Typography.body.small,
    ...Typography.emphasis.small,
    color: Colors.dark.text,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    ...Typography.body.small,
    color: Colors.dark.text,
    marginLeft: 8,
  },
  stepNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    marginTop: 24,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 8,
  },
  backButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.textSecondary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: Colors.dark.tint,
    borderRadius: 10,
    gap: 8,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsTitle: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.dark.tint,
    borderColor: Colors.dark.tint,
  },
  checkboxLabel: {
    ...Typography.body.small,
    color: Colors.dark.text,
    flex: 1,
    lineHeight: 18,
  },
  checkboxSubtext: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    marginTop: 2,
    marginLeft: 32,
  },
  bonusContainer: {
    backgroundColor: Colors.dark.warning + '15',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.warning + '40',
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bonusTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  bonusTitle: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.bold,
  },
  bonusSubtitle: {
    ...Typography.body.small,
    color: Colors.dark.text,
    marginTop: 2,
  },
  bonusDetails: {
    gap: 4,
  },
  bonusDetail: {
    ...Typography.body.small,
    color: Colors.dark.text,
    paddingLeft: 36,
  },
  signupButton: {
    backgroundColor: Colors.dark.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonDisabled: {
    backgroundColor: Colors.dark.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  signupButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
});