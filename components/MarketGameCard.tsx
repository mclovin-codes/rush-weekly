import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { MarketGame } from '@/types';
import { Clock } from 'phosphor-react-native';

interface MarketGameCardProps {
  game: MarketGame;
  onSelectBet: (game: MarketGame, betType: 'spread' | 'total' | 'moneyline', team: 'home' | 'away', selection?: 'over' | 'under') => void;
  onPress?: (eventID: string) => void;
  shouldNavigate?: boolean;
}

export default function MarketGameCard({ game, onSelectBet, onPress, shouldNavigate = true }: MarketGameCardProps) {
  // Format date
  const gameDate = new Date(game.start_time);
  const dateLabel = gameDate.toLocaleString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  // Smart time formatting
  const getStartTimeInfo = () => {
    const now = new Date();
    const startDate = new Date(game.start_time);

    // Reset hours for date comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const gameDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

    const timeString = startDate.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (gameDay.getTime() === today.getTime()) {
      return { label: 'Today', time: timeString, isToday: true };
    } else if (gameDay.getTime() === tomorrow.getTime()) {
      return { label: 'Tomorrow', time: timeString, isTomorrow: true };
    } else {
      const dayLabel = startDate.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      return { label: dayLabel, time: timeString, isLater: true };
    }
  };

  const startTimeInfo = getStartTimeInfo();

  const formatOdds = (oddsValue: number | null | undefined) => {
    if (!oddsValue) return '--';
    return oddsValue > 0 ? `+${oddsValue}` : `${oddsValue}`;
  };

  const formatPoint = (point: number | null | undefined) => {
    if (!point) return '--';
    return point > 0 ? `+${point}` : `${point}`;
  };

  const getOddsColor = (odds: number | null | undefined) => {
    if (!odds) return Colors.dark.textSecondary;
    return '#007BFF'; // Always blue for odds
  };

  const spread = game.markets?.spread;
  const total = game.markets?.total;

  return (
    <View style={styles.gameCard}>
      {/* Header with Matchup */}
      <View style={styles.header}>
        <View style={styles.matchupContainer}>
          <Text style={styles.awayTeam}>{game.away_team.abbreviation}</Text>
          <Text style={styles.atSymbol}>@</Text>
          <Text style={styles.homeTeam}>{game.home_team.abbreviation}</Text>
        </View>
      </View>

      {/* Start Time Badge */}
      <View style={[
        styles.startTimeBadge,
        startTimeInfo.isToday && styles.startTimeBadgeToday,
        startTimeInfo.isTomorrow && styles.startTimeBadgeTomorrow,
      ]}>
        <Clock
          size={14}
          color={startTimeInfo.isToday ? Colors.dark.success : startTimeInfo.isTomorrow ? Colors.dark.tint : Colors.dark.textSecondary}
          weight="bold"
        />
        <Text style={[
          styles.startTimeLabel,
          startTimeInfo.isToday && styles.startTimeLabelToday,
          startTimeInfo.isTomorrow && styles.startTimeLabelTomorrow,
        ]}>
          {startTimeInfo.label}
        </Text>
        <Text style={styles.startTimeDot}>•</Text>
        <Text style={[
          styles.startTimeText,
          startTimeInfo.isToday && styles.startTimeTextToday,
          startTimeInfo.isTomorrow && styles.startTimeTextTomorrow,
        ]}>
          {startTimeInfo.time}
        </Text>
      </View>

      {/* Betting Options Grid */}
      <View style={styles.bettingGrid}>
        {/* Column Headers */}
        <View style={styles.betTypeRow}>
          <View style={styles.teamLabelColumn}>
            <Text style={styles.teamLabelText}>TEAM</Text>
          </View>
          <View style={styles.betColumn}>
            <Text style={styles.betTypeLabel}>SPREAD</Text>
          </View>
          <View style={styles.betColumn}>
            <Text style={styles.betTypeLabel}>TOTAL</Text>
          </View>
          <View style={styles.betColumn}>
            <Text style={styles.betTypeLabel}>ML</Text>
          </View>
        </View>

        {/* Away Team Bets */}
        <View style={styles.teamBetsRow}>
          <View style={styles.teamLabelColumn}>
            <View style={styles.teamBadge}>
              <Text style={styles.teamBadgeText}>{game.away_team.abbreviation}</Text>
            </View>
          </View>

          {/* Spread */}
          <TouchableOpacity
            style={styles.betColumn}
            onPress={() => spread?.away && onSelectBet(game, 'spread', 'away')}
            activeOpacity={0.7}
          >
            <View style={styles.betCell}>
              {spread?.away ? (
                <>
                  <Text style={styles.betValue}>
                    {formatPoint(spread.away.point)}
                  </Text>
                  <Text style={[styles.betOdds, { color: getOddsColor(spread.away.payout) }]}>
                    {formatOdds(spread.away.payout)}
                  </Text>
                </>
              ) : (
                <Text style={styles.unavailableText}>--</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Total - Over */}
          <TouchableOpacity
            style={styles.betColumn}
            onPress={() => total && onSelectBet(game, 'total', 'away', 'over')}
            activeOpacity={0.7}
          >
            <View style={styles.betCell}>
              {total ? (
                <>
                  <Text style={styles.betValue}>
                    O{total.line ? formatPoint(total.line) : '--'}
                  </Text>
                  <Text style={[styles.betOdds, { color: getOddsColor(total.over_payout) }]}>
                    {formatOdds(total.over_payout)}
                  </Text>
                </>
              ) : (
                <Text style={styles.unavailableText}>--</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Moneyline */}
          <TouchableOpacity
            style={styles.betColumn}
            onPress={() => onSelectBet(game, 'moneyline', 'away')}
            activeOpacity={0.7}
          >
            <View style={styles.betCell}>
              <Text style={[styles.moneylineValue, { color: getOddsColor(game.away_team.moneyline) }]}>
                {formatOdds(game.away_team.moneyline)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Home Team Bets */}
        <View style={[styles.teamBetsRow, styles.lastRow]}>
          <View style={styles.teamLabelColumn}>
            <View style={[styles.teamBadge, styles.homeBadge]}>
              <Text style={styles.teamBadgeText}>{game.home_team.abbreviation}</Text>
            </View>
          </View>

          {/* Spread */}
          <TouchableOpacity
            style={styles.betColumn}
            onPress={() => spread?.home && onSelectBet(game, 'spread', 'home')}
            activeOpacity={0.7}
          >
            <View style={styles.betCell}>
              {spread?.home ? (
                <>
                  <Text style={styles.betValue}>
                    {formatPoint(spread.home.point)}
                  </Text>
                  <Text style={[styles.betOdds, { color: getOddsColor(spread.home.payout) }]}>
                    {formatOdds(spread.home.payout)}
                  </Text>
                </>
              ) : (
                <Text style={styles.unavailableText}>--</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Total - Under */}
          <TouchableOpacity
            style={styles.betColumn}
            onPress={() => total && onSelectBet(game, 'total', 'home', 'under')}
            activeOpacity={0.7}
          >
            <View style={styles.betCell}>
              {total ? (
                <>
                  <Text style={styles.betValue}>
                    U{total.line ? formatPoint(total.line) : '--'}
                  </Text>
                  <Text style={[styles.betOdds, { color: getOddsColor(total.under_payout) }]}>
                    {formatOdds(total.under_payout)}
                  </Text>
                </>
              ) : (
                <Text style={styles.unavailableText}>--</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Moneyline */}
          <TouchableOpacity
            style={styles.betColumn}
            onPress={() => onSelectBet(game, 'moneyline', 'home')}
            activeOpacity={0.7}
          >
            <View style={styles.betCell}>
              <Text style={[styles.moneylineValue, { color: getOddsColor(game.home_team.moneyline) }]}>
                {formatOdds(game.home_team.moneyline)}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tap for Details Hint */}
      {
        shouldNavigate && (<TouchableOpacity
          style={styles.detailsHint}
          onPress={() => onPress?.(game.eventID)}
          activeOpacity={0.7}
        >
          <Text style={styles.detailsHintText}>Tap for game details</Text>
        </TouchableOpacity>)
      }
    </View>
  );
}

const styles = StyleSheet.create({
  gameCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  dateContainer: {
    flex: 1,
  },
  dateText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  matchupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  awayTeam: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  atSymbol: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 11,
  },
  homeTeam: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  startTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.cardElevated,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignSelf: 'flex-start',
  },
  startTimeBadgeToday: {
    backgroundColor: Colors.dark.success + '15',
    borderColor: Colors.dark.success + '40',
  },
  startTimeBadgeTomorrow: {
    backgroundColor: Colors.dark.tint + '15',
    borderColor: Colors.dark.tint + '40',
  },
  startTimeLabel: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  startTimeLabelToday: {
    color: Colors.dark.success,
  },
  startTimeLabelTomorrow: {
    color: Colors.dark.tint,
  },
  startTimeDot: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 10,
  },
  startTimeText: {
    ...Typography.body.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  startTimeTextToday: {
    color: Colors.dark.success,
    fontFamily: Fonts.medium,
  },
  startTimeTextTomorrow: {
    color: Colors.dark.tint,
    fontFamily: Fonts.medium,
  },
  bettingGrid: {
    gap: 8,
  },
  betTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  teamBetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  lastRow: {
    marginBottom: 0,
  },
  teamLabelColumn: {
    width: 45,
    alignItems: 'center',
  },
  teamLabelText: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 9,
    fontFamily: Fonts.medium,
    letterSpacing: 0.5,
  },
  teamBadge: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minWidth: 40,
    alignItems: 'center',
  },
  homeBadge: {
    borderColor: Colors.dark.tint + '30',
  },
  teamBadgeText: {
    ...Typography.body.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  betColumn: {
    flex: 1,
    alignItems: 'center',
  },
  betTypeLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 9,
    fontFamily: Fonts.medium,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  betCell: {
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 6,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  betValue: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
    fontSize: 14,
    marginBottom: 3,
  },
  betOdds: {
    ...Typography.body.small,
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
  moneylineValue: {
    ...Typography.body.medium,
    fontFamily: Fonts.display,
    fontSize: 15,
  },
  unavailableText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  detailsHint: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    alignItems: 'center',
  },
  detailsHintText: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 10,
    fontFamily: Fonts.medium,
  },
});
