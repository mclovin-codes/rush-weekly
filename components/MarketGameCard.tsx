import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { MarketGame } from '@/types';
import { CaretRight } from 'phosphor-react-native';

interface MarketGameCardProps {
  game: MarketGame;
  onSelectBet: (game: MarketGame, team: 'home' | 'away') => void;
  onPress?: (eventID: string) => void;
}

export default function MarketGameCard({ game, onSelectBet, onPress }: MarketGameCardProps) {
  // Format date and time with full context
  const gameDate = new Date(game.start_time);
  const now = new Date();

  // Calculate hours until game
  const hoursUntilGame = (gameDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const daysUntilGame = Math.floor(hoursUntilGame / 24);

  // Determine time label and color
  let timeLabel = '';
  let timeColor = Colors.dark.textSecondary;
  let showBadge = false;
  let badgeText = '';
  let badgeColor = Colors.dark.textSecondary;

  if (hoursUntilGame < 0) {
    // Game has started or finished
    timeLabel = gameDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    timeColor = Colors.dark.textSecondary;
  } else if (hoursUntilGame < 2) {
    // Starting very soon (less than 2 hours)
    showBadge = true;
    badgeText = 'STARTING SOON';
    badgeColor = Colors.dark.danger;
    timeLabel = gameDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    timeColor = Colors.dark.danger;
  } else if (daysUntilGame === 0) {
    // Today
    showBadge = true;
    badgeText = 'TODAY';
    badgeColor = Colors.dark.success;
    timeLabel = gameDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    timeColor = Colors.dark.success;
  } else if (daysUntilGame === 1) {
    // Tomorrow
    showBadge = true;
    badgeText = 'TOMORROW';
    badgeColor = Colors.dark.tint;
    timeLabel = gameDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    timeColor = Colors.dark.tint;
  } else if (daysUntilGame <= 7) {
    // This week
    timeLabel = gameDate.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    timeColor = Colors.dark.text;
  } else {
    // More than a week away
    timeLabel = gameDate.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    timeColor = Colors.dark.textSecondary;
  }

  const formatOdds = (oddsValue: number | null | undefined) => {
    if (!oddsValue) return '--';
    return oddsValue > 0 ? `+${oddsValue}` : `${oddsValue}`;
  };

  const spread = game.markets.spread;
  const total = game.markets.total;

  return (
    <TouchableOpacity
      style={styles.gameCard}
      onPress={() => onPress?.(game.eventID)}
      activeOpacity={0.9}
    >
      {/* Compact Header with Matchup */}
      <View style={styles.compactHeader}>
        <View style={styles.matchupInfo}>
          <Text style={styles.teamAbbr}>{game.away_team.abbreviation}</Text>
          <Text style={styles.vsText}>@</Text>
          <Text style={styles.teamAbbr}>{game.home_team.abbreviation}</Text>
        </View>
        <View style={styles.gameTimeInfo}>
          {showBadge && (
            <View style={[styles.timeBadge, { backgroundColor: badgeColor + '20', borderColor: badgeColor }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeText}</Text>
            </View>
          )}
          <Text style={[styles.gameTime, { color: timeColor }]}>{timeLabel}</Text>
        </View>
      </View>

      {/* Grid Layout for Bets */}
      <View style={styles.betsGrid}>
        {/* First Row: Spread and Total */}
        <View style={styles.betRow}>
          <TouchableOpacity style={styles.betCell}>
            <Text style={styles.betCellLabel}>SPREAD</Text>
            {spread ? (
              <>
                <Text style={styles.betCellValue}>
                  {spread.point > 0 ? `+${spread.point}` : spread.point}
                </Text>
                <Text style={styles.betCellSubtext}>
                  {spread.target_team} {formatOdds(spread.payout)}
                </Text>
              </>
            ) : (
              <Text style={styles.betCellValue}>--</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.betCell}>
            <Text style={styles.betCellLabel}>TOTAL</Text>
            {total ? (
              <>
                <Text style={styles.betCellValue}>O/U {total.line}</Text>
                <Text style={styles.betCellSubtext}>
                  {formatOdds(total.over_payout)}
                </Text>
              </>
            ) : (
              <Text style={styles.betCellValue}>--</Text>
            )}
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
              {game.away_team.name}
            </Text>
            <Text style={styles.oddsText}>
              {formatOdds(game.away_team.moneyline)}
            </Text>
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
              {game.home_team.name}
            </Text>
            <Text style={styles.oddsText}>
              {formatOdds(game.home_team.moneyline)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* View Details Indicator */}
      <View style={styles.viewDetailsContainer}>
        <View style={styles.viewDetailsDivider} />
        <View style={styles.viewDetailsChip}>
          <Text style={styles.viewDetailsText}>Tap for full game details</Text>
          <CaretRight size={14} color={Colors.dark.tint} weight="bold" />
        </View>
      </View>
    </TouchableOpacity>
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
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 4,
  },
  badgeText: {
    ...Typography.meta.small,
    fontFamily: Fonts.medium,
    fontSize: 8,
    letterSpacing: 0.5,
  },
  gameTime: {
    ...Typography.meta.small,
    fontSize: 10,
    fontFamily: Fonts.medium,
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
  betCellSubtext: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 10,
    marginTop: 2,
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
  viewDetailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    alignItems: 'center',
  },
  viewDetailsDivider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.dark.border,
    marginBottom: 8,
  },
  viewDetailsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.dark.tint + '15',
    borderWidth: 1,
    borderColor: Colors.dark.tint + '40',
  },
  viewDetailsText: {
    ...Typography.meta.small,
    color: Colors.dark.tint,
    fontFamily: Fonts.medium,
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
