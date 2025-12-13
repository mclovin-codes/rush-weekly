import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { useGameOdds } from '@/hooks/useGameOdds';
import { PopulatedGame } from '@/types';

interface GameCardProps {
  game: PopulatedGame;
  onSelectBet: (game: PopulatedGame, team: 'home' | 'away') => void;
}

export default function GameCard({ game, onSelectBet }: GameCardProps) {
  const { data: odds } = useGameOdds(game.id);

  const homeTeam = typeof game.homeTeam === 'object' ? game.homeTeam : null;
  const awayTeam = typeof game.awayTeam === 'object' ? game.awayTeam : null;

  const gameTime = new Date(game.startTime).toLocaleString('en-US', {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const formatOdds = (oddsValue: number | undefined) => {
    if (!oddsValue) return '--';
    return oddsValue > 0 ? `+${oddsValue}` : `${oddsValue}`;
  };

  const homeOdds = odds?.moneyline?.home;
  const awayOdds = odds?.moneyline?.away;

  return (
    <View style={styles.gameCard}>
      {/* Compact Header with Matchup */}
      <View style={styles.compactHeader}>
        <View style={styles.matchupInfo}>
          <Text style={styles.teamAbbr}>{awayTeam?.abbreviation || 'TBD'}</Text>
          <Text style={styles.vsText}>@</Text>
          <Text style={styles.teamAbbr}>{homeTeam?.abbreviation || 'TBD'}</Text>
        </View>
        <View style={styles.gameTimeInfo}>
          <Text style={styles.gameTime}>{gameTime}</Text>
        </View>
      </View>

      {/* Grid Layout for Bets */}
      <View style={styles.betsGrid}>
        {/* First Row: Spread and Total */}
        <View style={styles.betRow}>
          <TouchableOpacity style={styles.betCell}>
            <Text style={styles.betCellLabel}>SPREAD</Text>
            <Text style={styles.betCellValue}>Coming Soon</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.betCell}>
            <Text style={styles.betCellLabel}>TOTAL</Text>
            <Text style={styles.betCellValue}>Coming Soon</Text>
          </TouchableOpacity>
        </View>

        {/* Second Row: Moneyline with Visual Cues */}
        <View style={styles.betRow}>
          <TouchableOpacity
            style={[styles.betCell, styles.underdogCell]}
            onPress={() => onSelectBet(game, 'away')}
            activeOpacity={0.8}
          >
            <View style={styles.betCellHeader}>
              <Text style={[styles.betCellLabel, styles.underdogLabel]}>AWAY</Text>
            </View>
            <Text style={[styles.betCellValue, styles.underdogValue]}>
              {awayTeam?.name || 'TBD'}
            </Text>
            {awayOdds && (
              <Text style={styles.oddsText}>{formatOdds(awayOdds)}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.betCell, styles.underdogCell]}
            onPress={() => onSelectBet(game, 'home')}
            activeOpacity={0.8}
          >
            <View style={styles.betCellHeader}>
              <Text style={[styles.betCellLabel, styles.underdogLabel]}>HOME</Text>
            </View>
            <Text style={[styles.betCellValue, styles.underdogValue]}>
              {homeTeam?.name || 'TBD'}
            </Text>
            {homeOdds && (
              <Text style={styles.oddsText}>{formatOdds(homeOdds)}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gameCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  matchupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamAbbr: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 15,
  },
  vsText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  gameTimeInfo: {
    alignItems: 'flex-end',
  },
  gameTime: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 10,
  },
  betsGrid: {
    gap: 6,
  },
  betRow: {
    flexDirection: 'row',
    gap: 6,
  },
  betCell: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
  },
  betCellHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  betCellLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  betCellValue: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  underdogCell: {
    backgroundColor: Colors.dark.cardElevated,
    borderColor: Colors.dark.border,
  },
  underdogLabel: {
    color: Colors.dark.textSecondary,
  },
  underdogValue: {
    color: Colors.dark.text,
  },
  oddsText: {
    ...Typography.body.small,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 14,
    marginTop: 4,
  },
});
