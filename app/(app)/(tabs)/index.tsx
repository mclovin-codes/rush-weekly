import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Animated, FlatList, ActivityIndicator } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { Baseball, Basketball, Football, Hockey, SoccerBall, XCircle } from "phosphor-react-native";
import BetSlipBottomSheet from '@/app/modal';
import { useLeagues } from '@/hooks/useLeagues';
import { useGames } from '@/hooks/useGames';

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

// Mock data
const mockUser = {
  username: 'Player123',
  units: 980,
  unitsChange: 20,
  rank: 23,
};

const mockLeaderboardPreview = [
  { rank: 1, username: 'ChampionPlayer', units: 2450 },
  { rank: 2, username: 'SecondPlace', units: 2380 },
  { rank: 3, username: 'ThirdPlace', units: 2310 },
];


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

export default function HomeScreen() {
  // Use 'all' as default to show all games
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [betSlipVisible, setBetSlipVisible] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{
    game: any;
    team: 'home' | 'away';
  } | null>(null);

  // Fetch leagues from API
  const { data: leaguesData, isLoading: isLoadingLeagues } = useLeagues({
    active: true,
    depth: 1,
  });

  // Fetch games - show all by default, or filter by selected league
  const { data: gamesData, isLoading: isLoadingGames } = useGames({
    leagueId: selectedLeague === 'all' ? undefined : selectedLeague,
    status: 'scheduled',
    limit: 50, // Increased limit to show more games when showing all
  });

  const handleCloseBetSlip = () => {
    setBetSlipVisible(false);
    setSelectedBet(null);
  };

  return (
    <View style={styles.container}>
      {/* Header with User Info */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>RUSH</Text>
        </View>
        
        <TouchableOpacity style={styles.userInfo}>
          <Text style={styles.username}>{mockUser.username}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.unitsLabel}>Units: </Text>
            <Text style={styles.unitsValue}>{mockUser.units}</Text>
            <Text style={[
              styles.unitsChange,
              { color: mockUser.unitsChange >= 0 ? Colors.dark.success : Colors.dark.danger }
            ]}>
              {mockUser.unitsChange >= 0 ? '↑' : '↓'}{Math.abs(mockUser.unitsChange)}
            </Text>
            <Text style={styles.rankText}>(#{mockUser.rank})</Text>
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
            data={[{ id: 'all', name: 'All', externalId: 'all' }, ...(leaguesData?.docs || [])]}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.leagueFilterContent}
            renderItem={({ item }) => {
              // Handle "All" pill specially
              if (item.id === 'all') {
                return (
                  <TouchableOpacity
                    style={[
                      styles.leaguePill,
                      selectedLeague === 'all' && styles.leaguePillActive,
                    ]}
                    onPress={() => setSelectedLeague('all')}
                  >
                    <View style={styles.leaguePillContent}>
                      <View style={[
                        styles.leagueBadge,
                        selectedLeague === 'all' && styles.leagueBadgeActive
                      ]}>
                        <Text style={[
                          styles.leagueSymbol,
                          selectedLeague === 'all' && styles.leagueSymbolActive
                        ]}>
                          ★
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.leaguePillText,
                          selectedLeague === 'all' && styles.leaguePillTextActive,
                        ]}
                      >
                        All Leagues
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }

              // Regular league pills
              const sportId = getSportIdFromExternalId(item.externalId);
              return (
                <TouchableOpacity
                  style={[
                    styles.leaguePill,
                    selectedLeague === item.id && styles.leaguePillActive,
                  ]}
                  onPress={() => setSelectedLeague(item.id)}
                >
                  <View style={styles.leaguePillContent}>
                    <View style={[
                      styles.leagueBadge,
                      selectedLeague === item.id && styles.leagueBadgeActive
                    ]}>
                      <Text style={[
                        styles.leagueSymbol,
                        selectedLeague === item.id && styles.leagueSymbolActive
                      ]}>
                        {getLeagueSymbol(sportId)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.leaguePillText,
                        selectedLeague === item.id && styles.leaguePillTextActive,
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

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Week Countdown - Pulsing */}
        <View style={styles.countdownSection}>
          <PulsingText style={styles.countdownText}>
            Week 14 ends in 2d 14h 23m
          </PulsingText>
        </View>

        {/* Leaderboard Preview - Simplified */}
        <TouchableOpacity style={styles.leaderboardPreview}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>LEADERBOARD</Text>
            <Text style={styles.viewAllText}>View All</Text>
          </View>

          {mockLeaderboardPreview.map((player) => (
            <View key={player.rank} style={styles.previewRow}>
              <Text style={styles.previewRankText}>#{player.rank}</Text>
              <Text style={styles.previewUsername}>{player.username}</Text>
              <Text style={styles.previewUnits}>{player.units}</Text>
            </View>
          ))}
        </TouchableOpacity>

        {/* Games Section */}
        <View style={styles.gamesSection}>
          {isLoadingGames ? (
            <View style={styles.loadingGamesContainer}>
              <ActivityIndicator size="large" color={Colors.dark.tint} />
              <Text style={styles.loadingText}>Loading games...</Text>
            </View>
          ) : gamesData?.docs && gamesData.docs.length > 0 ? (
            gamesData.docs.map((game) => {
              const homeTeam = typeof game.homeTeam === 'object' ? game.homeTeam : null;
              const awayTeam = typeof game.awayTeam === 'object' ? game.awayTeam : null;
              const gameTime = new Date(game.startTime).toLocaleString('en-US', {
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <View key={game.id} style={styles.gameCard}>
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
                        onPress={() => {
                          setSelectedBet({ game, team: 'away' });
                          setBetSlipVisible(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={styles.betCellHeader}>
                          <Text style={[styles.betCellLabel, styles.underdogLabel]}>
                            AWAY
                          </Text>
                        </View>
                        <Text style={[styles.betCellValue, styles.underdogValue]}>
                          {awayTeam?.name || 'TBD'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.betCell, styles.underdogCell]}
                        onPress={() => {
                          setSelectedBet({ game, team: 'home' });
                          setBetSlipVisible(true);
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={styles.betCellHeader}>
                          <Text style={[styles.betCellLabel, styles.underdogLabel]}>
                            HOME
                          </Text>
                        </View>
                        <Text style={[styles.betCellValue, styles.underdogValue]}>
                          {homeTeam?.name || 'TBD'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyGamesContainer}>
              <Text style={styles.emptyGamesText}>No games available for this league</Text>
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
        userUnits={mockUser.units}
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

  // Week Countdown
  countdownSection: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: Colors.dark.background,
  },
  countdownText: {
    ...Typography.body.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 14,
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
  },
});