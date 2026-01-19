import { Colors, Fonts, Typography } from '@/constants/theme';
import { useMyBets } from '@/hooks/useBets';
import { Bet, PopulatedBet } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowClockwise, Baseball, Basketball, CaretDown, Check, Football, SoccerBall, X } from 'phosphor-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const filterOptions = ['All', 'Open', 'Won', 'Lost'];

export default function MyBetsScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const [expandedParlays, setExpandedParlays] = useState<Set<string>>(new Set());

  // Fetch user's bets from API
  const { data: bets = [], isLoading, error, refetch } = useMyBets();


  // Refetch data when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [])
  );

  // Spin animation for refresh button
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (refreshing) {
      spinAnim.setValue(0);
      animation = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      animation.start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [refreshing]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Filter bets based on selected filter
  const filteredBets = useMemo(() => {
    return bets.filter((bet) => {
      if (selectedFilter === 'All') return true;
      if (selectedFilter === 'Open') return bet.status === 'pending';
      if (selectedFilter === 'Won') return bet.status === 'won';
      if (selectedFilter === 'Lost') return bet.status === 'lost';
      return true;
    });
  }, [bets, selectedFilter]);

  const formatOdds = (odds: number) => {
    return odds > 0 ? `+${odds}` : `${odds}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const getBetDescription = (bet: PopulatedBet) => {
    const game = bet.game;
    const homeTeam = typeof game.homeTeam === 'object' ? game.homeTeam : null;
    const awayTeam = typeof game.awayTeam === 'object' ? game.awayTeam : null;

    switch (bet.betType) {
      case 'parlay':
        return `${bet.parlayData?.legCount || 0} LEG PARLAY`;
      case 'spread':
        const team = bet.selection === 'home'
          ? homeTeam?.abbreviation || 'HOME'
          : awayTeam?.abbreviation || 'AWAY';
        return `${team} ${bet.lineAtPlacement !== undefined && bet.lineAtPlacement > 0 ? '+' : ''}${bet.lineAtPlacement || ''}`;
      case 'total':
        return `${bet.selection === 'over' ? 'Over' : 'Under'} ${bet.lineAtPlacement || ''}`;
      case 'moneyline':
        return bet.selection === 'home'
          ? homeTeam?.abbreviation || 'HOME'
          : awayTeam?.abbreviation || 'AWAY';
      case 'player_prop':
        if (bet.playerPropData) {
          const { playerName, displayName } = bet.playerPropData;
          // Yes/No type bets (like TD props)
          if (bet.selection === 'yes' || bet.selection === 'no') {
            return `${playerName} ${displayName} ${bet.selection.toUpperCase()}`;
          }
          // Over/Under type bets
          const selection = bet.selection === 'over' ? 'Over' : 'Under';
          return `${playerName} ${displayName} ${selection} ${bet.lineAtPlacement || ''}`;
        }
        return 'Player Prop';
      default:
        return '';
    }
  };

  const getStatusColor = (status: Bet['status']) => {
    switch (status) {
      case 'won':
        return Colors.dark.success;
      case 'lost':
        return Colors.dark.danger;
      case 'push':
        return Colors.dark.textSecondary;
      default:
        return Colors.dark.tint;
    }
  };

  const getLeagueIcon = (leagueId: string) => {
    const upperId = leagueId.toUpperCase();
    if (upperId.includes('NFL') || upperId.includes('NCAAF')) return Football;
    if (upperId.includes('NBA') || upperId.includes('NCAAB')) return Basketball;
    if (upperId.includes('MLB')) return Baseball;
    return SoccerBall;
  };

  const getLeagueColor = (leagueId: string) => {
    const upperId = leagueId.toUpperCase();
    if (upperId.includes('NFL')) return '#D43F3D'; // NFL red
    if (upperId.includes('NBA')) return '#E85D04'; // NBA orange
    if (upperId.includes('MLB')) return '#1D4ED8'; // MLB blue
    if (upperId.includes('NHL')) return '#06B6D4'; // NHL cyan
    return Colors.dark.tint;
  };

  const getBetTypeLabel = (betType: string, selection: string, line?: number) => {
    switch (betType) {
      case 'spread':
        const spreadVal = line !== undefined && line > 0 ? `+${line}` : `${line ?? 0}`;
        return `SPREAD ${spreadVal}`;
      case 'total':
        return selection === 'over' ? 'OVER' : 'UNDER';
      case 'moneyline':
        return 'MONEYLINE';
      case 'player_prop':
        return 'PROP';
      default:
        return betType.toUpperCase();
    }
  };

  const getStatusText = (bet: PopulatedBet) => {
    const game = bet.game;

    if (bet.status === 'pending') {
      if (game.status === 'live') return 'Live';
      return 'Open';
    }
    if (bet.status === 'won') return 'Won';
    if (bet.status === 'lost') return 'Lost';
    if (bet.status === 'push') return 'Push';
    return '';
  };

  const toggleParlayExpanded = (betId: string) => {
    setExpandedParlays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(betId)) {
        newSet.delete(betId);
      } else {
        newSet.add(betId);
      }
      return newSet;
    });
  };

  const renderBetCard = ({ item: bet }: { item: PopulatedBet }) => {
    const game = bet.game;
    const homeTeam = typeof game.homeTeam === 'object' ? game.homeTeam : null;
    const awayTeam = typeof game.awayTeam === 'object' ? game.awayTeam : null;
    const isPlayerProp = bet.betType === 'player_prop';
    const isParlay = bet.betType === 'parlay';
    const isExpanded = expandedParlays.has(bet.id);

    // Render parlay bet card
    if (isParlay && bet.parlayData) {
      const LeagueIcon = getLeagueIcon(bet.parlayData.legs[0]?.leagueID || '');
      const leagueColor = getLeagueColor(bet.parlayData.legs[0]?.leagueID || '');
      const isWon = bet.status === 'won';
      const profit = isWon ? bet.payout - bet.stake : 0;

      return (
        <TouchableOpacity
          style={[styles.betCard, styles.parlayCard]}
          onPress={() => toggleParlayExpanded(bet.id)}
          activeOpacity={0.7}
        >
          {/* Parlay Header - Cleaner Design */}
          <View style={styles.parlayHeader}>
            <View style={styles.parlayHeaderLeft}>
              {/* League Icon with parlay badge */}
              {/* <View style={[styles.parlayIconBadge, { backgroundColor: leagueColor + '30' }]}>
                <LeagueIcon size={20} color={leagueColor} weight="fill" />
              </View> */}

              <View style={styles.parlayTitleSection}>
                <Text style={styles.parlayTitle}>{bet.parlayData.legCount} LEG PARLAY</Text>
                <View style={styles.parlayOddsRow}>
                  <Text style={styles.parlayLegCount}>{bet.parlayData.legCount}</Text>
                  <Text style={styles.parlayAt}>@</Text>
                  <Text style={[styles.parlayCombinedOdds, { color: leagueColor }]}>
                    {formatOdds(bet.parlayData.combinedOdds)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Status Badge with Icon */}
            <View style={styles.parlayHeaderRight}>
              {isWon && (
                <View style={styles.parlayWonBadge}>
                  <Check size={16} color={Colors.dark.success} weight="bold" />
                  <Text style={styles.parlayWonText}>WON</Text>
                </View>
              )}
              {!isWon && bet.status !== 'pending' && (
                <View style={[styles.parlayLostBadge]}>
                  <X size={14} color={Colors.dark.danger} weight="bold" />
                  <Text style={[styles.parlayLostText, { color: Colors.dark.danger }]}>{bet.status.toUpperCase()}</Text>
                </View>
              )}
              <View style={[styles.chevron, isExpanded && styles.chevronRotated]}>
                <CaretDown
                  size={18}
                  color={Colors.dark.textSecondary}
                  weight="bold"
                />
              </View>
            </View>
          </View>

          {/* Expanded Legs */}
          {isExpanded && (
            <View style={styles.parlayLegsContainer}>
              {bet.parlayData.legs.map((leg, index) => {
                const LegLeagueIcon = getLeagueIcon(leg.leagueID);
                const legLeagueColor = getLeagueColor(leg.leagueID);
                const legWon = leg.status === 'won';
                const legLost = leg.status === 'lost';

                return (
                  <View key={leg.id} style={styles.parlayLegCard}>
                    {/* Leg Header with League and Status */}
                    <View style={styles.parlayLegTopRow}>
                      <View style={[styles.parlayLegLeagueBadge, { backgroundColor: legLeagueColor + '25' }]}>
                        <LegLeagueIcon size={14} color={legLeagueColor} weight="fill" />
                        <Text style={[styles.parlayLegLeagueText, { color: legLeagueColor }]}>
                          {leg.leagueID}
                        </Text>
                      </View>

                      {/* Leg Status Icon */}
                      <View style={[styles.parlayLegStatusIcon, {
                        backgroundColor: legWon ? Colors.dark.success + '20' :
                                          legLost ? Colors.dark.danger + '20' :
                                          Colors.dark.tint + '20'
                      }]}>
                        {legWon && <Check size={12} color={Colors.dark.success} weight="bold" />}
                        {legLost && <X size={12} color={Colors.dark.danger} weight="bold" />}
                        {!legWon && !legLost && (
                          <View style={styles.parlayPendingDot} />
                        )}
                      </View>
                    </View>

                    {/* Leg Description */}
                    <View style={styles.parlayLegDescriptionSection}>
                      <Text style={styles.parlayLegDescription} numberOfLines={2}>
                        {leg.description}
                      </Text>

                      {/* Bet Type Badge */}
                      <View style={[styles.parlayBetTypeBadge, {
                        borderColor: legLeagueColor + '50',
                        backgroundColor: legLeagueColor + '15'
                      }]}>
                        <Text style={[styles.parlayBetTypeText, { color: legLeagueColor }]}>
                          {getBetTypeLabel(leg.betType, leg.selection, leg.lineAtPlacement)}
                        </Text>
                      </View>
                    </View>

                    {/* Leg Odds */}
                    <View style={styles.parlayLegOddsRow}>
                      <Text style={styles.parlayLegOddsLabel}>ODDS</Text>
                      <Text style={[styles.parlayLegOddsValue, { color: legLeagueColor }]}>
                        {formatOdds(leg.oddsAtPlacement)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Bottom Section - To Win / Stake */}
          <View style={styles.parlayBottomSection}>
            <View style={styles.parlayBottomRow}>
              <View style={styles.parlayStakeSection}>
                <Text style={styles.parlayBottomLabel}>RISKING</Text>
                <Text style={styles.parlayStakeAmount}>{bet.stake.toFixed(2)}</Text>
              </View>

              <View style={styles.parlayDivider} />

              <View style={[styles.parlayWinSection, isWon && styles.parlayWinSectionWon]}>
                <Text style={styles.parlayBottomLabel}>TO WIN</Text>
                <Text style={[styles.parlayWinAmount, isWon && styles.parlayWinAmountWon]}>
                  {isWon ? `+${profit.toFixed(2)}` : profit.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Units label */}
            <Text style={styles.parlayUnitsLabel}>UNITS</Text>
          </View>

          {/* Bet ID */}
          <Text style={styles.betId}>Bet ID: {bet.id}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={[styles.betCard, isPlayerProp && styles.playerPropCard]}>
        {/* Header */}
        <View style={styles.betHeader}>
          <View style={styles.betHeaderLeft}>
            <View style={[styles.betTypeTag, isPlayerProp && styles.playerPropTag]}>
              <Text style={[styles.betTypeText, isPlayerProp && styles.playerPropTagText]}>
                {isPlayerProp ? 'PLAYER PROP' : bet.betType.toUpperCase()}
              </Text>
            </View>
            {!isPlayerProp && (
              <>
                <Text style={styles.betDescription}>{getBetDescription(bet)}</Text>
                <Text style={styles.betOdds}>{formatOdds(bet.oddsAtPlacement)}</Text>
              </>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bet.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(bet.status) }]}>
              {getStatusText(bet)}
            </Text>
          </View>
        </View>

        {/* Player Prop Special Header */}
        {isPlayerProp && bet.playerPropData && (
          <View style={styles.playerPropHeader}>
            <View style={styles.playerInfoSection}>
              <Text style={styles.playerName}>{bet.playerPropData.playerName}</Text>
              <Text style={styles.statDisplayName}>{bet.playerPropData.displayName}</Text>
            </View>
            <View style={styles.propSelectionSection}>
              <Text style={styles.propSelectionText}>
                {bet.selection === 'yes' ? 'YES' : bet.selection === 'no' ? 'NO' : bet.selection === 'over' ? 'OVER' : 'UNDER'}
              </Text>
              {/* Only show line for over/under bets (not yes/no) */}
              {(bet.selection === 'over' || bet.selection === 'under') && (
                <Text style={styles.propLineText}>
                  {bet.lineAtPlacement ?? 0}
                </Text>
              )}
            </View>
            <View style={styles.propOddsSection}>
              <Text style={styles.propOddsText}>{formatOdds(bet.oddsAtPlacement)}</Text>
            </View>
          </View>
        )}

        {/* Game Info */}
        <View style={styles.gameInfo}>
          <Text style={styles.gameDate}>
            {formatDate(game.startTime)} • {formatTime(game.startTime)}
          </Text>
        </View>

        {/* Matchup */}
        <View style={styles.matchup}>
          <View style={styles.teamRow}>
            <Text style={styles.teamAbbr}>{awayTeam?.abbreviation || 'TBD'}</Text>
            <Text style={styles.teamName}>{awayTeam?.name || 'To Be Determined'}</Text>
            {game.awayScore !== undefined && (
              <Text style={styles.score}>{game.awayScore}</Text>
            )}
          </View>
          <View style={styles.teamRow}>
            <Text style={styles.teamAbbr}>{homeTeam?.abbreviation || 'TBD'}</Text>
            <Text style={styles.teamName}>{homeTeam?.name || 'To Be Determined'}</Text>
            {game.homeScore !== undefined && (
              <Text style={styles.score}>{game.homeScore}</Text>
            )}
          </View>
        </View>

        {/* Wager Info */}
        <View style={styles.wagerInfo}>
          <View style={styles.wagerItem}>
            <Text style={styles.wagerLabel}>Stake</Text>
            <Text style={styles.wagerValue}>{bet.stake} units</Text>
          </View>
          {bet.status !== 'pending' && (
            <View style={styles.wagerItem}>
              <Text style={styles.wagerLabel}>
                {bet.status === 'won' ? 'Won' : bet.status === 'lost' ? 'Lost' : 'Push'}
              </Text>
              <Text style={[
                styles.wagerValue,
                bet.status === 'won' ? styles.wonText :
                bet.status === 'lost' ? styles.lostText : styles.pushText
              ]}>
                {bet.status === 'won' ? `+${(bet.payout - bet.stake).toFixed(2)}` :
                 bet.status === 'lost' ? `-${bet.stake}` : '0'} units
              </Text>
            </View>
          )}
        </View>

        {/* Bet ID */}
        <Text style={styles.betId}>Bet ID: {bet.id}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.screenTitle}>MY BETS</Text>
          <TouchableOpacity
            onPress={onRefresh}
            disabled={refreshing}
            style={styles.refreshButton}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <ArrowClockwise
                size={24}
                color="#FFFFFF"
                weight="bold"
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterPill,
                selectedFilter === item && styles.filterPillActive,
              ]}
              onPress={() => setSelectedFilter(item)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedFilter === item && styles.filterPillTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Bets List */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.tint}
            colors={[Colors.dark.tint]}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.dark.tint} />
            <Text style={styles.loadingText}>Loading your bets...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Error loading bets</Text>
            <Text style={styles.emptySubtext}>Please try again later</Text>
          </View>
        ) : filteredBets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No bets found</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'All'
                ? 'Start placing bets to see them here'
                : `No ${selectedFilter.toLowerCase()} bets`}
            </Text>
          </View>
        ) : (
          filteredBets.map((bet) => (
            <View key={bet.id}>
              {renderBetCard({ item: bet })}
            </View>
          ))
        )}

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

  // Header
  header: {
    backgroundColor: Colors.dark.card,
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  screenTitle: {
    ...Typography.title.large,
    color: Colors.dark.text,
    letterSpacing: 3,
    fontFamily: Fonts.display,
  },
  refreshButton: {
    padding: 8,
  },

  // Filter Pills
  filterContainer: {
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingVertical: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.dark.cardElevated,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterPillActive: {
    backgroundColor: Colors.dark.tint + '20',
    borderColor: Colors.dark.tint,
  },
  filterPillText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  filterPillTextActive: {
    color: Colors.dark.tint,
  },

  // Scroll Container
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // Bet Card
  betCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },

  // Bet Header
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  betHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  betTypeTag: {
    backgroundColor: Colors.dark.tint + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  betTypeText: {
    ...Typography.meta.small,
    color: Colors.dark.tint,
    fontSize: 10,
    fontFamily: Fonts.medium,
  },
  betDescription: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
  },
  betOdds: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.mono,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.body.small,
    fontFamily: Fonts.medium,
    fontSize: 11,
  },

  // Game Info
  gameInfo: {
    marginBottom: 12,
  },
  gameDate: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 11,
  },

  // Matchup
  matchup: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  teamAbbr: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    width: 40,
  },
  teamName: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    flex: 1,
  },
  score: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    width: 30,
    textAlign: 'right',
  },

  // Wager Info
  wagerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  wagerItem: {
    flex: 1,
  },
  wagerLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    marginBottom: 2,
  },
  wagerValue: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
  },
  wonText: {
    color: Colors.dark.success,
  },
  lostText: {
    color: Colors.dark.danger,
  },
  pushText: {
    color: Colors.dark.textSecondary,
  },

  // Bet ID
  betId: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 10,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...Typography.body.large,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  emptySubtext: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },

  // Loading State
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    marginTop: 16,
  },

  bottomSpacing: {
    height: 40,
  },

  // Player Prop Card Styles
  playerPropCard: {
    borderWidth: 1.5,
    borderColor: Colors.dark.tint + '30',
    backgroundColor: Colors.dark.card + 'FE',
  },
  playerPropTag: {
    backgroundColor: Colors.dark.tint + '30',
    borderWidth: 1,
    borderColor: Colors.dark.tint + '50',
  },
  playerPropTagText: {
    color: Colors.dark.tint,
    fontSize: 9,
    letterSpacing: 1,
  },
  playerPropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.tint + '10',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.tint + '20',
  },
  playerInfoSection: {
    flex: 1,
  },
  playerName: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
    marginBottom: 2,
  },
  statDisplayName: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  propSelectionSection: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  propSelectionText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 14,
    letterSpacing: 1,
  },
  propLineText: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.mono,
    fontSize: 18,
    marginTop: 2,
  },
  propOddsSection: {
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  propOddsText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.mono,
    fontSize: 14,
  },

  // Parlay Card Styles - Redesigned
  parlayCard: {
    borderWidth: 1,
    borderColor: Colors.dark.border + '80',
    backgroundColor: Colors.dark.card,
    overflow: 'hidden',
  },
  parlayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.dark.cardElevated + '40',
  },
  parlayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  parlayIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  parlayTitleSection: {
    flex: 1,
  },
  parlayTitle: {
    ...Typography.emphasis.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
    letterSpacing: 0.5,
  },
  parlayOddsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  parlayLegCount: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.mono,
    fontSize: 12,
    marginRight: 4,
  },
  parlayAt: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 11,
    marginRight: 4,
  },
  parlayCombinedOdds: {
    ...Typography.emphasis.medium,
    fontFamily: Fonts.mono,
    fontSize: 15,
  },
  parlayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  parlayWonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.success + '25',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  parlayWonText: {
    ...Typography.body.small,
    color: Colors.dark.success,
    fontFamily: Fonts.medium,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  parlayLostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.danger + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 3,
  },
  parlayLostText: {
    ...Typography.body.small,
    fontFamily: Fonts.medium,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  chevron: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  parlayLegsContainer: {
    padding: 12,
    gap: 8,
  },
  parlayLegCard: {
    backgroundColor: Colors.dark.cardElevated + '60',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border + '60',
  },
  parlayLegTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parlayLegLeagueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  parlayLegLeagueText: {
    ...Typography.meta.small,
    fontFamily: Fonts.medium,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  parlayLegStatusIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  parlayPendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.dark.tint,
  },
  parlayLegDescriptionSection: {
    gap: 8,
    marginBottom: 10,
  },
  parlayLegDescription: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  parlayBetTypeBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  parlayBetTypeText: {
    ...Typography.meta.small,
    fontFamily: Fonts.medium,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  parlayLegOddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border + '40',
  },
  parlayLegOddsLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  parlayLegOddsValue: {
    ...Typography.emphasis.medium,
    fontFamily: Fonts.mono,
    fontSize: 14,
  },
  parlayBottomSection: {
    padding: 14,
    backgroundColor: Colors.dark.cardElevated + '40',
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  parlayBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  parlayStakeSection: {
    flex: 1,
  },
  parlayBottomLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  parlayStakeAmount: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 20,
  },
  parlayDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.dark.border + '60',
    marginHorizontal: 16,
  },
  parlayWinSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  parlayWinSectionWon: {
    // Additional styles for won state
  },
  parlayWinAmount: {
    ...Typography.title.large,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.display,
    fontSize: 20,
  },
  parlayWinAmountWon: {
    color: Colors.dark.success,
  },
  parlayUnitsLabel: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 9,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 4,
  },
});