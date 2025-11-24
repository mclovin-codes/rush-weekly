import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

import { LeaderboardEntry } from '@/constants/mock-data';
import { Colors, Fonts } from '@/constants/theme';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
}

export default function LeaderboardRow({ entry }: LeaderboardRowProps) {
  
  return (
    <View style={[styles.row, entry.isUser && styles.userRow]}>
      
      <View style={styles.userInfo}>
        <Text style={[styles.username, entry.isUser && styles.userText]}>
          {entry.username}
        </Text>
        <Text style={styles.units}>
          {entry.units.toLocaleString()} units{' '}
          <Text style={[
            styles.change,
            { color: entry.change > 0 ? Colors.dark.success : Colors.dark.danger }
          ]}>
            ({entry.change > 0 ? '+' : ''}{entry.change}) {entry.change > 0 ? '↗' : '↘'}
          </Text>
        </Text>
      </View>
      {/* <View style={styles.potential}>
        {entry.potentialWinnings > 0 && (
          <Text style={styles.potentialText}>
            Potential: ${entry.potentialWinnings}
          </Text>
        )}
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    padding: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  userRow: {
    borderWidth: 2,
    borderColor: Colors.dark.tint,
    backgroundColor: Colors.dark.tint + '10', // Add subtle background
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 16,
    fontFamily: Fonts.primaryBold,
    color: Colors.dark.text,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    fontSize: 16,
    fontFamily: Fonts.primaryBold,
    color: Colors.dark.text,
  },
  userText: {
    color: Colors.dark.tint,
  },
  units: {
    fontSize: 14,
    fontFamily: Fonts.primary,
    color: Colors.dark.icon,
    marginTop: 2,
  },
  change: {
    fontFamily: Fonts.primaryMedium,
  },
  potential: {
    alignItems: 'flex-end',
  },
  potentialText: {
    fontSize: 12,
    fontFamily: Fonts.condensed,
    color: Colors.dark.success,
  },
});