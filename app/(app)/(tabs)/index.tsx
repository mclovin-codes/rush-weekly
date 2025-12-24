import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Animated, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { Baseball, Basketball, Football, Hockey, SoccerBall, XCircle, ArrowsClockwise, Wrench, PlusIcon } from "phosphor-react-native";

import BetSlipBottomSheet from '@/app/modal';
import DevToolsModal from '@/components/DevToolsModal';
import { useLeagues } from '@/hooks/useLeagues';
import { useMarketGames } from '@/hooks/useMarketGames';
import { useCurrentUser } from '@/hooks/useUser';
import { useMyPool, useActivePool, useLeaderboard } from '@/hooks/usePools';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'expo-router';
import MarketGameCard from '@/components/MarketGameCard';

// League data with text-based icon representations
const getLeagueSymbol = (sportID: string) => {
  switch (sportID) {
    case "BASEBALL": return <Baseball size={22} weight="duotone" />;
    case "BASKETBALL": return <Basketball size={22} weight="duotone" />;
    case "FOOTBALL": return <Football size={22} weight="duotone" />;
    case "HOCKEY": return <Hockey size={22} weight="duotone" />;
    case "SOCCER": return <SoccerBall size={22} weight="duotone" />;
    default: return <XCircle size={22} weight="duotone" />;
  }
};

// Sport ID mapping based on externalId
const getSportIdFromExternalId = (externalId: string): string => {
  if (externalId.toLowerCase().includes('nfl') || externalId.toLowerCase().includes('ncaaf')) return 'FOOTBALL';
  if (externalId.toLowerCase().includes('nba') || externalId.toLowerCase().includes('ncaab')) return 'BASKETBALL';
  if (externalId.toLowerCase().includes('mlb')) return 'BASEBALL';
  if (externalId.toLowerCase().includes('nhl')) return 'HOCKEY';
  if (externalId.toLowerCase().includes('mls') || externalId.toLowerCase().includes('uefa') || externalId.toLowerCase().includes('soccer')) return 'SOCCER';
  return 'FOOTBALL';
};

// Pulsing glow animation component
function PulsingText({ children, style }: { children: React.ReactNode; style?: any }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        shadowColor: Colors.dark.tint,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: pulseAnim.interpolate({
          inputRange: [1, 1.3],
          outputRange: [0.3, 0.8],
        }),
        shadowRadius: pulseAnim.interpolate({
          inputRange: [1, 1.3],
          outputRange: [8, 20],
        }),
        elevation: 10,
      }}
    >
      <Animated.Text
        style={[
          style,
          {
            opacity: opacityAnim,
          },
        ]}
      >
        {children}
      </Animated.Text>
    </Animated.View>
  );
}

// Pulsing skeleton component
function PulsingSkeleton({ style }: { style?: any }) {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          backgroundColor: Colors.dark.border,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
}

