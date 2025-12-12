import { authClient } from "@/lib/auth-client";
import { Redirect, router } from "expo-router";
import { ActivityIndicator, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Typography, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import HomeScreenSkeleton from "@/components/homeskeleton";

export default function WelcomeScreen() {
  const { data: session, isPending } = authClient.useSession();

  // Theme colors - using direct colors for better type safety
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  if (isPending) {
    return (
      <View style={[styles.container]}>
        <HomeScreenSkeleton/>
      </View>
    );
  }

  // If signed in, check email verification
  if (session) {
    const user = session.user;
    console.log('Session user:', user);
    console.log('Email verified:', user?.emailVerified);

    // Check if email is verified
    if (user && user.emailVerified === false) {
      console.log('Redirecting to verify-email from index');
      return <Redirect href={{
        pathname: "/(auth)/verify-email",
        params: {
          email: user.email || '',
          username: user.name || '',
        },
      }} />;
    }
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
            Fantasy Sports Betting{'\n'}No Risk, All Thrill
          </Text>

          <Text style={[styles.subtitle, { color: textColor as string }]}>
            Compete in weekly pools with virtual credits.{'\n'}
            No real money. Pure competition.
          </Text>
        </View>

        {/* Feature Pills */}
        <View style={styles.features}>
          <View style={[styles.featurePill, { backgroundColor: tint as string + '20' }]}>
            <Text style={[styles.featureText, { color: tint as string }]}>100 Credits Weekly</Text>
          </View>
          <View style={[styles.featurePill, { backgroundColor: tint as string + '20' }]}>
            <Text style={[styles.featureText, { color: tint as string }]}>~100 Player Pools</Text>
          </View>
          <View style={[styles.featurePill, { backgroundColor: tint as string + '20' }]}>
            <Text style={[styles.featureText, { color: tint as string }]}>Real Odds</Text>
          </View>
          <View style={[styles.featurePill, { backgroundColor: tint as string + '20' }]}>
            <Text style={[styles.featureText, { color: tint as string }]}>Zero Risk</Text>
          </View>
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
    marginBottom: Spacing['2xl'],
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
    lineHeight: 40,
    marginTop: Spacing.md,
  },
  subtitle: {
    ...Typography.body.medium,
    textAlign: 'center',
    lineHeight: 24,
    marginTop: Spacing.lg,
    opacity: 0.8,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
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