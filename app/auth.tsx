import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import React, { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Fonts, Typography } from '@/constants/theme';
import LoginScreen from './auth/login';
import SignupScreen from './auth/signup';
import ForgotPasswordScreen from './auth/forgot-password';

export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Text style={styles.logoText}>RUSH</Text>
          </View>
          <Text style={styles.tagline}>Professional Sports Betting</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50K+</Text>
            <Text style={styles.statLabel}>Active Players</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>$125K</Text>
            <Text style={styles.statLabel}>Weekly Prizes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>98%</Text>
            <Text style={styles.statLabel}>Payout Rate</Text>
          </View>
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
                    outputRange: [0, -400],
                  }),
                },
              ],
              opacity: slideAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0, 1],
              }),
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
                    outputRange: [400, 0],
                  }),
                },
              ],
              opacity: slideAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [1, 0, 1],
              }),
            },
          ]}
        >
          <SignupScreen />
        </Animated.View>
      </View>

      {/* Trust Badges */}
      <View style={styles.trustBadges}>
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={16} color={Colors.dark.success} />
          <Text style={styles.trustText}>SSL Encrypted</Text>
        </View>
        <View style={styles.trustBadge}>
          <Ionicons name="lock-closed" size={16} color={Colors.dark.success} />
          <Text style={styles.trustText}>Secure Platform</Text>
        </View>
        <View style={styles.trustBadge}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.dark.success} />
          <Text style={styles.trustText}>Licensed & Regulated</Text>
        </View>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
  },
  statLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.dark.border,
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
  trustBadges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.dark.card,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
});