import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';

import { mockGames, mockFilters } from '@/constants/mock-data';
import { Colors, Fonts } from '@/constants/theme';
import GameCard from '@/components/game-card';
import BetSlipBottomSheet from '@/app/modal';

export default function HomeScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [betSlipVisible, setBetSlipVisible] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{
    game: any;
    team: 'home' | 'away';
  } | null>(null);

  // Mock user data
  const userUnits = 980;
  const weeklyChange = -20;

  // Pulse animation for live indicator
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const filteredGames = mockGames.filter(game => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Live Now') return game.isLive;
    if (selectedFilter === 'Today') {
      const today = new Date();
      return game.startTime.toDateString() === today.toDateString();
    }
    if (selectedFilter === 'Tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return game.startTime.toDateString() === tomorrow.toDateString();
    }
    if (selectedFilter === 'Soccer') return game.sport === 'Soccer';
    if (selectedFilter === 'Basketball') return game.sport === 'Basketball';
    if (selectedFilter === 'Football') return game.sport === 'Football';
    return true;
  });

  const handleGamePress = (game: any) => {
    setSelectedBet({ game, team: 'home' }); // Set both game and default team
    setBetSlipVisible(true);
  };

  const handleOddsPress = (team: 'home' | 'away', game: any) => {
    setSelectedBet({ game, team });
    setBetSlipVisible(true);
  };

  const handleCloseBetSlip = () => {
    setBetSlipVisible(false);
    setSelectedBet(null);
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* App Name */}
        <Text style={styles.appName}>RUSH</Text>
       
        {/* Units Card */}
        <View style={styles.unitsCard}>
          <View style={styles.unitsRow}>
            <Text style={styles.unitsLabel}>Balance</Text>
            <View style={styles.changeContainer}>
              <Text style={[
                styles.changeText,
                { color: weeklyChange >= 0 ? Colors.dark.success : Colors.dark.danger }
              ]}>
                {weeklyChange > 0 ? '+' : ''}{weeklyChange}
              </Text>
            </View>
          </View>
          <Text style={styles.unitsAmount}>{userUnits.toLocaleString()}</Text>
          <Text style={styles.unitsSubtext}>units</Text>
        </View>

        {/* Competition Info */}
        <View style={styles.competitionBar}>
          <View>
            <Text style={styles.competitionLabel}>Week 14</Text>
            <Text style={styles.competitionTime}>Ends in 2d 14h</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>3 Live</Text>
          </View>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {mockFilters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.activeFilterTab
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Game Cards */}
      <ScrollView 
        style={styles.gamesContainer}
        showsVerticalScrollIndicator={false}
      >
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPress={() => handleGamePress(game)}
            onOddsPress={(team) => handleOddsPress(team, game)}
          />
        ))}
        <View style={styles.bottomPadding} />
        <BetSlipBottomSheet
        visible={betSlipVisible}
        onClose={handleCloseBetSlip}
        game={selectedBet?.game}
        selectedTeam={selectedBet?.team || 'home'}
        userUnits={userUnits}
      />
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
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontFamily: Fonts.display,
    color: Colors.dark.text,
    letterSpacing: 4,
    marginBottom: 24,
    
  },
  unitsCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
  },
  unitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitsLabel: {
    fontSize: 13,
    fontFamily: Fonts.condensed,
    color: Colors.dark.icon,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  changeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.dark.card,
  },
  changeText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
  },
  unitsAmount: {
    fontSize: 44,
    fontFamily: Fonts.display,
    color: Colors.dark.text,
    letterSpacing: -1,
  },
  unitsSubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.dark.icon,
  },
  competitionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
  },
  competitionLabel: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.dark.text,
    marginBottom: 2,
  },
  competitionTime: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: Colors.dark.icon,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.danger,
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: Colors.dark.text,
  },
  filterWrapper: {
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.icon,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
  },
  activeFilterTab: {
    backgroundColor: Colors.dark.text,
    borderColor: Colors.dark.text,
  },
  filterText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.dark.icon,
  },
  activeFilterText: {
    fontFamily: Fonts.medium,
    color: Colors.dark.background,
  },
  gamesContainer: {
    flex: 1,
    paddingTop: 16,
  },
  bottomPadding: {
    height: 20,
  },
});