export default function HomeScreen() {
  const router = useRouter();

  // Default will be set to NFL (or first available league)
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [betSlipVisible, setBetSlipVisible] = useState(false);
  const [devToolsVisible, setDevToolsVisible] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{
    game: any;
    team: 'home' | 'away';
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadingGames, setReloadingGames] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Fetch user and pool data
  const { data: session } = authClient.useSession();
  const { data: currentUser, refetch: refetchUser } = useCurrentUser();
  const { data: activePool, refetch: refetchPool } = useActivePool();
  const { data: myPool, refetch: refetchMyPool } = useMyPool();
  const { data: leaderboardData, refetch: refetchLeaderboard } = useLeaderboard(activePool?.id, { limit: 100 });


  // Fetch leagues from API
  const { data: leaguesData, isLoading: isLoadingLeagues, refetch: refetchLeagues } = useLeagues({
    active: true,
    depth: 1,
  });

  // Set default league to NFL (or first available) when leagues load
  useEffect(() => {
    if (leaguesData?.docs && leaguesData.docs.length > 0 && !selectedLeague) {
      // Try to find NFL first
      const nflLeague = leaguesData.docs.find(league =>
        league.externalId?.toLowerCase().includes('nfl')
      );

      // Use NFL if found, otherwise use first league
      const defaultLeague = nflLeague || leaguesData.docs[0];
      setSelectedLeague(defaultLeague.externalId);
    }
  }, [leaguesData, selectedLeague]);

  // Fetch games with odds from market API - OPTIMIZED: Single API call for selected league only
  const { data: marketGames, isLoading: isLoadingGames, refetch: refetchGames } = useMarketGames({
    leagueID: selectedLeague || 'NFL', // Fallback to NFL if no league selected yet
    status: 'scheduled',
    oddsAvailable: true,
    limit: 50,
  });


  // Calculate ranks on the frontend based on score (descending)
  const leaderboard = useMemo(() => {
    const memberships = leaderboardData?.docs || [];
    // Sort by score descending (highest first) and add rank
    return memberships
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1, // Rank 1 = highest score
      }));
  }, [leaderboardData]);

  const currentUserEntry = leaderboard.find((entry) => {
    const user = typeof entry.user === 'object' ? entry.user : null;
    return user?.id === session?.user?.id;
  });
  const currentUserRank = currentUserEntry?.rank || 0;

  // Get previous score to calculate change (for now, just use 0 as we don't have historical data)
  const unitsChange = 0; // TODO: Calculate from historical data when available

  // Get top 3 for leaderboard preview
  const leaderboardPreview = leaderboard.slice(0, 3);

  // Calculate time remaining in the week
  const getTimeRemaining = () => {
    if (!activePool?.weekEnd) return null;
    const now = new Date();
    const end = new Date(activePool.weekEnd);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  // Get week number from pool
  const getWeekNumber = () => {
    if (!activePool?.weekStart) return 0;
    // Calculate week number from the start of the year
    const start = new Date(activePool.weekStart);
    const yearStart = new Date(start.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((start.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return weekNumber;
  };

  // Get member count from leaderboard
  const getMemberCount = () => {
    return leaderboard.length || 0;
  };

  // Check if week is in progress (more than 1 day has passed)
  const isWeekInProgress = () => {
    if (!activePool?.weekStart) return false;
    const now = new Date();
    const start = new Date(activePool.weekStart);
    const daysPassed = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return daysPassed >= 1;
  };

  // Calculate days remaining in the week
  const getDaysRemaining = () => {
    const time = getTimeRemaining();
    if (!time) return 0;
    return time.days;
  };

  const handleCloseBetSlip = () => {
    setBetSlipVisible(false);
    setSelectedBet(null);
  };

  const handlePoolCreated = async () => {
    // Refresh all data including user credits
    await Promise.all([
      refetchUser(),
      refetchPool(),
      refetchMyPool(),
      refetchLeaderboard(),
    ]);
  };

  const handleBetPlaced = async () => {
    // Refresh user credits, pool membership, and games data after bet placement
    await Promise.all([
      refetchUser(),
      refetchMyPool(),
      refetchGames(),
      refetchLeaderboard(),
    ]);
  };

  const handleReloadGames = async () => {
    setReloadingGames(true);
    try {
      await refetchGames();
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error reloading games:', error);
    } finally {
      setReloadingGames(false);
    }
  };

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
      // Stop the animation and reset
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [refreshing, spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchUser(),
        refetchPool(),
        refetchMyPool(),
        refetchLeaderboard(),
        refetchLeagues(),
        refetchGames(),
        new Promise(resolve => setTimeout(resolve, 1000)), // Minimum delay for UX
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

console.log('------->>>>> Market Games:', marketGames?.[0])

  return (
    <View style={styles.container}>
      {/* Header with User Info */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>RUSH</Text>
          
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <ArrowsClockwise
              size={22}
              weight="bold"
              color={refreshing ? Colors.dark.tint : Colors.dark.textSecondary}
            />
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => router.push('/(app)/(tabs)/profile')}
        >
          <Text style={styles.username}>
            {currentUser?.username || session?.user?.name || 'Player'}
          </Text>
          <View style={styles.statsRow}>
            <Text style={styles.unitsLabel}>Credits: </Text>
            <Text style={styles.unitsValue}>
              {currentUser?.current_credits || currentUser?.credits || 0}
            </Text>
            {unitsChange !== 0 && (
              <Text style={[
                styles.unitsChange,
                { color: unitsChange >= 0 ? Colors.dark.success : Colors.dark.danger }
              ]}>
                {unitsChange >= 0 ? '↑' : '↓'}{Math.abs(unitsChange)}
              </Text>
            )}
            {currentUserRank > 0 && (
              <Text style={styles.rankText}>(#{currentUserRank})</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* League Filter Pills */}
      <View style={styles.leagueFilterContainer}>
        {isLoadingLeagues ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.dark.tint} />
          </View>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={leaguesData?.docs || []}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.leagueFilterContent}
            renderItem={({ item }) => {
              const sportId = getSportIdFromExternalId(item.externalId);
              const leagueID = item.externalId; // Use externalId for market API
              return (
                <TouchableOpacity
                  style={[
                    styles.leaguePill,
                    selectedLeague === leagueID && styles.leaguePillActive,
                  ]}
                  onPress={() => setSelectedLeague(leagueID)}
                >
                  <View style={styles.leaguePillContent}>
                    <View style={[
                      styles.leagueBadge,
                      selectedLeague === leagueID && styles.leagueBadgeActive
                    ]}>
                      <Text style={[
                        styles.leagueSymbol,
                        selectedLeague === leagueID && styles.leagueSymbolActive
                      ]}>
                        {getLeagueSymbol(sportId)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.leaguePillText,
                        selectedLeague === leagueID && styles.leaguePillTextActive,
                      ]}
                    >
                      {item.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Week Countdown - Redesigned */}
        <View style={styles.countdownSection}>
          {activePool ? (
            // Active Pool State
            <>
              <View style={styles.countdownRow}>
                <PulsingText style={styles.countdownMainText}>
                  WEEK {getWeekNumber()} ENDS IN{' '}
                  {(() => {
                    const time = getTimeRemaining();
                    if (!time) return 'SOON';
                    return `${time.days}D ${time.hours}H ${time.minutes}M`;
                  })()}
                </PulsingText>
                {isWeekInProgress() && getDaysRemaining() < 6 && (
                  <View style={styles.inProgressBadge}>
                    <Text style={styles.inProgressText}>IN PROGRESS</Text>
                  </View>
                )}
              </View>
              <View style={styles.poolInfoRow}>
                <Text style={styles.poolInfoText}>
                  Pool #{activePool.id?.slice(-4) || 'N/A'}
                </Text>
                <Text style={styles.poolInfoDot}>•</Text>
                <Text style={styles.poolInfoText}>
                  {getMemberCount()} {getMemberCount() === 1 ? 'Member' : 'Members'}
                </Text>
              </View>
            </>
          ) : (
            // No Active Pool State
            <>
              <View style={styles.noPoolHeader}>
                <Text style={styles.noPoolIcon}>⚠️</Text>
                <Text style={styles.noPoolTitle}>NO ACTIVE POOL</Text>
              </View>
              <Text style={styles.nextPoolText}>
                Create or join a pool to start betting
              </Text>
              <TouchableOpacity
                style={styles.joinPoolButton}
                onPress={() => setDevToolsVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.joinPoolButtonText}>
                  Create Pool →
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Leaderboard Preview - Simplified */}
        <TouchableOpacity
          style={styles.leaderboardPreview}
          onPress={() => router.push('/(app)/(tabs)/leaderboard')}
        >
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>LEADERBOARD</Text>
            <Text style={styles.viewAllText}>View All</Text>
          </View>

          {refreshing ? (
            // Skeleton loader for leaderboard
            <>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.previewRow}>
                  <PulsingSkeleton style={[styles.skeleton, styles.skeletonRank]} />
                  <PulsingSkeleton style={[styles.skeleton, styles.skeletonUsername]} />
                  <PulsingSkeleton style={[styles.skeleton, styles.skeletonScore]} />
                </View>
              ))}
            </>
          ) : leaderboardPreview.length > 0 ? (
            leaderboardPreview.map((entry) => {
              const user = typeof entry.user === 'object' ? entry.user : null;
              return (
                <View key={entry.rank} style={styles.previewRow}>
                  <Text style={styles.previewRankText}>#{entry.rank}</Text>
                  <Text style={styles.previewUsername}>
                    {user?.username || 'Unknown'}
                  </Text>
                  <Text style={styles.previewUnits}>{entry.score.toFixed(0)}</Text>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyLeaderboard}>
              <Text style={styles.emptyLeaderboardText}>No rankings yet</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Games Section */}
        <View style={styles.gamesSection}>
          {refreshing || isLoadingGames ? (
            refreshing ? (
              // Skeleton loader for games
              <>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.gameCardSkeleton}>
                    <View style={styles.skeletonHeader}>
                      <PulsingSkeleton style={[styles.skeleton, styles.skeletonMatchup]} />
                      <PulsingSkeleton style={[styles.skeleton, styles.skeletonTime]} />
                    </View>
                    <View style={styles.skeletonBetsGrid}>
                      <View style={styles.skeletonBetRow}>
                        <PulsingSkeleton style={[styles.skeleton, styles.skeletonBet]} />
                        <PulsingSkeleton style={[styles.skeleton, styles.skeletonBet]} />
                      </View>
                      <View style={styles.skeletonBetRow}>
                        <PulsingSkeleton style={[styles.skeleton, styles.skeletonBet]} />
                        <PulsingSkeleton style={[styles.skeleton, styles.skeletonBet]} />
                      </View>
                    </View>
                  </View>
                ))}
              </>
            ) : (
              <View style={styles.loadingGamesContainer}>
                <ActivityIndicator size="large" color={Colors.dark.tint} />
                <Text style={styles.loadingText}>Loading games...</Text>
              </View>
            )
          ) : marketGames && marketGames.length > 0 ? (
            marketGames.map((game) => (
              <MarketGameCard
                key={game.eventID}
                game={game}
                onSelectBet={(selectedGame, team) => {
                  setSelectedBet({ game: selectedGame, team });
                  setBetSlipVisible(true);
                }}
                onPress={(eventID) => {
                  router.push(`/(app)/game/${eventID}`);
                }}
              />
            ))
          ) : (
            <View style={styles.emptyGamesContainer}>
              <Text style={styles.emptyGamesText}>No games available for this league</Text>
              <TouchableOpacity
                style={styles.reloadButton}
                onPress={handleReloadGames}
                activeOpacity={0.7}
                disabled={reloadingGames}
              >
                {reloadingGames ? (
                  <>
                    <ActivityIndicator size="small" color={Colors.dark.tint} />
                    <Text style={styles.reloadButtonText}>Reloading...</Text>
                  </>
                ) : (
                  <>
                    <ArrowsClockwise size={16} weight="bold" color={Colors.dark.tint} />
                    <Text style={styles.reloadButtonText}>Reload Games</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bet Slip Bottom Sheet */}
      <BetSlipBottomSheet
        visible={betSlipVisible}
        onClose={handleCloseBetSlip}
        game={selectedBet?.game}
        selectedTeam={selectedBet?.team || 'home'}
        userUnits={currentUser?.current_credits || currentUser?.credits || 0}
        userId={session?.user?.id}
        poolId={typeof myPool?.pool === 'object' ? myPool.pool.id : myPool?.pool}
        onBetPlaced={handleBetPlaced}
      />

      {/* Dev Tools Modal */}
      <DevToolsModal
        visible={devToolsVisible}
        onClose={() => setDevToolsVisible(false)}
        userId={session?.user?.id}
        onPoolCreated={handlePoolCreated}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    letterSpacing: 2,
  },
  devToolsButton: {
    marginLeft: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.tint + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.tint,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.cardElevated,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
    marginRight: 12,
  },
  userInfo: {
    alignItems: 'flex-end',
  },
  username: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitsLabel: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
  },
  unitsValue: {
    ...Typography.body.small,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
  },
  unitsChange: {
    ...Typography.body.small,
    fontFamily: Fonts.medium,
    marginLeft: 4,
  },
  rankText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    marginLeft: 4,
  },

  // League Filter Pills
  leagueFilterContainer: {
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingVertical: 10,
  },
  leagueFilterContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  leaguePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.dark.cardElevated,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  leaguePillActive: {
    backgroundColor: Colors.dark.tint + '15',
    borderColor: Colors.dark.tint,
    borderWidth: 1.5,
  },
  leaguePillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leagueBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leagueBadgeActive: {
    backgroundColor: Colors.dark.tint,
  },
  leagueSymbol: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.medium,
  },
  leagueSymbolActive: {
    color: Colors.dark.text,
  },
  leaguePillText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  leaguePillTextActive: {
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
  },

  scrollContainer: {
    flex: 1,
  },

  // Week Countdown - Redesigned
  countdownSection: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    alignItems: 'center',
  },
  countdownRow: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 6,
  },
  countdownMainText: {
    ...Typography.body.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 15,
    letterSpacing: 1,
    textAlign: 'center',
  },
  inProgressBadge: {
    backgroundColor: Colors.dark.tint + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.dark.tint + '40',
  },
  inProgressText: {
    ...Typography.meta.small,
    color: Colors.dark.tint,
    fontFamily: Fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  poolInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  poolInfoText: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
  poolInfoDot: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 11,
  },
  // No Active Pool State
  noPoolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noPoolIcon: {
    fontSize: 18,
  },
  noPoolTitle: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.display,
    fontSize: 14,
    letterSpacing: 1,
  },
  nextPoolText: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  joinPoolButton: {
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  joinPoolButtonText: {
    ...Typography.body.small,
    color: Colors.dark.background,
    fontFamily: Fonts.bold,
    fontSize: 13,
    letterSpacing: 0.5,
  },

  // Leaderboard Preview - Simplified
  leaderboardPreview: {
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginTop: 11
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewTitle: {
    ...Typography.sectionHeader.small,
    color: Colors.dark.text,
    letterSpacing: 1.5,
    fontSize: 11,
  },
  viewAllText: {
    ...Typography.body.small,
    color: Colors.dark.tint,
    fontSize: 11,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  previewRankText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.medium,
    width: 28,
    fontSize: 11,
  },
  previewUsername: {
    ...Typography.body.small,
    color: Colors.dark.text,
    flex: 1,
    fontSize: 12,
  },
  previewUnits: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  emptyLeaderboard: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyLeaderboardText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 11,
  },

  // Games Section - Compact Grid Design
  gamesSection: {
    paddingHorizontal: 16,
  },
  gameCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },

  // Compact Header
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

  // Grid Layout for Bets
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
  
  // Favorite/Underdog Visual Cues
  favoriteCell: {
    backgroundColor: Colors.dark.tint + '15',
    borderColor: Colors.dark.tint + '40',
    borderWidth: 1.5,
  },
  underdogCell: {
    backgroundColor: Colors.dark.cardElevated,
    borderColor: Colors.dark.border,
  },
  favoriteLabel: {
    color: Colors.dark.tint,
    fontFamily: Fonts.medium,
  },
  underdogLabel: {
    color: Colors.dark.textSecondary,
  },
  favoriteValue: {
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
  },
  underdogValue: {
    color: Colors.dark.text,
  },

  bottomSpacing: {
    height: 80,
  },

  // Loading States
  loadingContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingGamesContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    marginTop: 12,
  },
  emptyGamesContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyGamesText: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.dark.tint + '15',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.dark.tint,
  },
  reloadButtonText: {
    ...Typography.body.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.medium,
    fontSize: 13,
  },

  // Skeleton Loaders
  skeleton: {
    backgroundColor: Colors.dark.border,
    borderRadius: 4,
  },
  skeletonRank: {
    width: 28,
    height: 12,
  },
  skeletonUsername: {
    flex: 1,
    height: 12,
    marginHorizontal: 8,
  },
  skeletonScore: {
    width: 40,
    height: 12,
  },
  gameCardSkeleton: {
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  skeletonMatchup: {
    width: 120,
    height: 14,
  },
  skeletonTime: {
    width: 80,
    height: 12,
  },
  skeletonBetsGrid: {
    gap: 6,
  },
  skeletonBetRow: {
    flexDirection: 'row',
    gap: 6,
  },
  skeletonBet: {
    flex: 1,
    height: 50,
    borderRadius: 6,
  },
});