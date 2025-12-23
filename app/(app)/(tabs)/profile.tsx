import { ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Fonts, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { authClient } from '@/lib/auth-client';
import { useCurrentUser, useUserStats } from '@/hooks/useUser';
import { useMyPool, useActivePool, useLeaderboard } from '@/hooks/usePools';

export default function ProfileScreen() {
  const router = useRouter();

  // Get session and user data
  const { data: session } = authClient.useSession();
  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUser();
  const { data: stats, isLoading: isLoadingStats } = useUserStats();
  const { data: myPool, isLoading: isLoadingMyPool } = useMyPool();
  const { data: activePool, isLoading: isLoadingPool } = useActivePool();
  const { data: leaderboardData } = useLeaderboard(activePool?.id);

  // Calculate ranks on the frontend based on score (descending)
  const leaderboard = useMemo(() => {
    const memberships = leaderboardData?.docs || [];
    // Sort by score descending (highest first) and add rank
    return memberships
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1, // Rank 1 = highest score
      }));
  }, [leaderboardData]);

  // Calculate user's rank from leaderboard
  const currentUserEntry = leaderboard.find((entry) => {
    const user = typeof entry.user === 'object' ? entry.user : null;
    return user?.id === session?.user?.id;
  });
  const currentUserRank = currentUserEntry?.rank || 0;

  const isLoading = isLoadingUser || isLoadingStats || isLoadingMyPool || isLoadingPool;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>PROFILE</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.tint} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      ) : (
        <>
          {/* User Info Card */}
          <View style={styles.section}>
            <View style={styles.userCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(currentUser?.username || session?.user?.name || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.username}>{currentUser?.username || session?.user?.name || 'User'}</Text>
              <Text style={styles.memberSince}>
                {currentUser?.email || session?.user?.email}
              </Text>
              {currentUser?.createdAt && (
                <Text style={styles.memberDate}>
                  Member since {new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </Text>
              )}
              {/* Subscription Status */}
              {currentUser?.is_paid_member && (
                <View style={styles.membershipBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.dark.success} />
                  <Text style={styles.membershipText}>Active Member</Text>
                </View>
              )}
              {currentUser?.subscription_end_date && (
                <Text style={styles.subscriptionEnd}>
                  Subscription ends {new Date(currentUser.subscription_end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              )}
            </View>
          </View>

          {/* Credits Balance */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CURRENT BALANCE</Text>
            <View style={styles.creditsCard}>
              <View style={styles.creditsMain}>
                <Text style={styles.creditsAmount}>
                  {currentUser?.current_credits || currentUser?.credits || 0}
                </Text>
                <Text style={styles.creditsLabel}>Credits</Text>
              </View>
              <View style={styles.creditsInfo}>
                <Ionicons name="information-circle-outline" size={16} color={Colors.dark.textSecondary} />
                <Text style={styles.creditsInfoText}>
                  Virtual currency for betting
                </Text>
              </View>
            </View>
          </View>
        </>
      )}

      {!isLoading && (
        <>
          {/* Current Pool */}
          {activePool && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>THIS WEEK&apos;S POOL</Text>
              <View style={styles.poolCard}>
                <View style={styles.poolHeader}>
                  <View>
                    <Text style={styles.poolLabel}>Your Rank</Text>
                    <Text style={styles.poolRank}>
                      {currentUserRank > 0 ? `#${currentUserRank}` : '--'}
                    </Text>
                  </View>
                  <View style={styles.poolPlayers}>
                    <Ionicons name="people" size={20} color={Colors.dark.textSecondary} />
                    <Text style={styles.poolPlayersText}>{leaderboard.length} players</Text>
                  </View>
                </View>

                <View style={styles.poolDates}>
                  <View style={styles.poolDateItem}>
                    <Text style={styles.poolDateLabel}>Starts</Text>
                    <Text style={styles.poolDateValue}>
                      {new Date(activePool.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={styles.poolDateDivider} />
                  <View style={styles.poolDateItem}>
                    <Text style={styles.poolDateLabel}>Ends</Text>
                    <Text style={styles.poolDateValue}>
                      {new Date(activePool.weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                </View>

                {myPool && (
                  <View style={styles.poolScore}>
                    <Text style={styles.poolScoreLabel}>Profit/Loss</Text>
                    {(() => {
                      const score = myPool.score ?? 0;
                      const scoreColor = score > 0 ? Colors.dark.success : score < 0 ? Colors.dark.danger : Colors.dark.text;
                      const scorePrefix = score > 0 ? '+' : '';
                      return (
                        <Text style={[styles.poolScoreValue, { color: scoreColor }]}>
                          {scorePrefix}{score.toFixed(0)}
                        </Text>
                      );
                    })()}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.viewLeaderboardButton}
                  onPress={() => router.push('/(app)/(tabs)/leaderboard')}
                >
                  <Text style={styles.viewLeaderboardText}>View Leaderboard</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.dark.tint} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BETTING STATS</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.totalBets || 0}</Text>
                <Text style={styles.statLabel}>Total Bets</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: Colors.dark.success }]}>{stats?.wonBets || 0}</Text>
                <Text style={styles.statLabel}>Won</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: Colors.dark.danger }]}>{stats?.lostBets || 0}</Text>
                <Text style={styles.statLabel}>Lost</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{stats?.winRate || 0}%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
            </View>
          </View>
        </>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    backgroundColor: Colors.dark.card,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  screenTitle: {
    ...Typography.title.large,
    color: Colors.dark.text,
    letterSpacing: 2,
    fontFamily: Fonts.display,
  },

  // Section
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
    letterSpacing: 1,
  },

  // User Card
  userCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    ...Typography.title.large,
    color: Colors.dark.background,
    fontFamily: Fonts.display,
    fontSize: 32,
  },
  username: {
    ...Typography.title.medium,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  memberSince: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  memberDate: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    marginTop: 8,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.dark.success + '20',
    borderRadius: 12,
  },
  membershipText: {
    ...Typography.body.small,
    color: Colors.dark.success,
    fontFamily: Fonts.medium,
  },
  subscriptionEnd: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    marginTop: 8,
  },

  // Credits Card
  creditsCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  creditsMain: {
    alignItems: 'center',
    marginBottom: 16,
  },
  creditsAmount: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 48,
    marginBottom: 4,
  },
  creditsLabel: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
  },
  creditsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  creditsInfoText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },

  // Pool Card
  poolCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  poolLabel: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  poolRank: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
  },
  poolPlayers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  poolPlayersText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  poolDates: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  poolDateItem: {
    flex: 1,
    alignItems: 'center',
  },
  poolDateDivider: {
    width: 1,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 16,
  },
  poolDateLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  poolDateValue: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
  },
  poolScore: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  poolScoreLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  poolScoreValue: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 32,
  },
  viewLeaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.tint,
  },
  viewLeaderboardText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.tint,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statValue: {
    ...Typography.title.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
  },

  // Info Card
  infoCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBulletText: {
    ...Typography.emphasis.small,
    color: Colors.dark.background,
    fontFamily: Fonts.bold,
  },
  infoText: {
    ...Typography.body.small,
    color: Colors.dark.text,
    flex: 1,
    lineHeight: 20,
  },

  bottomPadding: {
    height: 40,
  },

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  loadingText: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    marginTop: 16,
  },
});