import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

import { mockLeaderboard } from '@/constants/mock-data';
import { Colors, Fonts, Typography } from '@/constants/theme';

export default function LeaderboardScreen() {
  const currentUserRank = 23;
  const currentUserId = 'user-123'; // This would come from auth context
  const totalPlayers = mockLeaderboard.length;

  // Weekly pool info (from pools table)
  const poolInfo = {
    weekNumber: 14,
    weekStart: '2025-11-25',
    weekEnd: '2025-12-01',
    poolSize: 100,
    isActive: true,
  };

  const isTopTier = (rank: number) => rank <= 3;
  const isTop10 = (rank: number) => rank <= 10;

  // Calculate time remaining in the week
  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(poolInfo.weekEnd);
    const diff = end.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>LEADERBOARD</Text>

        {/* Pool Overview */}
        <View style={styles.poolOverview}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Week</Text>
            <Text style={styles.overviewValue}>{poolInfo.weekNumber}</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Pool Size</Text>
            <Text style={styles.overviewValue}>{poolInfo.poolSize}</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Ends In</Text>
            <Text style={styles.overviewValue}>{getTimeRemaining()}</Text>
          </View>
        </View>

        {/* Your Position Card */}
        <View style={styles.yourPositionCard}>
          <View style={styles.positionLeft}>
            <Text style={styles.positionLabel}>YOUR POSITION</Text>
            <View style={styles.rankContainer}>
              <Text style={styles.rankNumber}>#{currentUserRank}</Text>
              <Text style={styles.statusText}>
                {isTop10(currentUserRank) 
                  ? 'Top 10%' 
                  : `${Math.round((currentUserRank / totalPlayers) * 100)}th percentile`}
              </Text>
            </View>
          </View>
          <View style={styles.positionRight}>
            <Text style={styles.unitsLabel}>Your Units</Text>
            <Text style={styles.unitsAmount}>
              {mockLeaderboard.find(p => p.rank === currentUserRank)?.units || 980}
            </Text>
          </View>
        </View>
      </View>

    

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.rankHeader]}>RANK</Text>
        <Text style={[styles.headerText, styles.playerHeader]}>PLAYER</Text>
        <Text style={[styles.headerText, styles.unitsHeader]}>UNITS</Text>
      </View>

      {/* Leaderboard List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {mockLeaderboard.map((entry) => (
          <TouchableOpacity 
            key={entry.id} 
            style={[
              styles.row,
              entry.rank === currentUserRank && styles.currentUserRow,
              isTop10(entry.rank) && styles.top10Row
            ]}
          >
            {/* Rank Column */}
            <View style={[
              styles.rankColumn, 
              isTopTier(entry.rank) && styles.topTierRank
            ]}>
              <Text style={[
                styles.rankText,
                isTopTier(entry.rank) && styles.topTierRankText,
                entry.rank === currentUserRank && styles.currentUserRankText
              ]}>
                #{entry.rank}
              </Text>
            </View>

            {/* Player Column */}
            <View style={styles.playerColumn}>
              <Text style={[
                styles.playerName,
                entry.rank === currentUserRank && styles.currentUserText
              ]}>
                {entry.username}
              </Text>
              {isTopTier(entry.rank) && (
                <Text style={styles.tierBadge}>
                  {entry.rank === 1 ? 'CHAMPION' : 
                   entry.rank === 2 ? 'RUNNER UP' : 
                   'THIRD'}
                </Text>
              )}
            </View>

            {/* Units Column */}
            <Text style={[
              styles.unitsText,
              entry.rank === currentUserRank && styles.currentUserText
            ]}>
              {entry.units.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}

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
  screenTitle: {
    ...Typography.title.large,
    color: Colors.dark.text,
    letterSpacing: 3,
    marginBottom: 16,
    fontFamily: Fonts.display,
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
    fontSize: 10,
  },
  overviewValue: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
  },
  overviewDivider: {
    width: 1,
    backgroundColor: Colors.dark.border,
  },

  // Your Position Card
  yourPositionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.tint + '30',
  },
  positionLeft: {
    flex: 1,
  },
  positionLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    fontSize: 10,
  },
  rankContainer: {
    flexDirection: 'column',
  },
  rankNumber: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 2,
    fontSize: 28,
  },
  statusText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 11,
  },
  positionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  unitsLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    fontSize: 10,
  },
  unitsAmount: {
    ...Typography.emphasis.medium,
    fontFamily: Fonts.display,
    color: Colors.dark.tint,
    fontSize: 20,
  },

  // Podium Section
  podiumSection: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  podiumTitle: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 1.5,
  },
  podiumContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  podiumCard: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  firstPlace: {
    backgroundColor: Colors.dark.tint + '20',
    borderColor: Colors.dark.tint,
    borderWidth: 2,
  },
  secondPlace: {
    backgroundColor: Colors.dark.cardElevated,
    borderColor: Colors.dark.border + '80',
  },
  thirdPlace: {
    backgroundColor: Colors.dark.cardElevated,
    borderColor: Colors.dark.border + '60',
  },
  podiumRankBadge: {
    backgroundColor: Colors.dark.tint + '30',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  podiumRankText: {
    ...Typography.meta.small,
    color: Colors.dark.tint,
    fontFamily: Fonts.medium,
    fontSize: 10,
  },
  podiumUsername: {
    ...Typography.body.small,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
    marginBottom: 4,
    fontSize: 12,
  },
  podiumUnits: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
  },
  podiumUnitsLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 9,
  },

  // Table Header
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardElevated,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerText: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 10,
  },
  rankHeader: {
    width: 50,
  },
  playerHeader: {
    flex: 1,
    marginLeft: 12,
  },
  unitsHeader: {
    width: 70,
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
  },
  currentUserRow: {
    backgroundColor: Colors.dark.tint + '10',
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.tint,
  },
  top10Row: {
    backgroundColor: Colors.dark.card,
  },

  // Rank Column
  rankColumn: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    borderRadius: 6,
  },
  topTierRank: {
    backgroundColor: Colors.dark.tint + '20',
  },
  rankText: {
    ...Typography.teamName.small,
    color: Colors.dark.text,
    fontSize: 13,
  },
  topTierRankText: {
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
  },
  currentUserRankText: {
    color: Colors.dark.tint,
  },

  // Player Column
  playerColumn: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  playerName: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    marginBottom: 2,
    fontSize: 13,
  },
  currentUserText: {
    color: Colors.dark.tint,
    fontFamily: Fonts.medium,
  },
  tierBadge: {
    ...Typography.meta.small,
    color: Colors.dark.tint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 9,
  },

  // Units Column
  unitsText: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    width: 70,
    textAlign: 'right',
    fontFamily: Fonts.medium,
    fontSize: 13,
  },

  bottomSpacing: {
    height: 80,
  },
});