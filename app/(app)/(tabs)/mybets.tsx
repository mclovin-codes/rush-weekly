import { Colors, Fonts, Typography } from '@/constants/theme';
import { useMyBets } from '@/hooks/useBets';
import { Bet, PopulatedBet } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowClockwise, CaretDown } from 'phosphor-react-native';
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
  console.log('------->>>', JSON.stringify(bets?.[0]))

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

  const getLegStatusColor = (status: 'pending' | 'won' | 'lost' | 'push') => {
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

  const getLegStatusText = (status: 'pending' | 'won' | 'lost' | 'push') => {
    switch (status) {
      case 'won':
        return 'WON';
      case 'lost':
        return 'LOST';
      case 'push':
        return 'PUSH';
      default:
        return 'PENDING';
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
      // Count leg statuses for summary
      const wonCount = bet.parlayData.legs.filter(l => l.status === 'won').length;
      const lostCount = bet.parlayData.legs.filter(l => l.status === 'lost').length;
      const pendingCount = bet.parlayData.legs.filter(l => l.status === 'pending').length;

      return (
        <TouchableOpacity
          style={[styles.betCard, styles.parlayCard]}
          onPress={() => toggleParlayExpanded(bet.id)}
          activeOpacity={0.7}
        >
          {/* Parlay Header */}
          <View style={styles.parlayMainHeader}>
            <View style={styles.betHeaderLeft}>
              <View style={styles.parlayTypeTag}>
                <Text style={styles.parlayTypeText}>
                  {bet.parlayData.legCount} LEG PARLAY
                </Text>
              </View>
              <Text style={styles.parlayOdds}>{formatOdds(bet.parlayData.combinedOdds)}</Text>
            </View>
            <View style={styles.parlayHeaderRight}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bet.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(bet.status) }]}>
                  {getStatusText(bet)}
                </Text>
              </View>
              <CaretDown
                size={20}
                color={Colors.dark.textSecondary}
                weight="bold"
                style={[styles.chevron, isExpanded && styles.chevronRotated]}
              />
            </View>
          </View>

          {/* Collapsed Summary */}
          {!isExpanded && (
            <View style={styles.parlayCollapsedSummary}>
              <View style={styles.parlayStatusRow}>
                {wonCount > 0 && (
                  <View style={[styles.miniStatusBadge, { backgroundColor: Colors.dark.success + '30' }]}>
                    <Text style={[styles.miniStatusText, { color: Colors.dark.success }]}>{wonCount} Won</Text>
                  </View>
                )}
                {lostCount > 0 && (
                  <View style={[styles.miniStatusBadge, { backgroundColor: Colors.dark.danger + '30' }]}>
                    <Text style={[styles.miniStatusText, { color: Colors.dark.danger }]}>{lostCount} Lost</Text>
                  </View>
                )}
                {pendingCount > 0 && (
                  <View style={[styles.miniStatusBadge, { backgroundColor: Colors.dark.tint + '30' }]}>
                    <Text style={[styles.miniStatusText, { color: Colors.dark.tint }]}>{pendingCount} Pending</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Expanded Legs */}
          {isExpanded && (
            <View style={styles.parlayLegsContainer}>
              {bet.parlayData.legs.map((leg, index) => (
                <View key={leg.id} style={styles.parlayLegCard}>
                  <View style={styles.parlayLegHeader}>
                    <Text style={styles.parlayLegNumber}>LEG {index + 1}</Text>
                    <View style={[styles.parlayLegStatusBadge, { backgroundColor: getLegStatusColor(leg.status) + '20' }]}>
                      <Text style={[styles.parlayLegStatusText, { color: getLegStatusColor(leg.status) }]}>
                        {getLegStatusText(leg.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.parlayLegContent}>
                    <View style={styles.parlayLegInfo}>
                      <Text style={styles.parlayLegDescription}>{leg.description}</Text>
                      <Text style={styles.parlayLegOdds}>{formatOdds(leg.oddsAtPlacement)}</Text>
                    </View>
                    {leg.playerName && (
                      <Text style={styles.parlayLegPlayerName}>{leg.playerName}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Parlay Wager Info */}
          <View style={styles.parlayWagerInfo}>
            <View style={styles.wagerItem}>
              <Text style={styles.wagerLabel}>Total Stake</Text>
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

  // Parlay Card Styles
  parlayCard: {
    borderWidth: 1.5,
    borderColor: Colors.dark.tint + '40',
    backgroundColor: Colors.dark.card + 'FE',
  },
  parlayMainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  parlayTypeTag: {
    backgroundColor: Colors.dark.tint + '25',
    borderWidth: 1,
    borderColor: Colors.dark.tint + '50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  parlayTypeText: {
    ...Typography.meta.small,
    color: Colors.dark.tint,
    fontSize: 10,
    letterSpacing: 1.5,
    fontFamily: Fonts.medium,
    fontWeight: '600',
  },
  parlayOdds: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.mono,
    fontSize: 14,
    marginLeft: 10,
  },
  parlayLegsContainer: {
    marginBottom: 12,
  },
  parlayLegCard: {
    backgroundColor: Colors.dark.cardElevated + '80',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  parlayLegHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  parlayLegNumber: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: Fonts.medium,
  },
  parlayLegStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  parlayLegStatusText: {
    ...Typography.body.small,
    fontFamily: Fonts.medium,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  parlayLegContent: {
    gap: 4,
  },
  parlayLegInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  parlayLegDescription: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
    fontSize: 14,
    flex: 1,
  },
  parlayLegOdds: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.mono,
    fontSize: 13,
    marginLeft: 10,
  },
  parlayLegPlayerName: {
    ...Typography.body.small,
    color: Colors.dark.tint,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  parlayWagerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    marginBottom: 8,
  },
  parlayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chevron: {
    width: 20,
    height: 20,
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  parlayCollapsedSummary: {
    paddingVertical: 8,
  },
  parlayStatusRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  miniStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  miniStatusText: {
    ...Typography.body.small,
    fontSize: 11,
    fontFamily: Fonts.medium,
    fontWeight: '600',
  },
});