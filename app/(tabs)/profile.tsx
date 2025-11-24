import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

import { mockUserProfile } from '@/constants/mock-data';
import { Colors, Fonts } from '@/constants/theme';

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
                { color: weeklyChange >= 0 ? Colors.dark.success : Colors.dark.danger }
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
                  { backgroundColor: friend.change > 0 ? Colors.dark.successBg : Colors.dark.dangerBg }
                ]}>
                  <Text style={[
                    styles.friendChangeText,
                    { color: friend.change > 0 ? Colors.dark.success : Colors.dark.danger }
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
  profileCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
    fontFamily: Fonts.display,
    color: Colors.dark.background,
  },
  username: {
    fontSize: 20,
    fontFamily: Fonts.primaryBold,
    color: Colors.dark.text,
    marginBottom: 12,
  },
  poolBadge: {
    backgroundColor: Colors.dark.cardElevated,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  poolText: {
    fontSize: 13,
    fontFamily: Fonts.condensed,
    color: Colors.dark.text,
    textTransform: 'uppercase',
  },
  rankText: {
    fontSize: 13,
    fontFamily: Fonts.primary,
    color: Colors.dark.icon,
  },
  unitsCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
  },
  unitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitsLabel: {
    fontSize: 11,
    fontFamily: Fonts.condensed,
    color: Colors.dark.icon,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.dark.cardElevated,
  },
  changeText: {
    fontSize: 13,
    fontFamily: Fonts.primaryBold,
  },
  unitsAmount: {
    fontSize: 44,
    fontFamily: Fonts.display,
    color: Colors.dark.text,
    letterSpacing: -1,
  },
  unitsSubtext: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    color: Colors.dark.icon,
  },
  section: {
    backgroundColor: Colors.dark.card,
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
    fontFamily: Fonts.primaryBold,
    color: Colors.dark.text,
  },
  addButton: {
    fontSize: 15,
    fontFamily: Fonts.primaryBold,
    color: Colors.dark.tint,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: Colors.dark.cardElevated,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.icon,
  },
  statValue: {
    fontSize: 28,
    fontFamily: Fonts.display,
    color: Colors.dark.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: Fonts.condensed,
    color: Colors.dark.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  friendsList: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
    overflow: 'hidden',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
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
    backgroundColor: Colors.dark.icon,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendAvatarText: {
    fontSize: 16,
    fontFamily: Fonts.primaryBold,
    color: Colors.dark.text,
  },
  friendUsername: {
    fontSize: 15,
    fontFamily: Fonts.primaryBold,
    color: Colors.dark.text,
  },
  friendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  friendUnits: {
    fontSize: 15,
    fontFamily: Fonts.display,
    color: Colors.dark.text,
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
    fontFamily: Fonts.primaryBold,
  },
  viewAllButton: {
    marginTop: 12,
    backgroundColor: Colors.dark.card,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.icon,
  },
  viewAllText: {
    fontSize: 15,
    fontFamily: Fonts.primaryBold,
    color: Colors.dark.text,
  },
  historicStats: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
  },
  historicItem: {
    flex: 1,
    alignItems: 'center',
  },
  historicLabel: {
    fontSize: 11,
    fontFamily: Fonts.condensed,
    color: Colors.dark.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  historicValue: {
    fontSize: 18,
    fontFamily: Fonts.primaryBold,
    color: Colors.dark.text,
  },
  historicDivider: {
    width: 1,
    backgroundColor: Colors.dark.border,
    marginHorizontal: 8,
  },
  bottomPadding: {
    height: 20,
  },
});