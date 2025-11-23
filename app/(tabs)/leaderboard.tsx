import { ScrollView, StyleSheet, View, Text } from 'react-native';
import React from 'react';

import { mockLeaderboard } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';
import LeaderboardRow from '@/components/leaderboard-row';

export default function LeaderboardScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.poolInfo}>
            <View style={styles.poolNameContainer}>
              <Text style={styles.poolName}>
                Pool C - Week 14
              </Text>
            </View>
            <Text style={styles.totalPlayers}>
              {mockLeaderboard.length} active players
            </Text>
          </View>
          <View style={styles.prizeInfo}>
            <Text style={styles.prizeIndicator}>Top 10 win prizes</Text>
            <Text style={styles.yourRank}>
              You're #23
            </Text>
          </View>
        </View>
      </View>

      {/* Leaderboard List */}
      <ScrollView style={styles.leaderboardContainer}>
        {mockLeaderboard.map((entry) => (
          <LeaderboardRow key={entry.id} entry={entry} />
        ))}
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  headerContent: {
    gap: 8,
  },
  poolInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  poolNameContainer: {
    flex: 1,
  },
  poolName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  totalPlayers: {
    fontSize: 14,
    color: Colors.dark.icon,
    marginTop: 4,
  },
  prizeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prizeIndicator: {
    fontSize: 14,
    color: Colors.dark.success,
    fontWeight: '500',
  },
  yourRank: {
    fontSize: 16,
    color: Colors.dark.accent,
    fontWeight: 'bold',
  },
  leaderboardContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});