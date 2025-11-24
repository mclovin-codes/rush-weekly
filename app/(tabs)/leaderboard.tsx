import { ScrollView, StyleSheet, View, Text } from 'react-native';
import React from 'react';

import { mockLeaderboard } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';
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
          <View style={styles.divider} />
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Prize Zone</Text>
            <Text style={[styles.statusValue, styles.prizeValue]}>Top {prizePositions}</Text>
          </View>
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
    backgroundColor: '#0A0A0A',
  },
  header: {
    backgroundColor: '#141414',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 24,
  },
  poolCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252525',
  },
  poolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  poolName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  weekLabel: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
  },
  playerCount: {
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  playerCountNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  playerCountLabel: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252525',
    alignItems: 'center',
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  prizeValue: {
    color: '#10B981',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#252525',
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
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  listHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666666',
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