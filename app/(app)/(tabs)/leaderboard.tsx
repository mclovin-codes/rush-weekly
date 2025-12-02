import { ScrollView, StyleSheet, View, Text } from 'react-native';
import React from 'react';

import { mockLeaderboard } from '@/constants/mock-data';
import { Colors, Fonts, Typography } from '@/constants/theme';

export default function LeaderboardScreen() {
  const currentUserRank = 23;
  const totalPlayers = mockLeaderboard.length;

  // Calculate prize distribution (top 10 positions)
  const prizeDistribution = [
    { rank: 1, prize: '$12,500' },
    { rank: 2, prize: '$7,500' },
    { rank: 3, prize: '$5,000' },
    { rank: 4, prize: '$3,500' },
    { rank: 5, prize: '$2,500' },
    { rank: '6-10', prize: '$1,250' },
  ];

  const getPrizeForRank = (rank: number) => {
    if (rank === 1) return prizeDistribution[0].prize;
    if (rank === 2) return prizeDistribution[1].prize;
    if (rank === 3) return prizeDistribution[2].prize;
    if (rank === 4) return prizeDistribution[3].prize;
    if (rank === 5) return prizeDistribution[4].prize;
    if (rank >= 6 && rank <= 10) return prizeDistribution[5].prize;
    return '-';
  };

  const isTopTier = (rank: number) => rank <= 3;
  const isPrizeZone = (rank: number) => rank <= 10;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>LEADERBOARD</Text>

        {/* Competition Overview */}
        <View style={styles.competitionOverview}>
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Week</Text>
            <Text style={styles.overviewValue}>14</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Players</Text>
            <Text style={styles.overviewValue}>{totalPlayers}</Text>
          </View>
          <View style={styles.overviewDivider} />
          <View style={styles.overviewItem}>
            <Text style={styles.overviewLabel}>Prize Pool</Text>
            <Text style={styles.overviewValue}>$50,000</Text>
          </View>
        </View>

        {/* Your Position Card */}
        <View style={styles.yourPositionCard}>
          <View style={styles.positionLeft}>
            <Text style={styles.positionLabel}>YOUR POSITION</Text>
            <View style={styles.rankContainer}>
              <Text style={styles.rankNumber}>#{currentUserRank}</Text>
              <Text style={styles.statusText}>
                {isPrizeZone(currentUserRank) ? 'IN PRIZE ZONE' : `${currentUserRank - 10} spots from prizes`}
              </Text>
            </View>
          </View>
          <View style={styles.positionRight}>
            <Text style={styles.prizeLabel}>Current Prize</Text>
            <Text style={[styles.prizeAmount, {
              color: isPrizeZone(currentUserRank) ? Colors.dark.success : Colors.dark.textSecondary
            }]}>
              {getPrizeForRank(currentUserRank)}
            </Text>
          </View>
        </View>
      </View>

      {/* Prize Breakdown */}
      <View style={styles.prizeBreakdown}>
        <Text style={styles.breakdownTitle}>PRIZE BREAKDOWN</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.prizeScrollContent}
        >
          {prizeDistribution.map((prize, index) => (
            <View key={index} style={[
              styles.prizeCard,
              isTopTier(Number(prize.rank)) && styles.topTierCard
            ]}>
              <Text style={styles.prizeRank}>#{prize.rank}</Text>
              <Text style={styles.prizeCardAmount}>{prize.prize}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.rankHeader]}>RANK</Text>
        <Text style={[styles.headerText, styles.playerHeader]}>PLAYER</Text>
        <Text style={[styles.headerText, styles.unitsHeader]}>UNITS</Text>
        <Text style={[styles.headerText, styles.prizeHeader]}>PRIZE</Text>
      </View>

      {/* Leaderboard List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {mockLeaderboard.map((entry, index) => (
          <View key={entry.id} style={[
            styles.row,
            entry.rank === currentUserRank && styles.currentUserRow,
            isPrizeZone(entry.rank) && styles.prizeZoneRow
          ]}>
            {/* Rank Column */}
            <View style={[styles.rankColumn, isTopTier(entry.rank) && styles.topTierRank]}>
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
                <Text style={styles.medalText}>
                  {entry.rank === 1 ? 'CHAMPION' : entry.rank === 2 ? 'RUNNER UP' : 'THIRD PLACE'}
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

            {/* Prize Column */}
            <Text style={[
              styles.prizeText,
              entry.rank === currentUserRank && styles.currentUserText,
              isPrizeZone(entry.rank) && styles.prizeZoneText
            ]}>
              {getPrizeForRank(entry.rank)}
            </Text>
          </View>
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  screenTitle: {
    ...Typography.title.large,
    color: Colors.dark.text,
    letterSpacing: 3,
    marginBottom: 20,
    fontFamily: Fonts.display,
  },

  // Competition Overview
  competitionOverview: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
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
  },
  overviewValue: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
  },
  overviewDivider: {
    width: 1,
    backgroundColor: Colors.dark.border,
  },

  // Your Position Card
  yourPositionCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 8,
  },
  rankContainer: {
    flexDirection: 'column',
  },
  rankNumber: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 2,
  },
  statusText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  positionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  prizeLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  prizeAmount: {
    ...Typography.emphasis.medium,
    fontFamily: Fonts.display,
  },

  // Prize Breakdown
  prizeBreakdown: {
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  breakdownTitle: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  prizeScrollContent: {
    gap: 12,
  },
  prizeCard: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minWidth: 80,
  },
  topTierCard: {
    backgroundColor: Colors.dark.tint + '15',
    borderColor: Colors.dark.tint + '40',
  },
  prizeRank: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  prizeCardAmount: {
    ...Typography.teamName.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
  },

  // Table Header
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardElevated,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerText: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
  prizeHeader: {
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    alignItems: 'center',
  },
  currentUserRow: {
    backgroundColor: Colors.dark.tint + '10',
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.tint,
  },
  prizeZoneRow: {
    backgroundColor: Colors.dark.card + '30',
  },

  // Rank Column
  rankColumn: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    borderRadius: 6,
  },
  topTierRank: {
    backgroundColor: Colors.dark.tint + '20',
  },
  rankText: {
    ...Typography.teamName.small,
    color: Colors.dark.text,
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
  },
  currentUserText: {
    color: Colors.dark.tint,
    fontFamily: Fonts.medium,
  },
  medalText: {
    ...Typography.meta.small,
    color: Colors.dark.tint,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Units Column
  unitsText: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    width: 70,
    textAlign: 'right',
    fontFamily: Fonts.medium,
  },

  // Prize Column
  prizeText: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    width: 70,
    textAlign: 'right',
    fontFamily: Fonts.medium,
  },
  prizeZoneText: {
    color: Colors.dark.success,
  },

  bottomSpacing: {
    height: 100,
  },
});