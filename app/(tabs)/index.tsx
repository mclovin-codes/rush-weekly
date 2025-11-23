import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';

import { mockGames, mockFilters } from '@/constants/mock-data';
import { Colors } from '@/constants/theme';
import GameCard from '@/components/game-card';

export default function HomeScreen() {
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Mock user data
  const userUnits = 980;
  const weeklyChange = -20;

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
    // Navigate to game detail view (mock for now)
    console.log('Game pressed:', game);
  };

  const handleOddsPress = (team: 'home' | 'away', game: any) => {
    // Open bet slip (mock for now)
    console.log(`Odds pressed for ${team} team:`, game);
  };

  const calculateTimeRemaining = () => {
    // Mock calculation - in real app would calculate from actual end time
    return '2d 14h 23m';
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.branding}>
          <Text style={styles.appName}>RUSH</Text>
          <Text style={styles.weekIndicator}>Week 14 Competition</Text>
        </View>

        <View style={styles.creditsContainer}>
          <Text style={[
            styles.credits,
            { color: weeklyChange >= 0 ? Colors.dark.success : Colors.dark.danger }
          ]}>
            {userUnits.toLocaleString()} units
          </Text>
          <Text style={styles.change}>
            {weeklyChange > 0 ? '+' : ''}{weeklyChange}
          </Text>
        </View>

        <Text style={styles.countdown}>
          Ends in {calculateTimeRemaining()}
        </Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
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

      {/* Game Cards */}
      <ScrollView style={styles.gamesContainer}>
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPress={() => handleGamePress(game)}
            onOddsPress={(team) => handleOddsPress(team, game)}
          />
        ))}
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
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.background,
  },
  branding: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.tint,
    letterSpacing: 2,
  },
  weekIndicator: {
    fontSize: 16,
    color: Colors.dark.icon,
    marginTop: 4,
  },
  creditsContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  credits: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  change: {
    fontSize: 14,
    color: Colors.dark.icon,
    marginTop: 4,
  },
  countdown: {
    fontSize: 16,
    color: Colors.dark.accent,
    textAlign: 'center',
    fontWeight: '500',
  },
  filterContainer: {
    backgroundColor: Colors.dark.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.background,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.dark.background,
  },
  activeFilterTab: {
    backgroundColor: Colors.dark.tint,
  },
  filterText: {
    fontSize: 14,
    color: Colors.dark.icon,
    fontWeight: '500',
  },
  activeFilterText: {
    color: Colors.dark.text,
  },
  gamesContainer: {
    flex: 1,
    marginTop: 8,
  },
});
