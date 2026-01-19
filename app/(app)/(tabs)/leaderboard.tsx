import { ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { useActivePool, useMyPool, useLeaderboard } from '@/hooks/usePools';
import { authClient } from '@/lib/auth-client';
import { PoolMembership } from '@/types';
import { ArrowClockwise, Trophy } from 'phosphor-react-native';
import { useFocusEffect } from '@react-navigation/native';

// Extended type to include calculated rank
type LeaderboardEntryWithRank = PoolMembership & { rank: number };

// Prize distribution (percentages of total pool)
const PRIZE_DISTRIBUTION = [
  { rank: 1, percentage: 0.50 },  // 50% for 1st
  { rank: 2, percentage: 0.30 },  // 30% for 2nd
  { rank: 3, percentage: 0.20 },  // 20% for 3rd
];

const ENTRY_FEE = 25; // $25 per player

export default function LeaderboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Get current user from auth
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  // Fetch active pool, user's pool membership, and leaderboard
  const { data: activePool, isLoading: isLoadingPool, refetch: refetchPool } = useActivePool();
  const { data: myPool, isLoading: isLoadingMyPool, refetch: refetchMyPool } = useMyPool();
  const { data: leaderboardData, isLoading: isLoadingLeaderboard, refetch: refetchLeaderboard } = useLeaderboard(activePool?.id, { limit: 100 });

  // Refetch data when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      refetchPool();
      refetchMyPool();
      refetchLeaderboard();
    }, [])
  );

  // Spin animation for refresh button
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (refreshing) {
      spinAnim.setValue(0);
      animation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      animation.start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [refreshing]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchPool(),
      refetchMyPool(),
      refetchLeaderboard(),
    ]);
    setRefreshing(false);
  };

  // Calculate ranks on the frontend based on score (descending)
  const leaderboard: LeaderboardEntryWithRank[] = useMemo(() => {
    const memberships = leaderboardData?.docs || [];
    
    memberships.forEach((entry, index) => {
      const user = typeof entry.user === 'object' ? entry.user : null;
      console.log(`Entry ${index + 1}:`, {
        rank: index + 1,
        userId: user?.id || entry.user,
        username: user?.username || 'Unknown',
        score: entry.score,
        initialCredits: entry.initial_credits_at_start,
      });
    });
    

    return memberships
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
  }, [leaderboardData]);

  const totalPlayers = leaderboard.length;
  const totalPrizePool = totalPlayers * ENTRY_FEE;

  // Calculate payout for a given rank
  const calculatePayout = (rank: number): number => {
    const distribution = PRIZE_DISTRIBUTION.find(d => d.rank === rank);
    if (!distribution) return 0;
    return Math.round(totalPrizePool * distribution.percentage);
  };

  // Find current user's rank from leaderboard
  const currentUserEntry = leaderboard.find((entry) => {
    const user = typeof entry.user === 'object' ? entry.user : null;
    return user?.id === currentUserId;
  });
  const currentUserRank = currentUserEntry?.rank || 0;

  

  const isTopTier = (rank: number) => rank <= 3;

  // Calculate week number from pool start date
  const getWeekNumber = () => {
    const weekStart = (activePool as any)?.week_start || (activePool as any)?.weekStart;
    if (!weekStart) return 0;
    const start = new Date(weekStart);
    const weekNumber = Math.ceil((start.getTime() - new Date(start.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return weekNumber;
  };

  // Calculate time remaining in the week
  const getTimeRemaining = () => {
    const weekEnd = (activePool as any)?.week_end || (activePool as any)?.weekEnd;
    if (!weekEnd) return '0d 0h';
    const now = new Date();
    const end = new Date(weekEnd);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return '0d 0h';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return `${days}d ${hours}h`;
  };

  const isLoading = isLoadingPool || isLoadingMyPool || isLoadingLeaderboard;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>LEADERBOARD</Text>
          <TouchableOpacity
            onPress={onRefresh}
            disabled={refreshing}
            style={styles.refreshButton}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <ArrowClockwise
                size={24}
                color="#FFFFFF"
                weight="bold"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Pool Overview */}
        <View style={styles.poolOverview}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Week</Text>
            <Text style={styles.overviewValue}>{getWeekNumber()}</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Players</Text>
            <Text style={styles.overviewValue}>{totalPlayers}</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Prize Pool</Text>
            <Text style={styles.overviewValue}>${totalPrizePool}</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Ends In</Text>
            <Text style={styles.overviewValue}>{getTimeRemaining()}</Text>
          </View>
        </View>

        {/* Your Position Card */}
        {currentUserEntry && (
          <View style={styles.yourPositionCard}>
            <View style={styles.positionHeader}>
              <Text style={styles.positionLabel}>YOUR POSITION</Text>
              <Text style={styles.rankBadge}>#{currentUserRank}</Text>
            </View>
            <View style={styles.positionStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Score</Text>
                <Text style={styles.statValue}>{currentUserEntry.score.toFixed(0)}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>P/L</Text>
                <Text style={[
                  styles.statValue,
                  currentUserEntry.score > 0 ? styles.positiveText :
                  currentUserEntry.score < 0 ? styles.negativeText : {}
                ]}>
                  {currentUserEntry.score > 0 ? '+' : ''}{currentUserEntry.score.toFixed(0)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Est. Payout</Text>
                <Text style={styles.statValue}>
                  {currentUserRank <= 3 ? `$${calculatePayout(currentUserRank)}` : '$0'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.rankHeader]}>#</Text>
        <Text style={[styles.headerText, styles.playerHeader]}>PLAYER</Text>
        <Text style={[styles.headerText, styles.unitsHeader]}>SCORE</Text>
        <Text style={[styles.headerText, styles.plHeader]}>+/-</Text>
        <Text style={[styles.headerText, styles.payoutHeader]}>PAYOUT</Text>
      </View>

      {/* Leaderboard List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.tint}
            colors={[Colors.dark.tint]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.dark.tint} />
            <Text style={styles.loadingText}>Loading leaderboard...</Text>
          </View>
        ) : leaderboard.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No rankings yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to place bets and climb the leaderboard
            </Text>
          </View>
        ) : (
          leaderboard.map((entry: LeaderboardEntryWithRank) => {
            const user = typeof entry.user === 'object' ? entry.user : null;
            const isCurrentUser = user?.id === currentUserId;
            const payout = calculatePayout(entry.rank);

            return (
              <View
                key={user?.id || entry.rank}
                style={[
                  styles.row,
                  isCurrentUser && styles.currentUserRow,
                ]}
              >
                {/* Rank */}
                <View style={styles.rankColumn}>
                  <View style={[
                    styles.rankBadgeContainer,
                    isTopTier(entry.rank) && styles.topTierBadge
                  ]}>
                    <Text style={[
                      styles.rankText,
                      isTopTier(entry.rank) && styles.topTierRankText
                    ]}>
                      {entry.rank}
                    </Text>
                  </View>
                </View>

                {/* Player */}
                <View style={styles.playerColumn}>
                  <Text style={[
                    styles.playerName,
                    isCurrentUser && styles.currentUserText
                  ]}>
                    {user?.username || 'Unknown'}
                    {isCurrentUser && ' (You)'}
                  </Text>
                  {isTopTier(entry.rank) && (
                    <Trophy size={14} color={Colors.dark.tint} weight="fill" />
                  )}
                </View>

                {/* Credits */}
                <Text style={styles.creditsText}>
                  {entry.score.toFixed(0)}
                </Text>

                {/* P/L */}
                <Text style={[
                  styles.plText,
                  entry.score > 0 ? styles.positiveText :
                  entry.score < 0 ? styles.negativeText : {}
                ]}>
                  {entry.score > 0 ? '+' : ''}{entry.score.toFixed(0)}
                </Text>

                {/* Payout */}
                <Text style={[
                  styles.payoutText,
                  payout > 0 && styles.payoutActive
                ]}>
                  {payout > 0 ? `$${payout}` : '$0'}
                </Text>
              </View>
            );
          })
        )}

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
  header: {
    backgroundColor: Colors.dark.card,
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    ...Typography.title.large,
    color: Colors.dark.text,
    letterSpacing: 3,
    fontFamily: Fonts.display,
  },
  refreshButton: {
    padding: 8,
  },

  // Pool Overview
  poolOverview: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  overviewItem: {
    flex: 1,
    alignItems: 'center',
  },
  overviewLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    fontSize: 9,
  },
  overviewValue: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 14,
  },
  overviewDivider: {
    width: 1,
    backgroundColor: Colors.dark.border,
  },

  // Your Position Card
  yourPositionCard: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.tint + '30',
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 10,
  },
  rankBadge: {
    ...Typography.body.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 18,
  },
  positionStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 9,
    marginBottom: 4,
  },
  statValue: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 8,
  },
  positiveText: {
    color: Colors.dark.success,
  },
  negativeText: {
    color: Colors.dark.danger,
  },

  // Table Header
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardElevated,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    alignItems: 'center',
  },
  headerText: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 9,
  },
  rankHeader: {
    width: 35,
  },
  playerHeader: {
    flex: 1,
  },
  unitsHeader: {
    width: 60,
    textAlign: 'right',
  },
  plHeader: {
    width: 55,
    textAlign: 'right',
  },
  payoutHeader: {
    width: 60,
    textAlign: 'right',
  },

  // List
  listContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  currentUserRow: {
    backgroundColor: Colors.dark.tint + '10',
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.tint,
  },

  // Rank Column
  rankColumn: {
    width: 35,
    alignItems: 'center',
  },
  rankBadgeContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  topTierBadge: {
    backgroundColor: Colors.dark.tint + '20',
    borderColor: Colors.dark.tint,
  },
  rankText: {
    ...Typography.body.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 13,
  },
  topTierRankText: {
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
  },

  // Player Column
  playerColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontSize: 13,
  },
  currentUserText: {
    color: Colors.dark.tint,
    fontFamily: Fonts.medium,
  },

  // Credits Column
  creditsText: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    width: 60,
    textAlign: 'right',
    fontFamily: Fonts.medium,
    fontSize: 13,
  },

  // P/L Column
  plText: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    width: 55,
    textAlign: 'right',
    fontFamily: Fonts.display,
    fontSize: 13,
  },

  // Payout Column
  payoutText: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    width: 60,
    textAlign: 'right',
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  payoutActive: {
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
  },

  bottomSpacing: {
    height: 80,
  },

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    marginTop: 16,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...Typography.body.large,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  emptySubtext: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
