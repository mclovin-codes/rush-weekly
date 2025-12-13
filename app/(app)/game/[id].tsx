import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { CaretLeft, TrendUp } from 'phosphor-react-native';
import { API_BASE_URL } from '@/constants/api';

const { width } = Dimensions.get('window');

interface TeamData {
  name_long: string;
  name_short: string;
  score: number;
  batting_hits?: number;
  fielding_errors?: number;
  moneyline_odds: string;
}

interface InningResult {
  away_points: number;
  home_points: number;
}

interface BettingMarket {
  home_odds?: string;
  away_odds?: string;
  over_under_line?: string;
  over_odds?: string;
  under_odds?: string;
  actual_score_total?: number;
  spread_line?: number;
}

interface GameDetails {
  event_summary: {
    eventID: string;
    sportID: string;
    leagueID: string;
    status: string;
    startTime_UTC: string;
  };
  teams_data: {
    home_team: TeamData;
    away_team: TeamData;
  };
  inning_results: { [key: string]: InningResult };
  betting_markets: {
    moneyline: BettingMarket;
    total_points_over_under: BettingMarket;
    point_spread: BettingMarket;
  };
}

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [gameData, setGameData] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/events/show-more/${id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch game details');
        }

        const data = await response.json();
        setGameData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGameDetails();
    }
  }, [id]);

  const formatOdds = (odds: string | undefined) => {
    if (!odds) return '--';
    const numOdds = parseFloat(odds);
    return numOdds > 0 ? `+${numOdds}` : `${numOdds}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <CaretLeft size={24} color={Colors.dark.text} weight="bold" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Details</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.tint} />
          <Text style={styles.loadingText}>Loading game details...</Text>
        </View>
      </View>
    );
  }

  if (error || !gameData) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <CaretLeft size={24} color={Colors.dark.text} weight="bold" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Details</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load game details'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { event_summary, teams_data, inning_results, betting_markets } = gameData;
  const winner = teams_data.away_team.score > teams_data.home_team.score ? 'away' : 'home';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <CaretLeft size={24} color={Colors.dark.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Details</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            event_summary.status === 'Final' ? styles.statusFinal : styles.statusLive
          ]}>
            <Text style={styles.statusText}>{event_summary.status}</Text>
          </View>
          <Text style={styles.leagueText}>{event_summary.leagueID} • {event_summary.sportID}</Text>
        </View>

        {/* Game Time */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>{formatDate(event_summary.startTime_UTC)}</Text>
        </View>

        {/* Score Display */}
        <View style={styles.scoreCard}>
          {/* Away Team */}
          <View style={[styles.teamRow, winner === 'away' && styles.winnerRow]}>
            <View style={styles.teamInfo}>
              <Text style={[styles.teamName, winner === 'away' && styles.winnerText]}>
                {teams_data.away_team.name_long}
              </Text>
              <Text style={styles.teamAbbr}>{teams_data.away_team.name_short}</Text>
            </View>
            <View style={[styles.scoreContainer, winner === 'away' && styles.winnerScore]}>
              <Text style={[styles.scoreText, winner === 'away' && styles.winnerScoreText]}>
                {teams_data.away_team.score}
              </Text>
              {winner === 'away' && (
                <TrendUp size={20} color={Colors.dark.success} weight="bold" />
              )}
            </View>
          </View>

          {/* Divider */}
          <View style={styles.scoreDivider} />

          {/* Home Team */}
          <View style={[styles.teamRow, winner === 'home' && styles.winnerRow]}>
            <View style={styles.teamInfo}>
              <Text style={[styles.teamName, winner === 'home' && styles.winnerText]}>
                {teams_data.home_team.name_long}
              </Text>
              <Text style={styles.teamAbbr}>{teams_data.home_team.name_short}</Text>
            </View>
            <View style={[styles.scoreContainer, winner === 'home' && styles.winnerScore]}>
              <Text style={[styles.scoreText, winner === 'home' && styles.winnerScoreText]}>
                {teams_data.home_team.score}
              </Text>
              {winner === 'home' && (
                <TrendUp size={20} color={Colors.dark.success} weight="bold" />
              )}
            </View>
          </View>
        </View>

        {/* Team Stats */}
        {(teams_data.away_team.batting_hits !== undefined || teams_data.away_team.fielding_errors !== undefined) && (
          <View style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Team Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statColumn}>
                <Text style={styles.statLabel}>TEAM</Text>
                <Text style={styles.statValue}>{teams_data.away_team.name_short}</Text>
                <Text style={styles.statValue}>{teams_data.home_team.name_short}</Text>
              </View>
              {teams_data.away_team.batting_hits !== undefined && (
                <View style={styles.statColumn}>
                  <Text style={styles.statLabel}>HITS</Text>
                  <Text style={styles.statValue}>{teams_data.away_team.batting_hits}</Text>
                  <Text style={styles.statValue}>{teams_data.home_team.batting_hits}</Text>
                </View>
              )}
              {teams_data.away_team.fielding_errors !== undefined && (
                <View style={styles.statColumn}>
                  <Text style={styles.statLabel}>ERRORS</Text>
                  <Text style={styles.statValue}>{teams_data.away_team.fielding_errors}</Text>
                  <Text style={styles.statValue}>{teams_data.home_team.fielding_errors}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Inning by Inning / Quarter by Quarter */}
        {Object.keys(inning_results).length > 0 && (
          <View style={styles.inningsCard}>
            <Text style={styles.sectionTitle}>Score Breakdown</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.inningsTable}>
                {/* Header Row */}
                <View style={styles.inningsHeaderRow}>
                  <View style={styles.inningsTeamCell}>
                    <Text style={styles.inningsHeaderText}>TEAM</Text>
                  </View>
                  {Object.keys(inning_results).map((inning) => (
                    <View key={inning} style={styles.inningsCell}>
                      <Text style={styles.inningsHeaderText}>
                        {inning.replace('i', '').replace('q', '')}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.inningsTotalCell}>
                    <Text style={styles.inningsHeaderText}>T</Text>
                  </View>
                </View>

                {/* Away Team Row */}
                <View style={styles.inningsDataRow}>
                  <View style={styles.inningsTeamCell}>
                    <Text style={styles.inningsTeamText}>{teams_data.away_team.name_short}</Text>
                  </View>
                  {Object.values(inning_results).map((result, idx) => (
                    <View key={idx} style={styles.inningsCell}>
                      <Text style={styles.inningsValue}>{result.away_points}</Text>
                    </View>
                  ))}
                  <View style={styles.inningsTotalCell}>
                    <Text style={styles.inningsTotalValue}>{teams_data.away_team.score}</Text>
                  </View>
                </View>

                {/* Home Team Row */}
                <View style={styles.inningsDataRow}>
                  <View style={styles.inningsTeamCell}>
                    <Text style={styles.inningsTeamText}>{teams_data.home_team.name_short}</Text>
                  </View>
                  {Object.values(inning_results).map((result, idx) => (
                    <View key={idx} style={styles.inningsCell}>
                      <Text style={styles.inningsValue}>{result.home_points}</Text>
                    </View>
                  ))}
                  <View style={styles.inningsTotalCell}>
                    <Text style={styles.inningsTotalValue}>{teams_data.home_team.score}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        )}

        {/* Betting Markets */}
        <View style={styles.bettingCard}>
          <Text style={styles.sectionTitle}>Betting Markets</Text>

          {/* Moneyline */}
          <View style={styles.marketSection}>
            <Text style={styles.marketTitle}>MONEYLINE</Text>
            <View style={styles.marketRow}>
              <View style={styles.marketTeam}>
                <Text style={styles.marketTeamName}>{teams_data.away_team.name_short}</Text>
                <View style={styles.oddsChip}>
                  <Text style={styles.oddsChipText}>{formatOdds(betting_markets.moneyline.away_odds)}</Text>
                </View>
              </View>
              <View style={styles.marketTeam}>
                <Text style={styles.marketTeamName}>{teams_data.home_team.name_short}</Text>
                <View style={styles.oddsChip}>
                  <Text style={styles.oddsChipText}>{formatOdds(betting_markets.moneyline.home_odds)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Total Points */}
          {betting_markets.total_points_over_under && (
            <View style={styles.marketSection}>
              <Text style={styles.marketTitle}>TOTAL POINTS (O/U)</Text>
              <View style={styles.marketRow}>
                <View style={styles.marketTeam}>
                  <Text style={styles.marketTeamName}>
                    OVER {betting_markets.total_points_over_under.over_under_line}
                  </Text>
                  <View style={styles.oddsChip}>
                    <Text style={styles.oddsChipText}>
                      {formatOdds(betting_markets.total_points_over_under.over_odds)}
                    </Text>
                  </View>
                </View>
                <View style={styles.marketTeam}>
                  <Text style={styles.marketTeamName}>
                    UNDER {betting_markets.total_points_over_under.over_under_line}
                  </Text>
                  <View style={styles.oddsChip}>
                    <Text style={styles.oddsChipText}>
                      {formatOdds(betting_markets.total_points_over_under.under_odds)}
                    </Text>
                  </View>
                </View>
              </View>
              {betting_markets.total_points_over_under.actual_score_total && (
                <View style={styles.actualScoreContainer}>
                  <Text style={styles.actualScoreLabel}>Final Total:</Text>
                  <Text style={styles.actualScoreValue}>
                    {betting_markets.total_points_over_under.actual_score_total}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Point Spread */}
          {betting_markets.point_spread && (
            <View style={styles.marketSection}>
              <Text style={styles.marketTitle}>POINT SPREAD</Text>
              <View style={styles.marketRow}>
                <View style={styles.marketTeam}>
                  <Text style={styles.marketTeamName}>
                    {teams_data.away_team.name_short}{' '}
                    {betting_markets.point_spread.spread_line !== undefined &&
                      (betting_markets.point_spread.spread_line > 0
                        ? `+${betting_markets.point_spread.spread_line}`
                        : betting_markets.point_spread.spread_line)}
                  </Text>
                  <View style={styles.oddsChip}>
                    <Text style={styles.oddsChipText}>
                      {formatOdds(betting_markets.point_spread.away_odds)}
                    </Text>
                  </View>
                </View>
                <View style={styles.marketTeam}>
                  <Text style={styles.marketTeamName}>
                    {teams_data.home_team.name_short}{' '}
                    {betting_markets.point_spread.spread_line !== undefined &&
                      (betting_markets.point_spread.spread_line > 0
                        ? `-${betting_markets.point_spread.spread_line}`
                        : `+${Math.abs(betting_markets.point_spread.spread_line)}`)}
                  </Text>
                  <View style={styles.oddsChip}>
                    <Text style={styles.oddsChipText}>
                      {formatOdds(betting_markets.point_spread.home_odds)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.title.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    ...Typography.body.medium,
    color: Colors.dark.danger,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.display,
  },
  scrollContainer: {
    flex: 1,
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusFinal: {
    backgroundColor: Colors.dark.textSecondary + '20',
  },
  statusLive: {
    backgroundColor: Colors.dark.danger + '20',
  },
  statusText: {
    ...Typography.emphasis.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  leagueText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  dateContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  dateText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  scoreCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  winnerRow: {
    backgroundColor: Colors.dark.success + '10',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    ...Typography.title.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 4,
  },
  winnerText: {
    color: Colors.dark.success,
  },
  teamAbbr: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  winnerScore: {
    backgroundColor: Colors.dark.success + '20',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scoreText: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
  },
  winnerScoreText: {
    color: Colors.dark.success,
  },
  scoreDivider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 4,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sectionTitle: {
    ...Typography.sectionHeader.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statColumn: {
    alignItems: 'center',
  },
  statLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
    marginVertical: 4,
  },
  inningsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  inningsTable: {
    minWidth: width - 32,
  },
  inningsHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: Colors.dark.tint,
    paddingBottom: 8,
    marginBottom: 8,
  },
  inningsDataRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  inningsTeamCell: {
    width: 60,
    justifyContent: 'center',
  },
  inningsCell: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inningsTotalCell: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.tint + '20',
    borderRadius: 4,
  },
  inningsHeaderText: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.display,
    textTransform: 'uppercase',
  },
  inningsTeamText: {
    ...Typography.body.small,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
  },
  inningsValue: {
    ...Typography.body.small,
    color: Colors.dark.text,
  },
  inningsTotalValue: {
    ...Typography.emphasis.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
  },
  bettingCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  marketSection: {
    marginBottom: 20,
  },
  marketTitle: {
    ...Typography.meta.medium,
    color: Colors.dark.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  marketRow: {
    flexDirection: 'row',
    gap: 12,
  },
  marketTeam: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  marketTeamName: {
    ...Typography.body.small,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  oddsChip: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  oddsChipText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.display,
  },
  actualScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  actualScoreLabel: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    marginRight: 8,
  },
  actualScoreValue: {
    ...Typography.emphasis.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
  },
  bottomSpacing: {
    height: 40,
  },
});
