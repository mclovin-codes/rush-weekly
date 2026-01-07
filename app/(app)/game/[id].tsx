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
import { CaretLeft, TrendUp } from 'phosphor-react-native';
import { API_BASE_URL } from '@/constants/api';
import MarketGameCard from '@/components/MarketGameCard';
// import { MarketGame } from '@/types';
import { useMarketGames } from '@/hooks/useMarketGames';
import BetSlipBottomSheet from '@/app/modal';
import { useCurrentUser } from '@/hooks/useUser';
import { useMyPool } from '@/hooks/usePools';
import { authClient } from '@/lib/auth-client';
import { useBetSlip, BetSelection } from '@/providers/BetSlipProvider';
import BetSlipFloatingButton from '@/components/BetSlipFloatingButton';

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

interface Prop {
  stat_type: string;
  display_name: string;
  category: string;
  // Over/Under props
  line?: number;
  over_payout?: number | null;
  under_payout?: number | null;
  // Yes/No props
  yes_payout?: number | null;
  no_payout?: number | null;
}

interface PlayerProp {
  player_id: string;
  player_name: string;
  props: Prop[];
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
  player_props: PlayerProp[] | null;
}

const extractEventCore = (gameData: any) => {
  const {
    eventID,
    leagueID,
    start_time,
    away_team,
    home_team,
    markets,
  } = gameData;

  return {
    eventID,
    leagueID,
    start_time,
    away_team,
    home_team,
    markets,
  };
};

