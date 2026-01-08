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
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { ArrowLeft, Clock } from 'phosphor-react-native';
import { API_BASE_URL } from '@/constants/api';
import BetSlipBottomSheet from '@/app/modal';
import { useCurrentUser } from '@/hooks/useUser';
import { useMyPool } from '@/hooks/usePools';
import { authClient } from '@/lib/auth-client';
import { useBetSlip, BetSelection } from '@/providers/BetSlipProvider';
import BetSlipFloatingButton from '@/components/BetSlipFloatingButton';
import NFLScoringCard from '@/components/NFLScoringCard';

const { width } = Dimensions.get('window');

// API Response Types
interface MarketSpread {
  home: { point: number; payout: number; target_team: string };
  away: { point: number; payout: number; target_team: string };
}

interface MarketTotal {
  line: number;
  over_payout: number;
  under_payout: number;
}

interface Markets {
  spread: MarketSpread;
  total: MarketTotal;
}

interface Team {
  name: string;
  abbreviation: string;
  moneyline: number;
}

interface Prop {
  stat_type: string;
  display_name: string;
  category: string;
  line?: number | null;
  over_payout?: number | null;
  under_payout?: number | null;
  yes_payout?: number | null;
  no_payout?: number | null;
}

interface PlayerProp {
  player_id: string;
  player_name: string;
  props: Prop[];
}

interface GameDetails {
  eventID: string;
  leagueID: string;
  start_time: string;
  away_team: Team;
  home_team: Team;
  markets: Markets;
  player_props: PlayerProp[];
  // Additional fields from show-more endpoint
  status?: string;
  startTime_UTC?: string;
  teams_data?: {
    home_team: {
      name_short: string;
      name_long: string;
      score: number;
    };
    away_team: {
      name_short: string;
      name_long: string;
      score: number;
    };
  };
  inning_results?: { [key: string]: { away_points: number; home_points: number } };
}

