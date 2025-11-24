import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';

import { Game } from '@/constants/mock-data';
import { Colors, Fonts, Typography, BorderRadius, Shadows } from '@/constants/theme';

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

  const isPositiveOdds = (odds: number) => odds > 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        game.isLive && styles.cardLive
      ]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Timer badge top-right */}
      {game.isLive ? (
        <View style={styles.timerBadge}>
          <Text style={[styles.timerText, styles.timerTextLive]}>LIVE</Text>
        </View>
      ) : (
        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>{formatTime(game.startTime)}</Text>
        </View>
      )}

      {/* Sport label (small uppercase) */}
      <View style={styles.sportLabelContainer}>
        <Text style={styles.sportLabelText}>{game.sport}</Text>
      </View>

      {/* Team names centered or symmetrical */}
      <View style={styles.teams}>
        <View style={styles.teamColumn}>
          <Text style={styles.awayTeam}>{game.awayTeam}</Text>
        </View>
        <View style={styles.vsColumn}>
          <Text style={styles.vs}>vs</Text>
        </View>
        <View style={styles.teamColumn}>
          <Text style={styles.homeTeam}>{game.homeTeam}</Text>
        </View>
      </View>

      {/* Odds buttons as clear selectable pills */}
      <View style={styles.oddsSection}>
        <View style={styles.marketLabelContainer}>
          <Text style={styles.marketLabel}>MONEYLINE</Text>
        </View>
        <View style={styles.oddsContainer}>
          <TouchableOpacity
            style={[
              styles.oddsButton,
              isPositiveOdds(game.moneyline.away) && styles.oddsButtonPositive,
              !isPositiveOdds(game.moneyline.away) && styles.oddsButtonNegative
            ]}
            onPress={() => onOddsPress('away')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.oddsText,
              !isPositiveOdds(game.moneyline.away) && styles.oddsTextNeutral
            ]}>
              {formatOdds(game.moneyline.away)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.oddsButton,
              isPositiveOdds(game.moneyline.home) && styles.oddsButtonPositive,
              !isPositiveOdds(game.moneyline.home) && styles.oddsButtonNegative
            ]}
            onPress={() => onOddsPress('home')}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.oddsText,
              !isPositiveOdds(game.moneyline.home) && styles.oddsTextNeutral
            ]}>
              {formatOdds(game.moneyline.home)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Small CTA with arrow */}
      <TouchableOpacity
        style={styles.viewMarketsButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.viewMarketsText}>View Markets</Text>
        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.cardElevated,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BorderRadius['2xl'],
    ...Shadows.card,
    position: 'relative',
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.tint,
  },
  cardLive: {
    borderLeftColor: Colors.dark.danger,
  },
  timerBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  timerText: {
    fontSize: 10,
    fontFamily: Fonts.condensed,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  timerTextLive: {
    color: Colors.dark.danger,
  },
  sportLabelContainer: {
    backgroundColor: Colors.dark.background,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
    marginLeft: 8,
    marginTop: -4,
  },
  sportLabelText: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.textSecondary,
  },
  teams: {
    alignItems: 'center',
    marginBottom: 20,
  },
  teamColumn: {
    flex: 1,
    alignItems: 'center',
  },
  awayTeam: {
    ...Typography.teamName.medium,
    color: Colors.dark.text,
    textAlign: 'right',
  },
  vsColumn: {
    width: 24,
    alignItems: 'center',
  },
  vs: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  homeTeam: {
    ...Typography.teamName.medium,
    color: Colors.dark.text,
    textAlign: 'left',
  },
  oddsSection: {
    marginBottom: 16,
  },
  marketLabelContainer: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  marketLabel: {
    ...Typography.meta.medium,
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  oddsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  oddsButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: 44,
  },
  oddsButtonPositive: {
    backgroundColor: Colors.dark.tint,
    borderColor: Colors.dark.tint,
    ...Shadows.pillGlow,
  },
  oddsButtonNegative: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: Colors.dark.border,
  },
  oddsText: {
    ...Typography.oddsPill.medium,
    color: Colors.dark.background,
  },
  oddsTextNeutral: {
    color: Colors.dark.text,
  },
  viewMarketsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  viewMarketsText: {
    ...Typography.emphasis.small,
    color: Colors.dark.tint,
  },
  arrow: {
    ...Typography.emphasis.small,
    color: Colors.dark.tint,
    fontSize: 16,
  },
});