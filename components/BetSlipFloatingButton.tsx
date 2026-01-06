import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { Receipt } from 'phosphor-react-native';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { useBetSlip } from '@/providers/BetSlipProvider';

export default function BetSlipFloatingButton() {
  const { selections, openBetSlip } = useBetSlip();
  const betCount = selections.length;

  // Animations
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when count changes
  useEffect(() => {
    if (betCount > 0) {
      // Scale up and down animation
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          useNativeDriver: true,
          speed: 50,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 50,
        }),
      ]).start();

      // Continuous pulse for badge
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop pulse when no bets
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [betCount]);

  // Don't show button if no bets
  if (betCount === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={openBetSlip}
        activeOpacity={0.8}
      >
        {/* Glow effect */}
        <View style={styles.glowEffect} />

        {/* Icon */}
        <Receipt size={28} weight="duotone" color={Colors.dark.background} />

        {/* Badge with count */}
        <Animated.View
          style={[
            styles.badge,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.badgeText}>{betCount}</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.tint,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  glowEffect: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.dark.tint,
    opacity: 0.2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Colors.dark.danger,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Colors.dark.background,
    shadowColor: Colors.dark.danger,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    ...Typography.body.small,
    color: Colors.dark.text,
    fontFamily: Fonts.bold,
    fontSize: 12,
    letterSpacing: 0.3,
  },
});
