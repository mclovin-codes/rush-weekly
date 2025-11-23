import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

import { Game } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';

interface GameCardProps {
  game: Game;
  onPress: () => void;
  onOddsPress: (team: 'home' | 'away') => void;
}

export default function GameCard({ game, onPress, onOddsPress }: GameCardProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const hours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    const minutes = Math.floor(((date.getTime() - now.getTime()) % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatOdds = (odds: number) => {
    if (odds > 0) {
      return `+${odds}`;
    }
    return odds.toString();
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.sportInfo}>
          <Text style={styles.sport}>{game.sport}</Text>
          {game.isLive && <View style={styles.liveDot} />}
        </View>
        <Text style={styles.time}>
          {game.isLive ? 'LIVE' : formatTime(game.startTime)}
        </Text>
      </View>

      <View style={styles.teams}>
        <Text style={styles.awayTeam}>{game.awayTeam}</Text>
        <Text style={styles.vs}>@</Text>
        <Text style={styles.homeTeam}>{game.homeTeam}</Text>
      </View>

      <View style={styles.moneylineSection}>
        <Text style={styles.marketLabel}>MONEYLINE</Text>
        <View style={styles.oddsContainer}>
          <TouchableOpacity
            style={styles.oddsButton}
            onPress={() => onOddsPress('away')}
          >
            <Text style={styles.oddsText}>{formatOdds(game.moneyline.away)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.oddsButton}
            onPress={() => onOddsPress('home')}
          >
            <Text style={styles.oddsText}>{formatOdds(game.moneyline.home)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.viewMarkets}>
        <Text style={styles.viewMarketsText}>View All Markets →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sport: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.danger,
    marginLeft: 8,
    position: 'absolute',
    right: -12,
    top: 6,
  },
  time: {
    fontSize: 14,
    color: Colors.dark.icon,
  },
  teams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  awayTeam: {
    fontSize: 16,
    color: Colors.dark.text,
    flex: 1,
    textAlign: 'right',
  },
  vs: {
    fontSize: 16,
    color: Colors.dark.icon,
    marginHorizontal: 8,
  },
  homeTeam: {
    fontSize: 16,
    color: Colors.dark.text,
    flex: 1,
    textAlign: 'left',
  },
  moneylineSection: {
    marginBottom: 12,
  },
  marketLabel: {
    fontSize: 12,
    color: Colors.dark.icon,
    marginBottom: 8,
    fontWeight: '500',
  },
  oddsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  oddsButton: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  oddsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  viewMarkets: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.background,
  },
  viewMarketsText: {
    fontSize: 14,
    color: Colors.dark.tint,
    fontWeight: '500',
  },
});