export default function GameDetailsScreen() {

  const { id } = useLocalSearchParams<{ id: string }>();
  console.log('😊😊😊😊😊😊', id)

  const router = useRouter();

  const [gameData, setGameData] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerPropsExpanded, setPlayerPropsExpanded] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Bet slip context
  const { addSelection } = useBetSlip();

  const { data: session } = authClient.useSession();

  const { data: currentUser, refetch: refetchUser } = useCurrentUser();
 

  const { data: myPool, refetch: refetchMyPool } = useMyPool();
  
  // Fetch market game data for betting options

  const { data: marketGames } = useMarketGames({
    status: 'scheduled',
    oddsAvailable: true,
    limit: 100,
  });


  // Find the specific game from market data
  const marketGame = marketGames?.find(game => game.eventID === id);

  // Debug logging for player props
  useEffect(() => {
    if (gameData?.event_summary) {
      console.log('[Debug] event_summary.leagueID:', gameData.event_summary.leagueID);
    }
    if (marketGame) {
      console.log('[Debug] marketGame.leagueID:', marketGame.leagueID);
    } else {
      console.log('[Debug] marketGame is undefined/null');
    }
  }, [gameData, marketGame]);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setLoading(true);
        const url = `${API_BASE_URL}/api/events/show-more/${id}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch game details: ${response.status}`);
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
    } else {
      console.warn('[GameDetailsScreen] ⚠️ No ID provided, skipping fetch!');
    }
  }, [id]);

  // Helper functions for player props
  const formatPropsOdds = (odds: number | null | undefined): string => {
    if (odds === null || odds === undefined) return '-';
    return odds > 0 ? `+${odds}` : String(odds);
  };

  const isOverUnderProp = (prop: Prop): boolean => {
    return prop.line !== undefined;
  };

  const propHasOdds = (prop: Prop): boolean => {
    if (isOverUnderProp(prop)) {
      return prop.over_payout !== null || prop.under_payout !== null;
    }
    return prop.yes_payout !== null || prop.no_payout !== null;
  };

  // Filter players with available odds - must be before early returns
  const playersWithOdds = React.useMemo(() => {
    return gameData?.player_props
      ?.map(player => ({
        ...player,
        props: player.props.filter(propHasOdds),
      }))
      .filter(player => player.props.length > 0);
  }, [gameData?.player_props]);

  // Group props by category - must be before early returns
  const propsByCategory = React.useMemo(() => {
    if (!playersWithOdds) return {};

    const grouped: Record<string, Array<{ player: PlayerProp; prop: Prop }>> = {};

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

  // const formatOdds = (odds: string | undefined) => {
  //   if (!odds) return '--';
  //   const numOdds = parseFloat(odds);
  //   return numOdds > 0 ? `+${numOdds}` : `${numOdds}`;
  // };

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



  const { event_summary, teams_data, inning_results, betting_markets, player_props } = gameData;

  // Only calculate winner if we have teams_data
  const winner = teams_data?.away_team && teams_data?.home_team
    ? (teams_data.away_team.score > teams_data.home_team.score ? 'away' : 'home')
    : null;

  // Check if we have the necessary game data
  const hasGameData = event_summary && teams_data;

  const handleBetPlaced = async () => {
    // Refresh user credits and pool data after bet placement
    await Promise.all([
      refetchUser(),
      refetchMyPool(),
    ]);
  };
  const coreGame = extractEventCore(gameData);

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
<View  style={styles.gameInfoSection}>
<Text style={styles.sectionTitle}>Game Info</Text>
<MarketGameCard
      key={coreGame.eventID}
      game={coreGame}
      onSelectBet={(selectedGame, betType, team, selection) => {
        // Create bet selection for multi-bet slip
        const getBetTypeLabel = () => {
          if (betType === 'spread') {
            const spread = selectedGame.markets?.spread;
            const spreadSide = team === 'home' ? spread?.home : spread?.away;
            return `Spread ${spreadSide?.point && spreadSide.point > 0 ? '+' : ''}${spreadSide?.point || '--'}`;
          }
          if (betType === 'total') {
            const total = selectedGame.markets?.total;
            return `Total ${total?.line ? `O/U ${total.line}` : '--'} ${selection === 'over' ? 'O' : 'U'}`;
          }
          return 'Moneyline';
        };

        const getOdds = () => {
          if (betType === 'spread') {
            const spread = selectedGame.markets?.spread;
            const spreadSide = team === 'home' ? spread?.home : spread?.away;
            return spreadSide?.payout || 0;
          }
          if (betType === 'total') {
            const total = selectedGame.markets?.total;
            return selection === 'over' ? total?.over_payout || 0 : total?.under_payout || 0;
          }
          const teamObj = team === 'home' ? selectedGame.home_team : selectedGame.away_team;
          return teamObj.moneyline || 0;
        };

        const betSelection: BetSelection = {
          id: selectedGame.eventID,
          eventID: selectedGame.eventID,
          leagueID: selectedGame.leagueID,
          gameTime: selectedGame.start_time,
          matchup: `${selectedGame.away_team.abbreviation} @ ${selectedGame.home_team.abbreviation}`,
          teamName: team === 'home' ? selectedGame.home_team.name : selectedGame.away_team.name,
          betType: betType,
          betTypeLabel: getBetTypeLabel(),
          selection: betType === 'total' ? (selection || 'over') : team,
          odds: getOdds(),
          line: betType === 'spread' ?
            (team === 'home' ? selectedGame.markets?.spread?.home?.point : selectedGame.markets?.spread?.away?.point) :
            betType === 'total' ?
            selectedGame.markets?.total?.line :
            null,
          game: selectedGame,
        };

        addSelection(betSelection);
      }}
      onPress={() => null}
      shouldNavigate={false}
    />
</View>


        {/* Game Info - Only show if we have event_summary */}
        {hasGameData && event_summary && (
          <View style={styles.gameInfoSection}>
            <View style={styles.gameInfoRow}>
              <Text style={styles.leagueText}>{event_summary.leagueID}</Text>
              <View style={[
                styles.statusBadge,
                event_summary.status === 'Final' ? styles.statusFinal : styles.statusLive
              ]}>
                <Text style={styles.statusText}>{event_summary.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.gameTime}>{formatDate(event_summary.startTime_UTC)}</Text>
          </View>
        )}

        {/* Score Display - Only show if we have teams_data */}
        {hasGameData && teams_data && (
          <View style={styles.scoreSection}>
            {/* Away Team */}
            <View style={styles.teamRow}>
              <View style={styles.teamNameContainer}>
                <Text style={[styles.teamName, winner === 'away' && styles.winnerText]}>
                  {teams_data.away_team.name_short}
                </Text>
                <Text style={styles.teamCity}>
                  {teams_data.away_team.name_long?.split(' ').slice(0, -1).join(' ') || ''}
                </Text>
              </View>
              <Text style={[styles.scoreText, winner === 'away' && styles.winnerScoreText]}>
                {teams_data.away_team.score}
              </Text>
            </View>

            {/* Divider */}
            <View style={styles.scoreDivider} />

            {/* Home Team */}
            <View style={styles.teamRow}>
              <View style={styles.teamNameContainer}>
                <Text style={[styles.teamName, winner === 'home' && styles.winnerText]}>
                  {teams_data.home_team.name_short}
                </Text>
                <Text style={styles.teamCity}>
                  {teams_data.home_team.name_long?.split(' ').slice(0, -1).join(' ') || ''}
                </Text>
              </View>
              <Text style={[styles.scoreText, winner === 'home' && styles.winnerScoreText]}>
                {teams_data.home_team.score}
              </Text>
            </View>
          </View>
        )}

        {/* Inning by Inning / Quarter by Quarter - Only show if we have data */}
        {hasGameData && inning_results && Object.keys(inning_results).length > 0 && teams_data && (
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

        {/* Player Props Section - Organized by Category */}
        {player_props && Object.keys(propsByCategory).length > 0 && (
          <View style={styles.playerPropsSection}>
            <Text style={styles.sectionTitle}>Player Props</Text>
            <Text style={styles.sectionSubtitle}>
              {playersWithOdds?.length || 0} player{(playersWithOdds?.length || 0) !== 1 ? 's' : ''} • {
                Object.values(propsByCategory).reduce((acc, items) => acc + items.length, 0)
              } prop{Object.values(propsByCategory).reduce((acc, items) => acc + items.length, 0) !== 1 ? 's' : ''}
            </Text>

            {Object.entries(propsByCategory).map(([category, items]) => {
              const isExpanded = expandedCategories.has(category);
              const displayName = categoryDisplayNames[category] || category;

              return (
                <View key={category} style={styles.categorySection}>
                  {/* Category Header - Clickable */}
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category)}
                  >
                    <View style={styles.categoryHeaderLeft}>
                      <Text style={styles.categoryTitle}>{displayName}</Text>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{items.length}</Text>
                      </View>
                    </View>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={Colors.dark.textSecondary}
                    />
                  </TouchableOpacity>

                  {/* Category Content - Collapsible */}
                  {isExpanded && (
                    <View style={styles.categoryContent}>
                      {items.map(({ player, prop }, idx) => (
                        <View key={`${player.player_id}-${prop.stat_type}-${idx}`} style={styles.propItemCard}>
                          {/* Player Name & Stat */}
                          <View style={styles.propItemHeader}>
                            <View style={styles.propItemInfo}>
                              <Text style={styles.propItemPlayerName}>{player.player_name}</Text>
                              <View style={styles.propItemStatRow}>
                                <Text style={styles.propItemStatName}>{prop.display_name}</Text>
                                {isOverUnderProp(prop) && prop.line !== undefined && (
                                  <View style={styles.propItemLineChip}>
                                    <Text style={styles.propItemLineText}>{prop.line}</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>

                          {/* Odds Buttons */}
                          <View style={styles.propItemOdds}>
                            {isOverUnderProp(prop) ? (
                              <>
                                <TouchableOpacity
                                  style={[styles.oddButton, styles.overButton]}
                                  onPress={() => {
                                    if (prop.over_payout === null || prop.over_payout === undefined) return;
                                    console.log(`[Player Prop] Selected OVER for ${player.player_name} - ${prop.display_name} O${prop.line} (${prop.over_payout})`);
                                    // Extract leagueID from playerId as fallback (e.g., "PLAYER_NAME_1_NFL" -> "NFL")
                                    const leagueFromPlayerId = player.player_id.split('_').pop() || '';
                                    const betSelection: BetSelection = {
                                      id: `${id}-${player.player_id}-${prop.stat_type}`,
                                      eventID: id,
                                      leagueID: marketGame?.leagueID || event_summary?.leagueID || leagueFromPlayerId,
                                      gameTime: marketGame?.start_time || event_summary?.startTime_UTC || '',
                                      matchup: `${teams_data?.away_team?.name_short || ''} @ ${teams_data?.home_team?.name_short || ''}`,
                                      teamName: player.player_name,
                                      betType: 'player_prop',
                                      betTypeLabel: `${prop.display_name} O${prop.line}`,
                                      selection: 'over',
                                      odds: prop.over_payout,
                                      line: prop.line || null,
                                      game: marketGame!,
                                      playerPropData: {
                                        playerId: player.player_id,
                                        playerName: player.player_name,
                                        statType: prop.stat_type,
                                        displayName: prop.display_name,
                                        category: prop.category,
                                      },
                                    };
                                    const leagueSource = marketGame?.leagueID ? 'marketGame' : (event_summary?.leagueID ? 'event_summary' : 'playerId');
                                    console.log(`[Player Prop] BetSelection created with leagueID: "${betSelection.leagueID}" (from ${leagueSource})`);
                                    addSelection(betSelection);
                                  }}
                                  activeOpacity={0.7}
                                  disabled={prop.over_payout === null || prop.over_payout === undefined}
                                >
                                  <Text style={styles.oddLabel}>O</Text>
                                  <Text style={styles.oddValue}>{formatPropsOdds(prop.over_payout)}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={[styles.oddButton, styles.underButton]}
                                  onPress={() => {
                                    if (prop.under_payout === null || prop.under_payout === undefined) return;
                                    console.log(`[Player Prop] Selected UNDER for ${player.player_name} - ${prop.display_name} U${prop.line} (${prop.under_payout})`);
                                    // Extract leagueID from playerId as fallback (e.g., "PLAYER_NAME_1_NFL" -> "NFL")
                                    const leagueFromPlayerId = player.player_id.split('_').pop() || '';
                                    const betSelection: BetSelection = {
                                      id: `${id}-${player.player_id}-${prop.stat_type}`,
                                      eventID: id,
                                      leagueID: marketGame?.leagueID || event_summary?.leagueID || leagueFromPlayerId,
                                      gameTime: marketGame?.start_time || event_summary?.startTime_UTC || '',
                                      matchup: `${teams_data?.away_team?.name_short || ''} @ ${teams_data?.home_team?.name_short || ''}`,
                                      teamName: player.player_name,
                                      betType: 'player_prop',
                                      betTypeLabel: `${prop.display_name} U${prop.line}`,
                                      selection: 'under',
                                      odds: prop.under_payout,
                                      line: prop.line || null,
                                      game: marketGame!,
                                      playerPropData: {
                                        playerId: player.player_id,
                                        playerName: player.player_name,
                                        statType: prop.stat_type,
                                        displayName: prop.display_name,
                                        category: prop.category,
                                      },
                                    };
                                    addSelection(betSelection);
                                  }}
                                  activeOpacity={0.7}
                                  disabled={prop.under_payout === null || prop.under_payout === undefined}
                                >
                                  <Text style={styles.oddLabel}>U</Text>
                                  <Text style={styles.oddValue}>{formatPropsOdds(prop.under_payout)}</Text>
                                </TouchableOpacity>
                              </>
                            ) : (
                              <>
                                <TouchableOpacity
                                  style={[styles.oddButton, styles.yesButton]}
                                  onPress={() => {
                                    if (prop.yes_payout === null || prop.yes_payout === undefined) return;
                                    console.log(`[Player Prop] Selected YES for ${player.player_name} - ${prop.display_name} (${prop.yes_payout})`);
                                    // Extract leagueID from playerId as fallback (e.g., "PLAYER_NAME_1_NFL" -> "NFL")
                                    const leagueFromPlayerId = player.player_id.split('_').pop() || '';
                                    const betSelection: BetSelection = {
                                      id: `${id}-${player.player_id}-${prop.stat_type}`,
                                      eventID: id,
                                      leagueID: marketGame?.leagueID || event_summary?.leagueID || leagueFromPlayerId,
                                      gameTime: marketGame?.start_time || event_summary?.startTime_UTC || '',
                                      matchup: `${teams_data?.away_team?.name_short || ''} @ ${teams_data?.home_team?.name_short || ''}`,
                                      teamName: player.player_name,
                                      betType: 'player_prop',
                                      betTypeLabel: `${prop.display_name} Yes`,
                                      selection: 'yes',
                                      odds: prop.yes_payout,
                                      line: null,
                                      game: marketGame!,
                                      playerPropData: {
                                        playerId: player.player_id,
                                        playerName: player.player_name,
                                        statType: prop.stat_type,
                                        displayName: prop.display_name,
                                        category: prop.category,
                                      },
                                    };
                                    addSelection(betSelection);
                                  }}
                                  activeOpacity={0.7}
                                  disabled={prop.yes_payout === null || prop.yes_payout === undefined}
                                >
                                  <Text style={styles.oddLabel}>YES</Text>
                                  <Text style={styles.oddValue}>{formatPropsOdds(prop.yes_payout)}</Text>
                                </TouchableOpacity>
                                {prop.no_payout !== null && prop.no_payout !== undefined && (
                                  <TouchableOpacity
                                    style={[styles.oddButton, styles.noButton]}
                                    onPress={() => {
                                      if (prop.no_payout === null || prop.no_payout === undefined) return;
                                      console.log(`[Player Prop] Selected NO for ${player.player_name} - ${prop.display_name} (${prop.no_payout})`);
                                      // Extract leagueID from playerId as fallback (e.g., "PLAYER_NAME_1_NFL" -> "NFL")
                                      const leagueFromPlayerId = player.player_id.split('_').pop() || '';
                                      const betSelection: BetSelection = {
                                        id: `${id}-${player.player_id}-${prop.stat_type}`,
                                        eventID: id,
                                        leagueID: marketGame?.leagueID || event_summary?.leagueID || leagueFromPlayerId,
                                        gameTime: marketGame?.start_time || event_summary?.startTime_UTC || '',
                                        matchup: `${teams_data?.away_team?.name_short || ''} @ ${teams_data?.home_team?.name_short || ''}`,
                                        teamName: player.player_name,
                                        betType: 'player_prop',
                                        betTypeLabel: `${prop.display_name} No`,
                                        selection: 'no',
                                        odds: prop.no_payout,
                                        line: null,
                                        game: marketGame!,
                                        playerPropData: {
                                          playerId: player.player_id,
                                          playerName: player.player_name,
                                          statType: prop.stat_type,
                                          displayName: prop.display_name,
                                          category: prop.category,
                                        },
                                      };
                                      addSelection(betSelection);
                                    }}
                                    activeOpacity={0.7}
                                    disabled={prop.no_payout === null || prop.no_payout === undefined}
                                  >
                                    <Text style={styles.oddLabel}>NO</Text>
                                    <Text style={styles.oddValue}>{formatPropsOdds(prop.no_payout)}</Text>
                                  </TouchableOpacity>
                                )}
                              </>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Betting Markets - Using MarketGameCard */}
        {marketGame && (
          <View style={styles.marketGameSection}>
            <MarketGameCard
              game={marketGame}
              onSelectBet={(selectedGame, betType, team, selection) => {
                // Create bet selection for multi-bet slip
                const getBetTypeLabel = () => {
                  if (betType === 'spread') {
                    const spread = selectedGame.markets?.spread;
                    const spreadSide = team === 'home' ? spread?.home : spread?.away;
                    return `Spread ${spreadSide?.point && spreadSide.point > 0 ? '+' : ''}${spreadSide?.point || '--'}`;
                  }
                  if (betType === 'total') {
                    const total = selectedGame.markets?.total;
                    return `Total ${total?.line ? `O/U ${total.line}` : '--'} ${selection === 'over' ? 'O' : 'U'}`;
                  }
                  return 'Moneyline';
                };

                const getOdds = () => {
                  if (betType === 'spread') {
                    const spread = selectedGame.markets?.spread;
                    const spreadSide = team === 'home' ? spread?.home : spread?.away;
                    return spreadSide?.payout || 0;
                  }
                  if (betType === 'total') {
                    const total = selectedGame.markets?.total;
                    return selection === 'over' ? total?.over_payout || 0 : total?.under_payout || 0;
                  }
                  const teamObj = team === 'home' ? selectedGame.home_team : selectedGame.away_team;
                  return teamObj.moneyline || 0;
                };

                const betSelection: BetSelection = {
                  // ID based on eventID only, so only one bet per event is allowed
                  id: selectedGame.eventID,
                  eventID: selectedGame.eventID,
                  leagueID: selectedGame.leagueID,
                  gameTime: selectedGame.start_time,
                  matchup: `${selectedGame.away_team.abbreviation} @ ${selectedGame.home_team.abbreviation}`,
                  teamName: team === 'home' ? selectedGame.home_team.name : selectedGame.away_team.name,
                  betType: betType,
                  betTypeLabel: getBetTypeLabel(),
                  selection: betType === 'total' ? (selection || 'over') : team,
                  odds: getOdds(),
                  line: betType === 'spread' ?
                    (team === 'home' ? selectedGame.markets?.spread?.home?.point : selectedGame.markets?.spread?.away?.point) :
                    betType === 'total' ?
                    selectedGame.markets?.total?.line :
                    null,
                  game: selectedGame,
                };

                addSelection(betSelection);
              }}
              onPress={() => {}} // Already on game details page
            />
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Bet Slip Button */}
      <BetSlipFloatingButton />

      {/* Bet Slip Bottom Sheet */}
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
  gameInfoSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
  scoreSection: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
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
    fontSize: 16,
    marginBottom: 16,
    letterSpacing: 0.5,
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
    marginHorizontal: 20,
    marginBottom: 20,
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
  marketGameSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bettingCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border + '40',
  },
  marketSection: {
    marginBottom: 16,
  },
  marketTitle: {
    ...Typography.meta.medium,
    color: Colors.dark.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
  },
  marketRow: {
    flexDirection: 'row',
    gap: 10,
  },
  marketTeam: {
    flex: 1,
    backgroundColor: Colors.dark.cardElevated + '80',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.dark.border + '30',
  },
  marketTeamName: {
    ...Typography.body.small,
    color: Colors.dark.text,
    marginBottom: 8,
    fontSize: 13,
  },
  oddsChip: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  oddsChipText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.display,
    fontSize: 13,
  },
  actualScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border + '40',
  },
  actualScoreLabel: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    marginRight: 6,
    fontSize: 12,
  },
  actualScoreValue: {
    ...Typography.emphasis.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 14,
  },
  bettingOptionsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 80,
  },

  // Player Props Styles
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
  playerCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border + '40',
  },
  playerName: {
    ...Typography.title.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 18,
    marginBottom: 12,
  },
  propRow: {
    marginBottom: 12,
  },
  propHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  propName: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  propLine: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
  },
  propOdds: {
    flexDirection: 'row',
    gap: 8,
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
    color: '#007BFF', // Blue for odds values
    fontFamily: Fonts.display,
    fontSize: 14,
  },
  morePlayersText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.dark.tint + '40',
    gap: 8,
  },
  expandButtonText: {
    ...Typography.body.medium,
    color: Colors.dark.tint,
    fontSize: 14,
    fontFamily: Fonts.medium,
  },

  // Category-based Player Props Styles
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
    color: Colors.dark.text, // White for line values
    fontFamily: Fonts.display,
    fontSize: 12,
  },
  propItemOdds: {
    flexDirection: 'row',
    gap: 6,
  },
});
