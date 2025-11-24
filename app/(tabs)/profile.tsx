import { ScrollView, StyleSheet, View, Text } from 'react-native';
import React from 'react';

import { mockUserProfile } from '@/constants/mock-data';
import { Colors, Fonts, Typography } from '@/constants/theme';

export default function ProfileScreen() {
  const { username, currentPool, rank, totalPlayers, units, weeklyChange, betsPlaced, winRate, biggestWin, currentStreak } = mockUserProfile;

  // Calculate additional metrics
  const profitLoss = weeklyChange;
  const isWinning = profitLoss > 0;
  const percentile = Math.round((1 - rank / totalPlayers) * 100);
  const rankCategory = rank <= 3 ? 'Elite' : rank <= 10 ? 'Prize Zone' : rank <= 50 ? 'Top 25%' : 'Chasing';
  const trendDirection = profitLoss >= 0 ? 'up' : 'down';

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>PLAYER PROFILE</Text>

        {/* Main Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.playerInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{username[0].toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.username}>@{username}</Text>
                <View style={styles.poolInfo}>
                  <Text style={styles.poolName}>{currentPool}</Text>
                  <Text style={styles.rankBadgeText}>{rankCategory}</Text>
                </View>
              </View>
            </View>
            <View style={styles.rankInfo}>
              <Text style={styles.rankNumber}>#{rank}</Text>
              <Text style={styles.rankContext}>of {totalPlayers}</Text>
              <Text style={styles.percentile}>Top {percentile}%</Text>
            </View>
          </View>

          <View style={styles.balanceMain}>
            <View style={styles.balanceLeft}>
              <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceAmount}>{units.toLocaleString()}</Text>
                <Text style={styles.balanceUnit}>units</Text>
              </View>
            </View>
           
          </View>
        </View>
      </View>

      {/* Performance Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PERFORMANCE OVERVIEW</Text>

        <View style={styles.performanceGrid}>
          

          {/* All Time */}
          <View style={styles.performanceSection}>
            <Text style={styles.performanceSubtitle}>ALL TIME</Text>
            <View style={styles.careerStats}>
              <View style={styles.careerItem}>
                <Text style={styles.careerValue}>58%</Text>
                <Text style={styles.careerLabel}>Win Rate</Text>
              </View>
              <View style={styles.careerItem}>
                <Text style={styles.careerValue}>#3</Text>
                <Text style={styles.careerLabel}>Best</Text>
              </View>
              <View style={styles.careerItem}>
                <Text style={styles.careerValue}>12</Text>
                <Text style={styles.careerLabel}>Weeks</Text>
              </View>
              <View style={styles.careerItem}>
                <Text style={styles.careerValue}>$2.4K</Text>
                <Text style={styles.careerLabel}>Winnings</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Competition Standing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>COMPETITION STANDING</Text>

        <View style={styles.standingCard}>
          <View style={styles.standingHeader}>
            <View style={styles.standingPosition}>
              <Text style={styles.positionLabel}>Current Position</Text>
              <View style={styles.positionRow}>
                <Text style={styles.positionNumber}>#{rank}</Text>
                <Text style={styles.positionChange}>
                  {rank <= 10 ? 'In Prize Zone' : `${Math.max(0, rank - 10)} from prizes`}
                </Text>
              </View>
            </View>
            <View style={styles.standingMetric}>
              <View style={[
                styles.standingBadge,
                rank <= 10 ? styles.standingBadgeSuccess : styles.standingBadgeNeutral
              ]}>
                <Text style={[
                  styles.standingBadgeText,
                  rank <= 10 ? styles.standingBadgeTextSuccess : styles.standingBadgeTextNeutral
                ]}>
                  {rank <= 3 ? 'Elite' : rank <= 10 ? 'Qualified' : 'Chasing'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.standingBars}>
            <View style={styles.standingBar}>
              <Text style={styles.standingBarLabel}>Percentile</Text>
              <View style={styles.standingBarTrack}>
                <View style={[styles.standingBarFill, { width: `${percentile}%` }]} />
              </View>
              <Text style={styles.standingBarValue}>Top {percentile}%</Text>
            </View>
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

  // Balance Card
  balanceCard: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  playerInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    ...Typography.emphasis.large,
    color: Colors.dark.background,
    fontFamily: Fonts.display,
  },
  username: {
    ...Typography.teamName.medium,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  poolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  poolName: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  rankBadgeText: {
    ...Typography.meta.small,
    color: Colors.dark.tint,
    fontWeight: '600',
  },
  rankInfo: {
    alignItems: 'flex-end',
  },
  rankNumber: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
  },
  rankContext: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  percentile: {
    ...Typography.emphasis.small,
    color: Colors.dark.tint,
  },

  // Balance Main
  balanceMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLeft: {
    flex: 1,
  },
  balanceLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  balanceAmount: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
  },
  balanceUnit: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  changeCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    minWidth: 100,
    position: 'relative',
  },
  changeCardPositive: {
    borderColor: Colors.dark.success + '40',
    backgroundColor: Colors.dark.success + '10',
  },
  changeCardNegative: {
    borderColor: Colors.dark.danger + '40',
    backgroundColor: Colors.dark.danger + '10',
  },
  changeLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  changeValue: {
    ...Typography.emphasis.medium,
    fontFamily: Fonts.display,
  },
  changeValuePositive: {
    color: Colors.dark.success,
  },
  changeValueNegative: {
    color: Colors.dark.danger,
  },
  trendIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendUp: {
    backgroundColor: Colors.dark.success + '20',
  },
  trendDown: {
    backgroundColor: Colors.dark.danger + '20',
  },
  trendIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Section
  section: {
    backgroundColor: Colors.dark.card,
    marginTop: 16,
    padding: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionTitle: {
    ...Typography.sectionHeader.medium,
    color: Colors.dark.text,
    marginBottom: 20,
    fontFamily: Fonts.display,
  },

  // Performance Overview
  performanceGrid: {
    gap: 20,
  },
  performanceSection: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  performanceSubtitle: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  metricValue: {
    ...Typography.title.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 4,
  },
  metricLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },

  // Career Stats
  careerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  careerItem: {
    flex: 1,
    alignItems: 'center',
  },
  careerValue: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 4,
  },
  careerLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },

  // Competition Standing
  standingCard: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  standingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  standingPosition: {
    flex: 1,
  },
  positionLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  positionRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  positionNumber: {
    ...Typography.title.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
  },
  positionChange: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  standingMetric: {
    alignItems: 'flex-end',
  },
  standingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  standingBadgeSuccess: {
    backgroundColor: Colors.dark.success + '20',
  },
  standingBadgeNeutral: {
    backgroundColor: Colors.dark.card,
    borderColor: Colors.dark.border,
    borderWidth: 1,
  },
  standingBadgeText: {
    ...Typography.emphasis.small,
    fontWeight: '600',
  },
  standingBadgeTextSuccess: {
    color: Colors.dark.success,
  },
  standingBadgeTextNeutral: {
    color: Colors.dark.textSecondary,
  },

  // Standing Bars
  standingBars: {
    gap: 16,
  },
  standingBar: {
    gap: 8,
  },
  standingBarLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
  },
  standingBarTrack: {
    height: 8,
    backgroundColor: Colors.dark.card,
    borderRadius: 4,
    overflow: 'hidden',
  },
  standingBarFill: {
    height: '100%',
    backgroundColor: Colors.dark.tint,
    borderRadius: 4,
  },
  standingBarValue: {
    ...Typography.emphasis.small,
    color: Colors.dark.text,
    textAlign: 'right',
  },

  bottomPadding: {
    height: 40,
  },
});