export default function GameDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [gameData, setGameData] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const { addSelection } = useBetSlip();
  const { data: session } = authClient.useSession();
  const { data: currentUser, refetch: refetchUser } = useCurrentUser();
  const { data: myPool, refetch: refetchMyPool } = useMyPool();

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/events/show-more/${id}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
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

  // Helper functions
  const formatOdds = (odds: number | null | undefined): string => {
    if (odds === null || odds === undefined) return '--';
    return odds > 0 ? `+${odds}` : String(odds);
  };

  const formatPoint = (point: number | null | undefined): string => {
    if (point === null || point === undefined) return '--';
    return point > 0 ? `+${point}` : String(point);
  };

  const getOddsColor = (odds: number | null | undefined) => {
    if (!odds) return Colors.dark.textSecondary;
    return '#007BFF';
  };

  // Smart time formatting
  const getStartTimeInfo = () => {
    if (!gameData) return { label: '', time: '', isToday: false };

    const now = new Date();
    const startDate = new Date(gameData.start_time);

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
    }
    return { label: startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), time: timeString };
  };

  const isOverUnderProp = (prop: Prop): boolean => prop.line !== undefined && prop.line !== null;

  const propHasOdds = (prop: Prop): boolean => {
    if (isOverUnderProp(prop)) {
      return prop.over_payout !== null || prop.under_payout !== null;
    }
    return prop.yes_payout !== null || prop.no_payout !== null;
  };

  const isNFL = gameData?.leagueID?.toLowerCase().includes('nfl');

  // Filter players with available odds
  const playersWithOdds = React.useMemo(() => {
    return gameData?.player_props
      ?.map(player => ({
        ...player,
        props: player.props.filter(propHasOdds),
      }))
      .filter(player => player.props.length > 0) ?? [];
  }, [gameData?.player_props]);

  // Group props by category
  const propsByCategory = React.useMemo(() => {
    const grouped: Record<string, { player: PlayerProp; prop: Prop }[]> = {};

    playersWithOdds.forEach(player => {
      player.props.forEach(prop => {
        if (!grouped[prop.category]) {
          grouped[prop.category] = [];
        }
        grouped[prop.category].push({ player, prop });
      });
    });

    return grouped;
  }, [playersWithOdds]);

  // Group NFL scoring props by player
  const nflScoringByPlayer = React.useMemo(() => {
    if (!isNFL) return {};

    const grouped: Record<string, { player: PlayerProp; props: Prop[] }> = {};

    playersWithOdds.forEach(player => {
      const scoringProps = player.props.filter(prop =>
        prop.category === 'scoring' && !isOverUnderProp(prop) && propHasOdds(prop)
      );
      if (scoringProps.length > 0) {
        grouped[player.player_id] = { player, props: scoringProps };
      }
    });

    return grouped;
  }, [playersWithOdds, isNFL]);

  // Category display names
  const categoryDisplayNames: Record<string, string> = {
    scoring: 'Scoring',
    rebounding: 'Rebounding',
    playmaking: 'Playmaking',
    shooting: 'Shooting',
    passing: 'Passing',
    rushing: 'Rushing',
    receiving: 'Receiving',
    batting: 'Batting',
    pitching: 'Pitching',
    overall: 'Overall',
    defense: 'Defense',
    goaltending: 'Goaltending',
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
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

  const handleBetPlaced = async () => {
    await Promise.all([refetchUser(), refetchMyPool()]);
  };

  // Handle spread/total/moneyline bets
  const handleMarketBet = (betType: 'spread' | 'total' | 'moneyline', side: 'home' | 'away' | 'over' | 'under') => {
    if (!gameData) return;

    const getBetTypeLabel = () => {
      if (betType === 'spread') {
        const spreadSide = side === 'home' ? gameData.markets.spread.home : gameData.markets.spread.away;
        return `Spread ${spreadSide.point > 0 ? '+' : ''}${spreadSide.point}`;
      }
      if (betType === 'total') {
        return `Total O/U ${gameData.markets.total.line} ${side === 'over' ? 'O' : 'U'}`;
      }
      return 'Moneyline';
    };

    const getOdds = () => {
      if (betType === 'spread') {
        const spreadSide = side === 'home' ? gameData.markets.spread.home : gameData.markets.spread.away;
        return spreadSide.payout;
      }
      if (betType === 'total') {
        return side === 'over' ? gameData.markets.total.over_payout : gameData.markets.total.under_payout;
      }
      const teamObj = side === 'home' ? gameData.home_team : gameData.away_team;
      return teamObj.moneyline;
    };

    const teamName = side === 'home' || side === 'away' ? (side === 'home' ? gameData.home_team.name : gameData.away_team.name) : '';

    const betSelection: BetSelection = {
      id: gameData.eventID,
      eventID: gameData.eventID,
      leagueID: gameData.leagueID,
      gameTime: gameData.start_time,
      matchup: `${gameData.away_team.abbreviation} @ ${gameData.home_team.abbreviation}`,
      teamName,
      betType,
      betTypeLabel: getBetTypeLabel(),
      selection: side,
      odds: getOdds(),
      line: betType === 'spread' ? (side === 'home' ? gameData.markets.spread.home.point : gameData.markets.spread.away.point) :
            betType === 'total' ? gameData.markets.total.line : null,
      game: gameData,
    };

    addSelection(betSelection);
  };

  // Handle player prop bets
  const handlePropBet = (player: PlayerProp, prop: Prop, selection: 'over' | 'under' | 'yes' | 'no') => {
    if (!gameData) return;

    const odds = selection === 'over' ? prop.over_payout :
                  selection === 'under' ? prop.under_payout :
                  selection === 'yes' ? prop.yes_payout : prop.no_payout;

    if (odds === null || odds === undefined) return;

    const betSelection: BetSelection = {
      id: `${gameData.eventID}-${player.player_id}-${prop.stat_type}`,
      eventID: gameData.eventID,
      leagueID: gameData.leagueID,
      gameTime: gameData.start_time,
      matchup: `${gameData.away_team.abbreviation} @ ${gameData.home_team.abbreviation}`,
      teamName: player.player_name,
      betType: 'player_prop',
      betTypeLabel: selection === 'yes' || selection === 'no' ? `${prop.display_name} ${selection.toUpperCase()}` : `${prop.display_name} ${selection === 'over' ? 'O' : 'U'}${prop.line}`,
      selection,
      odds,
      line: prop.line ?? null,
      game: gameData,
      playerPropData: {
        playerId: player.player_id,
        playerName: player.player_name,
        statType: prop.stat_type,
        displayName: prop.display_name,
        category: prop.category,
      },
    };

    addSelection(betSelection);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.dark.text} weight="bold" />
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.dark.text} weight="bold" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Game Details</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load game details'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const winner = gameData.teams_data?.away_team && gameData.teams_data?.home_team
    ? (gameData.teams_data.away_team.score > gameData.teams_data.home_team.score ? 'away' : 'home')
    : null;

  const startTimeInfo = getStartTimeInfo();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.dark.text} weight="bold" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Game Details</Text>
        <View style={styles.backButton} />
      </View>
    <View style={{height: 20}}/>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
         {/* Game Info */}
         <View style={[styles.gameInfoSection, {paddingVertical: 35}]}>
          <Text style={styles.sectionTitle}>Game Info</Text>
          <View style={styles.gameInfoRow}>
            <Text style={styles.leagueText}>{gameData.leagueID}</Text>
            <View style={[styles.statusBadge, gameData.status === 'Final' ? styles.statusFinal : styles.statusLive]}>
              <Text style={styles.statusText}>{(gameData.status || 'Scheduled').toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.gameTime}>{formatDate(gameData.start_time)}</Text>
        </View>
        {/* Betting Markets Card - Matching MarketGameCard Design */}
        <View style={styles.bettingMarketsCard}>
          {/* Header with Matchup */}
          <View style={styles.cardHeader}>
            <View style={styles.matchupContainer}>
              <Text style={styles.awayTeam}>{gameData.away_team.abbreviation}</Text>
              <Text style={styles.atSymbol}>@</Text>
              <Text style={styles.homeTeam}>{gameData.home_team.abbreviation}</Text>
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
                  <Text style={styles.teamBadgeText}>{gameData.away_team.abbreviation}</Text>
                </View>
              </View>

              {/* Spread */}
              <TouchableOpacity
                style={styles.betColumn}
                onPress={() => handleMarketBet('spread', 'away')}
                activeOpacity={0.7}
              >
                <View style={styles.betCell}>
                  <Text style={styles.betValue}>{formatPoint(gameData.markets.spread.away.point)}</Text>
                  <Text style={[styles.betOdds, { color: getOddsColor(gameData.markets.spread.away.payout) }]}>
                    {formatOdds(gameData.markets.spread.away.payout)}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Total - Over */}
              <TouchableOpacity
                style={styles.betColumn}
                onPress={() => handleMarketBet('total', 'over')}
                activeOpacity={0.7}
              >
                <View style={styles.betCell}>
                  <Text style={styles.betValue}>O{formatPoint(gameData.markets.total.line)}</Text>
                  <Text style={[styles.betOdds, { color: getOddsColor(gameData.markets.total.over_payout) }]}>
                    {formatOdds(gameData.markets.total.over_payout)}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Moneyline */}
              <TouchableOpacity
                style={styles.betColumn}
                onPress={() => handleMarketBet('moneyline', 'away')}
                activeOpacity={0.7}
              >
                <View style={styles.betCell}>
                  <Text style={[styles.moneylineValue, { color: getOddsColor(gameData.away_team.moneyline) }]}>
                    {formatOdds(gameData.away_team.moneyline)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Home Team Bets */}
            <View style={[styles.teamBetsRow, styles.lastRow]}>
              <View style={styles.teamLabelColumn}>
                <View style={[styles.teamBadge, styles.homeBadge]}>
                  <Text style={styles.teamBadgeText}>{gameData.home_team.abbreviation}</Text>
                </View>
              </View>

              {/* Spread */}
              <TouchableOpacity
                style={styles.betColumn}
                onPress={() => handleMarketBet('spread', 'home')}
                activeOpacity={0.7}
              >
                <View style={styles.betCell}>
                  <Text style={styles.betValue}>{formatPoint(gameData.markets.spread.home.point)}</Text>
                  <Text style={[styles.betOdds, { color: getOddsColor(gameData.markets.spread.home.payout) }]}>
                    {formatOdds(gameData.markets.spread.home.payout)}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Total - Under */}
              <TouchableOpacity
                style={styles.betColumn}
                onPress={() => handleMarketBet('total', 'under')}
                activeOpacity={0.7}
              >
                <View style={styles.betCell}>
                  <Text style={styles.betValue}>U{formatPoint(gameData.markets.total.line)}</Text>
                  <Text style={[styles.betOdds, { color: getOddsColor(gameData.markets.total.under_payout) }]}>
                    {formatOdds(gameData.markets.total.under_payout)}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Moneyline */}
              <TouchableOpacity
                style={styles.betColumn}
                onPress={() => handleMarketBet('moneyline', 'home')}
                activeOpacity={0.7}
              >
                <View style={styles.betCell}>
                  <Text style={[styles.moneylineValue, { color: getOddsColor(gameData.home_team.moneyline) }]}>
                    {formatOdds(gameData.home_team.moneyline)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

       

        {/* Score Display */}
        {gameData.teams_data && (
          <View style={styles.scoreSection}>
            <View style={styles.teamRow}>
              <View style={styles.teamNameContainer}>
                <Text style={[styles.teamName, winner === 'away' && styles.winnerText]}>
                  {gameData.teams_data.away_team.name_short}
                </Text>
                <Text style={styles.teamCity}>
                  {gameData.teams_data.away_team.name_long?.split(' ').slice(0, -1).join(' ') || ''}
                </Text>
              </View>
              <Text style={[styles.scoreText, winner === 'away' && styles.winnerScoreText]}>
                {gameData.teams_data.away_team.score}
              </Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.teamRow}>
              <View style={styles.teamNameContainer}>
                <Text style={[styles.teamName, winner === 'home' && styles.winnerText]}>
                  {gameData.teams_data.home_team.name_short}
                </Text>
                <Text style={styles.teamCity}>
                  {gameData.teams_data.home_team.name_long?.split(' ').slice(0, -1).join(' ') || ''}
                </Text>
              </View>
              <Text style={[styles.scoreText, winner === 'home' && styles.winnerScoreText]}>
                {gameData.teams_data.home_team.score}
              </Text>
            </View>
          </View>
        )}

        {/* Score Breakdown */}
        {gameData.inning_results && Object.keys(gameData.inning_results).length > 0 && gameData.teams_data && (
          <View style={styles.inningsCard}>
            <Text style={styles.sectionTitle}>Score Breakdown</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.inningsTable}>
                <View style={styles.inningsHeaderRow}>
                  <View style={styles.inningsTeamCell}>
                    <Text style={styles.inningsHeaderText}>TEAM</Text>
                  </View>
                  {Object.keys(gameData.inning_results).map((inning) => (
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
                <View style={styles.inningsDataRow}>
                  <View style={styles.inningsTeamCell}>
                    <Text style={styles.inningsTeamText}>{gameData.teams_data.away_team.name_short}</Text>
                  </View>
                  {Object.values(gameData.inning_results).map((result, idx) => (
                    <View key={idx} style={styles.inningsCell}>
                      <Text style={styles.inningsValue}>{result.away_points}</Text>
                    </View>
                  ))}
                  <View style={styles.inningsTotalCell}>
                    <Text style={styles.inningsTotalValue}>{gameData.teams_data.away_team.score}</Text>
                  </View>
                </View>
                <View style={styles.inningsDataRow}>
                  <View style={styles.inningsTeamCell}>
                    <Text style={styles.inningsTeamText}>{gameData.teams_data.home_team.name_short}</Text>
                  </View>
                  {Object.values(gameData.inning_results).map((result, idx) => (
                    <View key={idx} style={styles.inningsCell}>
                      <Text style={styles.inningsValue}>{result.home_points}</Text>
                    </View>
                  ))}
                  <View style={styles.inningsTotalCell}>
                    <Text style={styles.inningsTotalValue}>{gameData.teams_data.home_team.score}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
<View style={{height: 20}}/>
        {/* Player Props */}
        {gameData.player_props && Object.keys(propsByCategory).length > 0 && (
          <View style={styles.playerPropsSection}>
            <Text style={styles.sectionTitle}>Player Props</Text>
            <Text style={styles.sectionSubtitle}>
              {playersWithOdds.length} player{playersWithOdds.length !== 1 ? 's' : ''} • {
                Object.values(propsByCategory).reduce((acc, items) => acc + items.length, 0)
              } prop{Object.values(propsByCategory).reduce((acc, items) => acc + items.length, 0) !== 1 ? 's' : ''}
            </Text>

            {Object.entries(propsByCategory).map(([category, items]) => {
              const isExpanded = expandedCategories.has(category);
              const displayName = categoryDisplayNames[category] || category;

              return (
                <View key={category} style={styles.categorySection}>
                  <TouchableOpacity style={styles.categoryHeader} onPress={() => toggleCategory(category)}>
                    <View style={styles.categoryHeaderLeft}>
                      <Text style={styles.categoryTitle}>{displayName}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{items.length}</Text>
                      </View>
                    </View>
                    <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.dark.textSecondary} />
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.categoryContent}>
                      {/* NFL Scoring Card */}
                      {category === 'scoring' && isNFL ? (
                        <NFLScoringCard
                          players={Object.values(nflScoringByPlayer).map(({ player, props }) => ({
                            player_id: player.player_id,
                            player_name: player.player_name,
                            props,
                          }))}
                          eventID={gameData.eventID}
                          leagueID={gameData.leagueID}
                          gameTime={gameData.start_time}
                          matchup={`${gameData.away_team.abbreviation} @ ${gameData.home_team.abbreviation}`}
                          onBetSelect={addSelection}
                        />
                      ) : (
                        // Standard Props
                        items.map(({ player, prop }, idx) => (
                          <View key={`${player.player_id}-${prop.stat_type}-${idx}`} style={styles.propItemCard}>
                            <View style={styles.propItemHeader}>
                              <View style={styles.propItemInfo}>
                                <Text style={styles.propItemPlayerName}>{player.player_name}</Text>
                                <View style={styles.propItemStatRow}>
                                  <Text style={styles.propItemStatName}>{prop.display_name}</Text>
                                  {isOverUnderProp(prop) && (
                                    <View style={styles.propItemLineChip}>
                                      <Text style={styles.propItemLineText}>{prop.line}</Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </View>
                            <View style={styles.propItemOdds}>
                              {isOverUnderProp(prop) ? (
                                <>
                                  <TouchableOpacity
                                    style={[styles.oddButton, styles.overButton]}
                                    onPress={() => handlePropBet(player, prop, 'over')}
                                    activeOpacity={0.7}
                                    disabled={prop.over_payout === null}
                                  >
                                    <Text style={styles.oddLabel}>O</Text>
                                    <Text style={styles.oddValue}>{formatOdds(prop.over_payout)}</Text>
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    style={[styles.oddButton, styles.underButton]}
                                    onPress={() => handlePropBet(player, prop, 'under')}
                                    activeOpacity={0.7}
                                    disabled={prop.under_payout === null}
                                  >
                                    <Text style={styles.oddLabel}>U</Text>
                                    <Text style={styles.oddValue}>{formatOdds(prop.under_payout)}</Text>
                                  </TouchableOpacity>
                                </>
                              ) : (
                                <>
                                  <TouchableOpacity
                                    style={[styles.oddButton, styles.yesButton]}
                                    onPress={() => handlePropBet(player, prop, 'yes')}
                                    activeOpacity={0.7}
                                    disabled={prop.yes_payout === null}
                                  >
                                    <Text style={styles.oddLabel}>YES</Text>
                                    <Text style={styles.oddValue}>{formatOdds(prop.yes_payout)}</Text>
                                  </TouchableOpacity>
                                  {prop.no_payout !== null && (
                                    <TouchableOpacity
                                      style={[styles.oddButton, styles.noButton]}
                                      onPress={() => handlePropBet(player, prop, 'no')}
                                      activeOpacity={0.7}
                                    >
                                      <Text style={styles.oddLabel}>NO</Text>
                                      <Text style={styles.oddValue}>{formatOdds(prop.no_payout)}</Text>
                                    </TouchableOpacity>
                                  )}
                                </>
                              )}
                            </View>
                          </View>
                        ))
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      <BetSlipFloatingButton />
      <BetSlipBottomSheet
        userUnits={currentUser?.current_credits || currentUser?.credits || 0}
        userId={session?.user?.id}
        poolId={typeof myPool?.pool === 'object' ? myPool.pool.id : myPool?.pool}
        onBetPlaced={handleBetPlaced}
      />
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
    backgroundColor: 'transparent',
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
  sectionTitle: {
    ...Typography.sectionHeader.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  bottomSpacing: {
    height: 80,
  },

  // Betting Markets Card - Matching MarketGameCard Design
  bettingMarketsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
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

  // Game Info
  gameInfoSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  gameInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leagueText: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.medium,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusFinal: {
    backgroundColor: Colors.dark.textSecondary + '15',
  },
  statusLive: {
    backgroundColor: Colors.dark.success + '15',
  },
  statusText: {
    ...Typography.meta.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  gameTime: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },

  // Score Section
  scoreSection: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  teamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  teamNameContainer: {
    flex: 1,
  },
  teamName: {
    ...Typography.title.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 24,
    marginBottom: 2,
  },
  teamCity: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  winnerText: {
    color: Colors.dark.tint,
  },
  scoreText: {
    ...Typography.title.large,
    fontSize: 40,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    minWidth: 60,
    textAlign: 'right',
  },
  winnerScoreText: {
    color: Colors.dark.tint,
  },
  scoreDivider: {
    height: 1,
    backgroundColor: Colors.dark.border + '40',
    marginVertical: 8,
  },

  // Innings Card
  inningsCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border + '40',
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

  // Player Props
  playerPropsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionSubtitle: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
    fontSize: 13,
  },
  categorySection: {
    marginBottom: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border + '40',
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.cardElevated + '60',
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryTitle: {
    ...Typography.title.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  categoryBadge: {
    backgroundColor: Colors.dark.tint + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.tint + '40',
  },
  categoryBadgeText: {
    ...Typography.meta.small,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 11,
  },
  categoryContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  propItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border + '30',
  },
  propItemHeader: {
    flex: 1,
    marginRight: 12,
  },
  propItemInfo: {
    gap: 4,
  },
  propItemPlayerName: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
  propItemStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  propItemStatName: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  propItemLineChip: {
    backgroundColor: Colors.dark.cardElevated,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  propItemLineText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 12,
  },
  propItemOdds: {
    flexDirection: 'row',
    gap: 6,
  },
  oddButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 65,
  },
  overButton: {
    backgroundColor: Colors.dark.success + '20',
    borderWidth: 1,
    borderColor: Colors.dark.success + '40',
  },
  underButton: {
    backgroundColor: Colors.dark.danger + '20',
    borderWidth: 1,
    borderColor: Colors.dark.danger + '40',
  },
  yesButton: {
    backgroundColor: Colors.dark.tint + '20',
    borderWidth: 1,
    borderColor: Colors.dark.tint + '40',
  },
  noButton: {
    backgroundColor: Colors.dark.textSecondary + '20',
    borderWidth: 1,
    borderColor: Colors.dark.textSecondary + '40',
  },
  oddLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  oddValue: {
    ...Typography.emphasis.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 14,
  },
});
