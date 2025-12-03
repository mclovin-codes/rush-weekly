import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Animated, FlatList } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { Baseball, Basketball, Football, Hockey, SoccerBall, XCircle } from "phosphor-react-native";
import BetSlipBottomSheet from '@/app/modal';

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

const leagues = [
  { sportID: 'BASEBALL', leagueID: 'MLB', enabled: true, name: 'MLB', shortName: 'MLB' },
  { sportID: 'SOCCER', leagueID: 'MLS', enabled: true, name: 'MLS', shortName: 'MLS' },
  { sportID: 'BASKETBALL', leagueID: 'NBA', enabled: true, name: 'NBA', shortName: 'NBA' },
  { sportID: 'BASKETBALL', leagueID: 'NCAAB', enabled: true, name: 'College Basketball', shortName: 'CBB' },
  { sportID: 'FOOTBALL', leagueID: 'NCAAF', enabled: true, name: 'College Football', shortName: 'CFB' },
  { sportID: 'FOOTBALL', leagueID: 'NFL', enabled: true, name: 'NFL', shortName: 'NFL' },
  { sportID: 'HOCKEY', leagueID: 'NHL', enabled: true, name: 'NHL', shortName: 'NHL' },
  { sportID: 'SOCCER', leagueID: 'UEFA_CHAMPIONS_LEAGUE', enabled: true, name: 'Champions League', shortName: 'UCL' },
];

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

const mockGames = [
  {
    id: '1',
    date: 'Tomorrow',
    time: 'Thu 8:15pm',
    awayTeam: 'DET Lions',
    awayTeamAbbr: 'DET',
    homeTeam: 'DAL Cowboys',
    homeTeamAbbr: 'DAL',
    spread: '+3',
    total: '54.5',
    favorite: 'away',
    awayML: '-170',
    homeML: '+142',
  },
  {
    id: '2',
    date: 'Sun 7 Dec',
    time: 'Sun 1:00pm',
    awayTeam: 'TB Buccaneers',
    awayTeamAbbr: 'TB',
    homeTeam: 'NO Saints',
    homeTeamAbbr: 'NO',
    spread: '-8.5',
    total: '42.5',
    favorite: 'away',
    awayML: '-440',
    homeML: '+340',
  },
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
  const [selectedLeague, setSelectedLeague] = useState('NFL');
  const [betSlipVisible, setBetSlipVisible] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{
    game: any;
    team: 'home' | 'away';
  } | null>(null);

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
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={leagues}
          keyExtractor={(item) => item.leagueID}
          contentContainerStyle={styles.leagueFilterContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.leaguePill,
                selectedLeague === item.leagueID && styles.leaguePillActive,
              ]}
              onPress={() => setSelectedLeague(item.leagueID)}
            >
              <View style={styles.leaguePillContent}>
                <View style={[
                  styles.leagueBadge,
                  selectedLeague === item.leagueID && styles.leagueBadgeActive
                ]}>
                  <Text style={[
                    styles.leagueSymbol,
                    selectedLeague === item.leagueID && styles.leagueSymbolActive
                  ]}>
                    {getLeagueSymbol(item.sportID)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.leaguePillText,
                    selectedLeague === item.leagueID && styles.leaguePillTextActive,
                  ]}
                >
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
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
          {mockGames.map((game) => (
            <View key={game.id} style={styles.gameCard}>
              {/* Compact Header with Matchup */}
              <View style={styles.compactHeader}>
                <View style={styles.matchupInfo}>
                  <Text style={styles.teamAbbr}>{game.awayTeamAbbr}</Text>
                  <Text style={styles.vsText}>@</Text>
                  <Text style={styles.teamAbbr}>{game.homeTeamAbbr}</Text>
                </View>
                <View style={styles.gameTimeInfo}>
                  <Text style={styles.gameTime}>{game.time}</Text>
                </View>
              </View>

              {/* Grid Layout for Bets */}
              <View style={styles.betsGrid}>
                {/* First Row: Spread and Total */}
                <View style={styles.betRow}>
                  <TouchableOpacity style={styles.betCell}>
                    <Text style={styles.betCellLabel}>SPREAD</Text>
                    <Text style={styles.betCellValue}>{game.spread}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.betCell}>
                    <Text style={styles.betCellLabel}>TOTAL</Text>
                    <Text style={styles.betCellValue}>{game.total}</Text>
                  </TouchableOpacity>
                </View>

                {/* Second Row: Moneyline with Visual Cues */}
                <View style={styles.betRow}>
                  <TouchableOpacity
                    style={[
                      styles.betCell,
                      game.favorite === 'away' ? styles.favoriteCell : styles.underdogCell
                    ]}
                    onPress={() => {
                      setSelectedBet({ game, team: 'away' });
                      setBetSlipVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.betCellHeader}>
                      <Text style={[
                        styles.betCellLabel,
                        game.favorite === 'away' ? styles.favoriteLabel : styles.underdogLabel
                      ]}>
                        {game.favorite === 'away' ? '★ FAV' : '◆ DOG'}
                      </Text>
                    </View>
                    <Text style={[
                      styles.betCellValue,
                      game.favorite === 'away' ? styles.favoriteValue : styles.underdogValue
                    ]}>
                      {game.awayML}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.betCell,
                      game.favorite === 'home' ? styles.favoriteCell : styles.underdogCell
                    ]}
                    onPress={() => {
                      setSelectedBet({ game, team: 'home' });
                      setBetSlipVisible(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.betCellHeader}>
                      <Text style={[
                        styles.betCellLabel,
                        game.favorite === 'home' ? styles.favoriteLabel : styles.underdogLabel
                      ]}>
                        {game.favorite === 'home' ? '★ FAV' : '◆ DOG'}
                      </Text>
                    </View>
                    <Text style={[
                      styles.betCellValue,
                      game.favorite === 'home' ? styles.favoriteValue : styles.underdogValue
                    ]}>
                      {game.homeML}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
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
});