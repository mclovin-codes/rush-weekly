import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

import { mockUserProfile } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';

export default function ProfileScreen() {
  const { username, currentPool, rank, totalPlayers, units, weeklyChange, betsPlaced, winRate, biggestWin, currentStreak, friends } = mockUserProfile;

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>PROFILE</Text>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{username[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>@{username}</Text>
          
          {/* Pool Info */}
          <View style={styles.poolBadge}>
            <Text style={styles.poolText}>{currentPool}</Text>
          </View>
          <Text style={styles.rankText}>
            #{rank} of {totalPlayers} players
          </Text>
        </View>

        {/* Units Card */}
        <View style={styles.unitsCard}>
          <View style={styles.unitsRow}>
            <Text style={styles.unitsLabel}>Total Balance</Text>
            <View style={styles.changeContainer}>
              <Text style={[
                styles.changeText,
                { color: weeklyChange >= 0 ? '#10B981' : '#EF4444' }
              ]}>
                {weeklyChange > 0 ? '+' : ''}{weeklyChange}
              </Text>
            </View>
          </View>
          <Text style={styles.unitsAmount}>{units.toLocaleString()}</Text>
          <Text style={styles.unitsSubtext}>units</Text>
        </View>
      </View>

      {/* Weekly Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>This Week</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{betsPlaced}</Text>
            <Text style={styles.statLabel}>Bets</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>+{biggestWin}</Text>
            <Text style={styles.statLabel}>Best Win</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentStreak}W</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>
      </View>

      {/* Friends Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends</Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.addButton}>+ Add</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.friendsList}>
          {friends.slice(0, 4).map((friend, index) => (
            <TouchableOpacity 
              key={friend.id} 
              style={[
                styles.friendItem,
                index === friends.slice(0, 4).length - 1 && styles.lastFriendItem
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.friendLeft}>
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>
                    {friend.username[0].toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.friendUsername}>{friend.username}</Text>
              </View>
              <View style={styles.friendRight}>
                <Text style={styles.friendUnits}>{friend.units}</Text>
                <View style={[
                  styles.friendChangeIndicator,
                  { backgroundColor: friend.change > 0 ? '#10B98120' : '#EF444420' }
                ]}>
                  <Text style={[
                    styles.friendChangeText,
                    { color: friend.change > 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    {friend.change > 0 ? '↗' : '↘'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.viewAllButton}
          activeOpacity={0.7}
        >
          <Text style={styles.viewAllText}>View All Friends</Text>
        </TouchableOpacity>
      </View>

      {/* Historic Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Time</Text>
        <View style={styles.historicStats}>
          <View style={styles.historicItem}>
            <Text style={styles.historicLabel}>Win Rate</Text>
            <Text style={styles.historicValue}>58%</Text>
          </View>
          <View style={styles.historicDivider} />
          <View style={styles.historicItem}>
            <Text style={styles.historicLabel}>Best Finish</Text>
            <Text style={styles.historicValue}>#3</Text>
          </View>
          <View style={styles.historicDivider} />
          <View style={styles.historicItem}>
            <Text style={styles.historicLabel}>Competitions</Text>
            <Text style={styles.historicValue}>12</Text>
          </View>
          <View style={styles.historicDivider} />
          <View style={styles.historicItem}>
            <Text style={styles.historicLabel}>Winnings</Text>
            <Text style={styles.historicValue}>$2,450</Text>
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
  profileCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#252525',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000000',
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  poolBadge: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  poolText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rankText: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
  },
  unitsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#252525',
  },
  unitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitsLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1F1F1F',
  },
  changeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  unitsAmount: {
    fontSize: 44,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  unitsSubtext: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#141414',
    marginTop: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addButton: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  friendsList: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252525',
    overflow: 'hidden',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  lastFriendItem: {
    borderBottomWidth: 0,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  friendUsername: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  friendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  friendUnits: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  friendChangeIndicator: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendChangeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  viewAllButton: {
    marginTop: 12,
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#252525',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  historicStats: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252525',
  },
  historicItem: {
    flex: 1,
    alignItems: 'center',
  },
  historicLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  historicValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  historicDivider: {
    width: 1,
    backgroundColor: '#252525',
    marginHorizontal: 8,
  },
  bottomPadding: {
    height: 20,
  },
});