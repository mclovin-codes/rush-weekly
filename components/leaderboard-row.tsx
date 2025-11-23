import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

import { LeaderboardEntry } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
}

export default function LeaderboardRow({ entry }: LeaderboardRowProps) {
  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  const medalIcon = getMedalIcon(entry.rank);

  return (
    <View style={[styles.row, entry.isUser && styles.userRow]}>
      <View style={styles.rankContainer}>
        <Text style={styles.rank}>
          {medalIcon || `#${entry.rank}`}
        </Text>
      </View>
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
      <View style={styles.potential}>
        {entry.potentialWinnings > 0 && (
          <Text style={styles.potentialText}>
            Potential: ${entry.potentialWinnings}
          </Text>
        )}
      </View>
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
    borderColor: Colors.dark.accent,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  userText: {
    color: Colors.dark.accent,
  },
  units: {
    fontSize: 14,
    color: Colors.dark.icon,
    marginTop: 2,
  },
  change: {
    fontWeight: '500',
  },
  potential: {
    alignItems: 'flex-end',
  },
  potentialText: {
    fontSize: 12,
    color: Colors.dark.success,
    fontWeight: '500',
  },
});