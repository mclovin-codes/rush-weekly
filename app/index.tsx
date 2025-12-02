import { authClient } from "@/lib/auth-client";
import { Redirect, router } from "expo-router";
import { ActivityIndicator, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Typography, Spacing, BorderRadius, Shadows } from "@/constants/theme";

export default function WelcomeScreen() {
  const { data: session, isPending } = authClient.useSession();

  // Theme colors - using direct colors for better type safety
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  if (isPending) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator color={tint as string} size="large" />
      </View>
    );
  }

  // If signed in, go to app
  if (session) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor as string }]}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo/Brand Area */}
        <View style={styles.brandSection}>
          <View style={[styles.logoContainer, { backgroundColor: tint as string, ...Shadows.glow }]}>
            <Text style={[styles.logoText, { color: backgroundColor as string }]}>RUSH</Text>
          </View>

          <Text style={[styles.tagline, { color: textColor as string }]}>
            Sports Betting{'\n'}Reimagined
          </Text>
        </View>

       
      </View>

      {/* Bottom Action Section */}
      <View style={styles.bottomSection}>
        {/* Sign In Button */}
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, { backgroundColor: tint as string, ...Shadows.pillGlow }]}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: backgroundColor as string }]}>Sign In</Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton, { backgroundColor: 'transparent', borderColor: tint as string, borderWidth: 1 }]}
          onPress={() => router.push("/(auth)/signup")}
          activeOpacity={0.8}
        >
          <Text style={[styles.buttonText, { color: tint as string }]}>Create Account</Text>
        </TouchableOpacity>

        {/* Terms Text */}
        <Text style={[styles.termsText, { color: textColor as string }]}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoText: {
    ...Typography.title.large,
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 4,
  },
  tagline: {
    ...Typography.title.medium,
    textAlign: 'center',
    lineHeight: 44,
    marginTop: Spacing.md,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  featurePill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  featureText: {
    ...Typography.oddsPill.small,
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    gap: Spacing.md,
  },
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  primaryButton: {
    marginBottom: Spacing.sm,
  },
  secondaryButton: {
    marginBottom: Spacing.lg,
  },
  buttonText: {
    ...Typography.emphasis.medium,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  termsText: {
    ...Typography.meta.small,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
  },
});