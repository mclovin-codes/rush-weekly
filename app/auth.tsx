import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import React, { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors, Fonts, Typography } from '@/constants/theme';
import LoginScreen from './auth/login';
import SignupScreen from './auth/signup';
import ForgotPasswordScreen from './auth/forgot-password';
import OnboardingScreen from './auth/onboarding';

export default function AuthScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const handleTabSwitch = (tab: 'login' | 'signup') => {
    Animated.timing(slideAnimation, {
      toValue: tab === 'login' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setActiveTab(tab);
    setShowForgotPassword(false);
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  const handleSignupComplete = () => {
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    // Navigate to main app (home screen)
    router.replace('/(tabs)');
  };

  if (showForgotPassword) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
          <Ionicons name="arrow-back" size={24} color={Colors.dark.text} />
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
        <ForgotPasswordScreen />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <View style={styles.container}>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Text style={styles.logoText}>RUSH</Text>
          </View>
          <Text style={styles.tagline}>Sign in to your account</Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'login' && styles.activeTab
          ]}
          onPress={() => handleTabSwitch('login')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'login' && styles.activeTabText
          ]}>
            LOGIN
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'signup' && styles.activeTab
          ]}
          onPress={() => handleTabSwitch('signup')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'signup' && styles.activeTabText
          ]}>
            SIGN UP
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.contentWrapper,
            {
              transform: [
                {
                  translateX: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -50],
                  }),
                },
              ],
              opacity: slideAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0, 0],
              }),
              zIndex: activeTab === 'login' ? 1 : 0,
            },
          ]}
        >
          <LoginScreen onForgotPassword={handleForgotPassword} />
        </Animated.View>

        <Animated.View
          style={[
            styles.contentWrapper,
            {
              transform: [
                {
                  translateX: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
              opacity: slideAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 1, 1],
              }),
              zIndex: activeTab === 'signup' ? 1 : 0,
            },
          ]}
        >
          <SignupScreen onSignupComplete={handleSignupComplete} />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBackground: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    ...Typography.title.large,
    color: Colors.dark.background,
    fontFamily: Fonts.display,
    letterSpacing: 2,
  },
  tagline: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardElevated,
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: Colors.dark.tint,
  },
  tabText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.medium,
  },
  activeTabText: {
    color: Colors.dark.background,
    fontFamily: Fonts.bold,
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  contentWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    gap: 8,
  },
  backButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
  },
});