import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { Colors, Fonts, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { authClient } from "@/lib/auth-client";

interface SignupScreenProps {
  onSignupComplete?: () => void;
}

export default function SignupScreen({ onSignupComplete }: SignupScreenProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { username, email, password } = formData;

  const openLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleSignup = async () => {
    if (!username || !email || !password) {
      Alert.alert('Required', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Invalid Password', 'Password must be at least 8 characters');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the Terms of Service');
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error } = await authClient.signUp.email({
        email: email,
        password: password,
        name: username,
      });

      if (error) {
        Alert.alert('Signup Failed', error.message || 'Failed to create account');
        return;
      }

      if (authData) {
        if (onSignupComplete) {
          onSignupComplete();
        } else {
          // Navigate to email verification screen with user data
          router.replace({
            pathname: '/(auth)/verify-email',
            params: {
              email: email,
              username: username,
              isNewUser: 'true', // Flag to indicate this is a new signup
            },
          });
        }
      }
    } catch (err) {
      console.error('Signup error:', err);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join RUSH and start competing</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={Colors.dark.textSecondary} />
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

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={Colors.dark.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={Colors.dark.textSecondary}
                value={email}
                onChangeText={(text) => setFormData({...formData, email: text})}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.dark.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="At least 8 characters"
                placeholderTextColor={Colors.dark.textSecondary}
                value={password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.dark.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms Checkbox */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={14} color={Colors.dark.background} />
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>
                I agree to the{' '}
              </Text>
              <TouchableOpacity
                onPress={() => openLink('https://www.joinrush.app/terms')}
                activeOpacity={0.7}
              >
                <Text style={styles.termsLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}> and </Text>
              <TouchableOpacity
                onPress={() => openLink('https://www.joinrush.app/privacy')}
                activeOpacity={0.7}
              >
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Signup Button */}
          <TouchableOpacity
            style={[styles.signupButton, isLoading && styles.signupButtonLoading]}
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={Colors.dark.background} size="small" />
                <Text style={[styles.signupButtonText, { marginLeft: 12 }]}>Creating Account...</Text>
              </View>
            ) : (
              <Text style={styles.signupButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Shadows.glow,
  },
  logoText: {
    ...Typography.title.large,
    fontSize: 32,
    fontWeight: '900',
    color: Colors.dark.background,
    fontFamily: Fonts.display,
  },
  title: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
  },

  // Form
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    ...Typography.body.small,
    color: Colors.dark.text,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  input: {
    flex: 1,
    ...Typography.body.medium,
    color: Colors.dark.text,
    height: '100%',
  },

  // Terms
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 4,
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    lineHeight: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.dark.tint,
    borderColor: Colors.dark.tint,
  },
  termsText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.dark.tint,
    fontWeight: '600',
  },

  // Buttons
  signupButton: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Shadows.pillGlow,
  },
  signupButtonLoading: {
    backgroundColor: Colors.dark.tint,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontWeight: '700',
    fontSize: 16,
  },

  // Login Link
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  loginText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  loginLink: {
    ...Typography.body.small,
    color: Colors.dark.tint,
    fontWeight: '600',
  },
});