import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Fonts, Typography } from '@/constants/theme';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  // Based on README schema: users table
  const user = {
    username: "player_123",
    credits: 1250, // Current betting currency
    created_at: "2024-01-15"
  };

  // Based on README schema: pool_memberships
  const currentPool = {
    week_start: "2024-12-02",
    week_end: "2024-12-08",
    rank: 23,
    total_players: 100,
    score: 1250
  };

  // Calculate some basic stats from schema
  const weekNumber = 4; // Could be calculated from created_at
  const totalBets = 47; // From bets table count
  const wonBets = 28; // From bets where status='won'
  const winRate = Math.round((wonBets / totalBets) * 100);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>PROFILE</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.section}>
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.username[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.memberSince}>
            Member since {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </Text>
        </View>
      </View>

      {/* Credits Balance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CURRENT BALANCE</Text>
        <View style={styles.creditsCard}>
          <View style={styles.creditsMain}>
            <Text style={styles.creditsAmount}>{user.credits}</Text>
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

      {/* Current Pool */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>THIS WEEK&apos;S POOL</Text>
        <View style={styles.poolCard}>
          <View style={styles.poolHeader}>
            <View>
              <Text style={styles.poolLabel}>Your Rank</Text>
              <Text style={styles.poolRank}>#{currentPool.rank}</Text>
            </View>
            <View style={styles.poolPlayers}>
              <Ionicons name="people" size={20} color={Colors.dark.textSecondary} />
              <Text style={styles.poolPlayersText}>{currentPool.total_players} players</Text>
            </View>
          </View>
          
          <View style={styles.poolDates}>
            <View style={styles.poolDateItem}>
              <Text style={styles.poolDateLabel}>Starts</Text>
              <Text style={styles.poolDateValue}>
                {new Date(currentPool.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
            <View style={styles.poolDateDivider} />
            <View style={styles.poolDateItem}>
              <Text style={styles.poolDateLabel}>Ends</Text>
              <Text style={styles.poolDateValue}>
                {new Date(currentPool.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewLeaderboardButton}
            onPress={() => router.push('/leaderboard')}
          >
            <Text style={styles.viewLeaderboardText}>View Leaderboard</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.dark.tint} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BETTING STATS</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalBets}</Text>
            <Text style={styles.statLabel}>Total Bets</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.dark.success }]}>{wonBets}</Text>
            <Text style={styles.statLabel}>Won</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.dark.danger }]}>{totalBets - wonBets}</Text>
            <Text style={styles.statLabel}>Lost</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
        </View>
      </View>

    

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
});