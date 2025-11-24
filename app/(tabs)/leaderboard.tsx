import { ScrollView, StyleSheet, View, Text } from 'react-native';
import React from 'react';

import { mockLeaderboard } from '@/constants/mock-data';
import { Colors, Fonts, Typography } from '@/constants/theme';
import LeaderboardRow from '@/components/leaderboard-row';

export default function LeaderboardScreen() {
  const currentUserRank = 23;
  const totalPlayers = mockLeaderboard.length;
  const prizePositions = 10;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>LEADERBOARD</Text>
        
        {/* Pool Info Card */}
        <View style={styles.poolCard}>
          <View style={styles.poolHeader}>
            <View>
              <Text style={styles.poolName}>Pool C</Text>
              <Text style={styles.weekLabel}>Week 14 Competition</Text>
            </View>
            <View style={styles.playerCount}>
              <Text style={styles.playerCountNumber}>{totalPlayers}</Text>
              <Text style={styles.playerCountLabel}>players</Text>
            </View>
          </View>
        </View>

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Your Rank</Text>
            <Text style={styles.statusValue}>#{currentUserRank}</Text>
          </View>
          {/* <View style={styles.divider} />
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Prize Zone</Text>
            <Text style={[styles.statusValue, styles.prizeValue]}>Top {prizePositions}</Text>
          </View> */}
        </View>
      </View>

      {/* Leaderboard List */}
      <ScrollView 
        style={styles.leaderboardContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderText}>Rank</Text>
          <Text style={[styles.listHeaderText, styles.listHeaderName]}>Player</Text>
          <Text style={styles.listHeaderText}>Units</Text>
        </View>

        {mockLeaderboard.map((entry) => (
          <LeaderboardRow key={entry.id} entry={entry} />
        ))}
        
        <View style={styles.bottomPadding} />
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontFamily: Fonts.display,
    color: Colors.dark.text,
    letterSpacing: 4,
    marginBottom: 24,
  },
  poolCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  poolName: {
    ...Typography.teamName.large,
    color: Colors.dark.text,
    marginBottom: 4,
    fontFamily: Fonts.display
  },
  weekLabel: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.icon,
  },
  playerCount: {
    alignItems: 'center',
    backgroundColor: Colors.dark.cardElevated,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  playerCountNumber: {
    fontSize: 24,
    fontFamily: Fonts.display,
    color: Colors.dark.text,
    lineHeight: 28,
  },
  playerCountLabel: {
    ...Typography.meta.small,
    color: Colors.dark.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBar: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
    alignItems: 'center',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    ...Typography.meta.small,
    color: Colors.dark.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statusValue: {
    ...Typography.title.small,
    color: Colors.dark.text,
  },
  prizeValue: {
    color: Colors.dark.success,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.dark.icon,
    marginHorizontal: 16,
  },
  leaderboardContainer: {
    flex: 1,
    paddingTop: 8,
  },
  listHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  listHeaderText: {
    ...Typography.meta.small,
    color: Colors.dark.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    width: 60,
  },
  listHeaderName: {
    flex: 1,
  },
  bottomPadding: {
    height: 20,
  },
});