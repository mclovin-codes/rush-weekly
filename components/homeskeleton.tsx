import { ScrollView, StyleSheet, View, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { Colors } from '@/constants/theme';

// Skeleton shimmer animation
function SkeletonShimmer({ style }: { style?: any }) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        style,
        { opacity },
      ]}
    />
  );
}

export default function HomeScreenSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SkeletonShimmer style={styles.logoSkeleton} />
        </View>
        
        <View style={styles.userInfoSkeleton}>
          <SkeletonShimmer style={styles.usernameSkeleton} />
          <SkeletonShimmer style={styles.statsSkeleton} />
        </View>
      </View>

      {/* League Filter Pills Skeleton */}
      <View style={styles.leagueFilterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.leagueFilterContent}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <SkeletonShimmer key={item} style={styles.leaguePillSkeleton} />
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Week Countdown Skeleton */}
        <View style={styles.countdownSection}>
          <SkeletonShimmer style={styles.countdownSkeleton} />
        </View>

        {/* Leaderboard Preview Skeleton */}
        <View style={styles.leaderboardPreview}>
          <View style={styles.previewHeader}>
            <SkeletonShimmer style={styles.previewTitleSkeleton} />
            <SkeletonShimmer style={styles.viewAllSkeleton} />
          </View>

          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.previewRow}>
              <SkeletonShimmer style={styles.previewRankSkeleton} />
              <SkeletonShimmer style={styles.previewUsernameSkeleton} />
              <SkeletonShimmer style={styles.previewUnitsSkeleton} />
            </View>
          ))}
        </View>

        {/* Games Section Skeleton */}
        <View style={styles.gamesSection}>
          {[1, 2, 3].map((gameIndex) => (
            <View key={gameIndex} style={styles.gameCard}>
              {/* Compact Header Skeleton */}
              <View style={styles.compactHeader}>
                <View style={styles.matchupInfoSkeleton}>
                  <SkeletonShimmer style={styles.teamAbbrSkeleton} />
                  <SkeletonShimmer style={styles.vsTextSkeleton} />
                  <SkeletonShimmer style={styles.teamAbbrSkeleton} />
                </View>
                <SkeletonShimmer style={styles.gameTimeSkeleton} />
              </View>

              {/* Grid Layout Skeleton */}
              <View style={styles.betsGrid}>
                {/* First Row */}
                <View style={styles.betRow}>
                  <View style={styles.betCell}>
                    <SkeletonShimmer style={styles.betLabelSkeleton} />
                    <SkeletonShimmer style={styles.betValueSkeleton} />
                  </View>
                  <View style={styles.betCell}>
                    <SkeletonShimmer style={styles.betLabelSkeleton} />
                    <SkeletonShimmer style={styles.betValueSkeleton} />
                  </View>
                </View>

                {/* Second Row */}
                <View style={styles.betRow}>
                  <View style={styles.betCell}>
                    <SkeletonShimmer style={styles.betLabelSkeleton} />
                    <SkeletonShimmer style={styles.betValueSkeleton} />
                  </View>
                  <View style={styles.betCell}>
                    <SkeletonShimmer style={styles.betLabelSkeleton} />
                    <SkeletonShimmer style={styles.betValueSkeleton} />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  skeleton: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 4,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSkeleton: {
    width: 80,
    height: 28,
    borderRadius: 6,
  },
  userInfoSkeleton: {
    alignItems: 'flex-end',
    gap: 4,
  },
  usernameSkeleton: {
    width: 100,
    height: 16,
    borderRadius: 4,
  },
  statsSkeleton: {
    width: 140,
    height: 14,
    borderRadius: 4,
  },

  // League Filter
  leagueFilterContainer: {
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingVertical: 10,
  },
  leagueFilterContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  leaguePillSkeleton: {
    width: 100,
    height: 32,
    borderRadius: 20,
  },

  scrollContainer: {
    flex: 1,
  },

  // Countdown
  countdownSection: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: Colors.dark.background,
  },
  countdownSkeleton: {
    width: 200,
    height: 18,
    borderRadius: 6,
  },

  // Leaderboard Preview
  leaderboardPreview: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewTitleSkeleton: {
    width: 100,
    height: 14,
    borderRadius: 4,
  },
  viewAllSkeleton: {
    width: 60,
    height: 14,
    borderRadius: 4,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  previewRankSkeleton: {
    width: 28,
    height: 14,
    borderRadius: 4,
  },
  previewUsernameSkeleton: {
    flex: 1,
    height: 14,
    borderRadius: 4,
  },
  previewUnitsSkeleton: {
    width: 50,
    height: 14,
    borderRadius: 4,
  },

  // Games Section
  gamesSection: {
    paddingHorizontal: 16,
  },
  gameCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },

  // Compact Header
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  matchupInfoSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamAbbrSkeleton: {
    width: 40,
    height: 18,
    borderRadius: 4,
  },
  vsTextSkeleton: {
    width: 20,
    height: 14,
    borderRadius: 4,
  },
  gameTimeSkeleton: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },

  // Bets Grid
  betsGrid: {
    gap: 6,
  },
  betRow: {
    flexDirection: 'row',
    gap: 6,
  },
  betCell: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    gap: 4,
  },
  betLabelSkeleton: {
    width: 50,
    height: 10,
    borderRadius: 3,
  },
  betValueSkeleton: {
    width: 40,
    height: 16,
    borderRadius: 4,
  },

  bottomSpacing: {
    height: 80,
  },
});