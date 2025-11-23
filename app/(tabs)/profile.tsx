import { ScrollView, StyleSheet, View, Text } from 'react-native';
import React from 'react';

import { mockUserProfile } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';

export default function ProfileScreen() {
  const { username, currentPool, rank, totalPlayers, units, weeklyChange, betsPlaced, winRate, biggestWin, currentStreak, friends } = mockUserProfile;

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{username[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>@{username}</Text>
        </View>

        <View style={styles.poolInfo}>
          <Text style={styles.poolText}>Current Pool: {currentPool}</Text>
          <Text style={styles.rankText}>Rank: #{rank} of {totalPlayers}</Text>
        </View>

        <View style={styles.unitsCard}>
          <Text style={styles.unitsAmount}>{units} UNITS</Text>
          <Text style={[styles.unitsChange, { color: weeklyChange > 0 ? Colors.dark.success : Colors.dark.danger }]}>{weeklyChange > 0 ? '+' : ''}{weeklyChange} this week</Text>
        </View>
      </View>

      {/* Weekly Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{betsPlaced}</Text>
            <Text style={styles.statLabel}>Bets Placed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>+{biggestWin}</Text>
            <Text style={styles.statLabel}>Biggest Win</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentStreak}W</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
        </View>
      </View>

      {/* Friends Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends ({friends.length})</Text>
          <Text style={styles.addFriend}>+ Add</Text>
        </View>
        {friends.map((friend) => (
          <View key={friend.id} style={styles.friendItem}>
            <Text style={styles.friendUsername}>{friend.username}</Text>
            <View style={styles.friendStats}>
              <Text style={styles.friendUnits}>{friend.units} units</Text>
              <Text style={[styles.friendChange, { color: friend.change > 0 ? Colors.dark.success : Colors.dark.danger }]}>
                {friend.change > 0 ? '↗' : '↘'}
              </Text>
            </View>
          </View>
        ))}
        <Text style={styles.viewAllFriends}>View All Friends →</Text>
      </View>

      {/* Historic Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historic Stats</Text>
        <View style={styles.historicStats}>
          <View style={styles.historicItem}>
            <Text style={styles.historicLabel}>All-Time Record</Text>
            <Text style={styles.historicValue}>58% Win Rate</Text>
          </View>
          <View style={styles.historicItem}>
            <Text style={styles.historicLabel}>Best Weekly Finish</Text>
            <Text style={styles.historicValue}>#3 (Week 8)</Text>
          </View>
          <View style={styles.historicItem}>
            <Text style={styles.historicLabel}>Total Competitions</Text>
            <Text style={styles.historicValue}>12</Text>
          </View>
          <View style={styles.historicItem}>
            <Text style={styles.historicLabel}>Total Winnings</Text>
            <Text style={styles.historicValue}>$2,450</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  headerCard: {
    backgroundColor: Colors.dark.card,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  poolInfo: {
    marginBottom: 16,
  },
  poolText: {
    fontSize: 16,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  rankText: {
    fontSize: 14,
    color: Colors.dark.icon,
    textAlign: 'center',
    marginTop: 4,
  },
  unitsCard: {
    backgroundColor: Colors.dark.background,
    padding: 16,
    borderRadius: 8,
    width: '100%',
    borderWidth: 2,
    borderColor: Colors.dark.tint,
  },
  unitsAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
    textAlign: 'center',
  },
  unitsChange: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    backgroundColor: Colors.dark.card,
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  addFriend: {
    fontSize: 16,
    color: Colors.dark.tint,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: Colors.dark.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    marginTop: 4,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.background,
  },
  friendUsername: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  friendStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  friendUnits: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  friendChange: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  viewAllFriends: {
    fontSize: 16,
    color: Colors.dark.tint,
    textAlign: 'center',
    marginTop: 16,
  },
  historicStats: {
    gap: 12,
  },
  historicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historicLabel: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  historicValue: {
    fontSize: 16,
    color: Colors.dark.icon,
  },
});