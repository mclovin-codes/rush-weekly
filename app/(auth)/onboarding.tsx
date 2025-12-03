import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Colors, Fonts, Typography } from '@/constants/theme';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  const onboardingSteps = [
    {
      icon: 'people',
      title: 'Welcome to RUSH',
      description: 'A fantasy sports betting experience where you compete in weekly pools—no real money wagered.',
      details: ['100 virtual credits to start', 'Weekly pool competitions', 'Bet on spreads, moneylines & totals', 'No financial risk'],
    },
    {
      icon: 'shuffle',
      title: 'Weekly Pool System',
      description: 'Every week, you\'re placed into a new randomized pool of ~100 players.',
      details: ['Fresh competition each week', 'Equal starting credits for all', 'Climb the leaderboard', 'Top performers earn rewards'],
    },
    {
      icon: 'podium',
      title: 'Compete & Rank Up',
      description: 'Make smart bets to grow your credits and outperform others in your pool.',
      details: ['Real-time odds from sports API', 'Track your pool ranking', 'Weekly leaderboards', 'Strategic betting wins'],
    },
    {
      icon: 'shield-checkmark',
      title: 'Safe & Social',
      description: 'Pure fantasy gaming with all the excitement of sports betting, zero financial risk.',
      details: ['No real money wagered', 'Virtual credits only', 'Social competition', 'Legal & responsible'],
    },
  ];

  useEffect(() => {
    // Fade in animation for current step
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      // Fade out
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentStep(currentStep + 1);
        // Fade in will be triggered by useEffect
      });
    } else {
      // Complete onboarding
   
      // Redirect to tabs index page
      router.replace('/(app)/(tabs)');
    }
  };

  const handleSkip = () => {
    // Redirect to tabs index page
    router.replace('/(app)/(tabs)');
  };

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }
            ]}
          />
        </View>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.content, { opacity: fadeAnimation }]}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons
                name={currentStepData.icon as any}
                size={48}
                color={Colors.dark.tint}
              />
            </View>
          </View>

          {/* Title and Description */}
          <Text style={styles.title}>{currentStepData.title}</Text>
          <Text style={styles.description}>{currentStepData.description}</Text>

          {/* Details List */}
          <View style={styles.detailsContainer}>
            {currentStepData.details.map((detail, index) => (
              <View key={index} style={styles.detailItem}>
                <View style={styles.bullet}>
                  <Ionicons name="checkmark" size={12} color={Colors.dark.background} />
                </View>
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {onboardingSteps.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.stepDot,
                  index === currentStep && styles.stepDotActive,
                  index < currentStep && styles.stepDotCompleted,
                ]}
                onPress={() => {
                  if (index !== currentStep) {
                    Animated.timing(fadeAnimation, {
                      toValue: 0,
                      duration: 300,
                      useNativeDriver: true,
                    }).start(() => {
                      setCurrentStep(index);
                    });
                  }
                }}
              >
                {index < currentStep && (
                  <Ionicons name="checkmark" size={12} color={Colors.dark.background} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'GET STARTED' : 'NEXT'}
          </Text>
          <Ionicons
            name={isLastStep ? 'checkmark-circle' : 'arrow-forward'}
            size={20}
            color={Colors.dark.background}
          />
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 60,
  },
  progressBar: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.dark.border,
    borderRadius: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.dark.tint,
    borderRadius: 1,
  },
  skipButton: {
    marginLeft: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  skipText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.tint + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.tint + '30',
  },
  title: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 40,
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  bullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.dark.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailText: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
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
    transform: [{ scale: 1.2 }],
  },
  stepDotCompleted: {
    backgroundColor: Colors.dark.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomContainer: {
    padding: 24,
    backgroundColor: Colors.dark.card,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.tint,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
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
});