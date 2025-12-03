import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors, Fonts, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { authClient } from "@/lib/auth-client";

interface LoginScreenProps {
  onForgotPassword: () => void;
}

export default function LoginScreen({ onForgotPassword }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please enter both email and password');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error } = await authClient.signIn.email({
        email: email,
        password: password,
      });

      if (error) {
        Alert.alert('Login Error', error.message || 'Failed to sign in');
        return;
      }

      if (authData) {
        console.log('Login successful', authData);
        // Navigate to main app or home screen
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Login Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (provider: string) => {
    Alert.alert('Quick Login', `Login with ${provider} feature coming soon`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>

        {/* Header with Logo */}
        <View style={styles.headerSection}>
          <View style={[styles.logoContainer, { backgroundColor: Colors.dark.tint, ...Shadows.glow }]}>
            <Text style={[styles.logoText, { color: Colors.dark.background }]}>RUSH</Text>
          </View>
          <Text style={[styles.headerTitle, { color: Colors.dark.text }]}>
            Welcome Back
          </Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={20} color={Colors.dark.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={Colors.dark.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={20} color={Colors.dark.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.dark.textSecondary}
              value={password}
              onChangeText={setPassword}
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

        {/* Options Row */}
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
              {rememberMe && (
                <Ionicons name="checkmark" size={14} color={Colors.dark.background} />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Remember me</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onForgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.loginButtonText}>Signing in...</Text>
          ) : (
            <Text style={styles.loginButtonText}>SIGN IN</Text>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        {/* Apple Login */}
        <TouchableOpacity
          style={styles.appleLoginButton}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Ionicons
            name="person-add-outline"
            size={20}
            color={Colors.dark.text}
          />
          <Text style={styles.appleLoginText}>Create New Account</Text>
        </TouchableOpacity>

      
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  form: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    ...Typography.title.medium,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 3,
    fontFamily: Fonts.display,
  },
  headerTitle: {
    ...Typography.title.small,
    textAlign: 'center',
    lineHeight: 32,
  },
  inputGroup: {
    marginBottom: 20,
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
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: Colors.dark.tint,
    borderColor: Colors.dark.tint,
  },
  checkboxLabel: {
    ...Typography.body.small,
    color: Colors.dark.text,
  },
  forgotPasswordText: {
    ...Typography.body.small,
    color: Colors.dark.tint,
  },
  loginButton: {
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
  loginButtonDisabled: {
    backgroundColor: Colors.dark.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.dark.border,
  },
  dividerText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    paddingHorizontal: 16,
  },
  appleLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
    justifyContent: 'center',
  },
  appleLoginText: {
    ...Typography.body.medium,
    color: Colors.dark.text,
  },
});