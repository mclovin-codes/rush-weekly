import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";

import { mockGames, mockFilters } from "@/constants/mock-data";
import { Colors, Fonts } from "@/constants/theme";
import GameCard from "@/components/game-card";
import BetSlipBottomSheet from "@/app/modal";

export default function HomeScreen() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [betSlipVisible, setBetSlipVisible] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{
    game: any;
    team: "home" | "away";
  } | null>(null);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });
  const [weeklyChange, setWeeklyChange] = useState(-20);

  // Mock user data
  const userUnits = 980;

  // Mock leaderboard data - just top 3
  const userRank = 47; // User's current position
  const topLeaders = [
    { name: "Alex", units: 2450 },
    { name: "Sarah", units: 1890 },
    { name: "Mike", units: 1420 },
  ];

  // Calculate countdown to Monday 00:00 CET
  const calculateCountdown = () => {
    const now = new Date();

    // Get Monday of next week at 00:00 CET (Central European Time)
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7; // Get days until next Monday (1-7)
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);

    // Convert CET to UTC (CET is UTC+1, but we need to handle daylight saving)
    const cetOffset = 1; // Standard CET offset
    const nextMondayUTC = new Date(
      nextMonday.getTime() - cetOffset * 60 * 60 * 1000
    );

    const difference = nextMondayUTC.getTime() - now.getTime();

    if (difference > 0) {
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }
  };

  // Countdown effect
  useEffect(() => {
    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

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
  }, [pulseAnim]);

  const filteredGames = mockGames.filter((game) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Live Now") return game.isLive;
    if (selectedFilter === "Today") {
      const today = new Date();
      return game.startTime.toDateString() === today.toDateString();
    }
    if (selectedFilter === "Tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return game.startTime.toDateString() === tomorrow.toDateString();
    }
    if (selectedFilter === "Soccer") return game.sport === "Soccer";
    if (selectedFilter === "Basketball") return game.sport === "Basketball";
    if (selectedFilter === "Football") return game.sport === "Football";
    return true;
  });

  const handleGamePress = (game: any) => {
    setSelectedBet({ game, team: "home" }); // Set both game and default team
    setBetSlipVisible(true);
  };

  const handleOddsPress = (team: "home" | "away", game: any) => {
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

        {/* Refined Mini Balance Card */}
        <View style={styles.miniCard}>
          <View style={styles.miniRow}>
            <View style={styles.balanceInfo}>
              <Text style={styles.miniAmount}>{userUnits.toLocaleString()}</Text>
              <Text style={styles.miniLabel}>units</Text>
            </View>
            <View style={styles.miniMetrics}>
              <Text style={[
                styles.miniChange,
                { color: weeklyChange >= 0 ? Colors.dark.success : Colors.dark.danger }
              ]}>
                {weeklyChange > 0 ? "↗" : "↘"} {Math.abs(weeklyChange)}
              </Text>
              <Text style={styles.miniRank}>#{userRank}</Text>
            </View>
          </View>

          {/* Subtle Competition Hint */}
          <View style={styles.subtleCompetition}>
            <Text style={styles.competitionHint}>
              <Text style={styles.leaderName}>{topLeaders[0].name}</Text> leads with {topLeaders[0].units.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.competitionBar}>
          <Animated.View
            style={[
              styles.shimmerOverlay,
              {
                transform: [{ translateX: shimmerTranslate }],
              },
            ]}
          />
          <Text style={styles.competitionLabel}>WEEK ENDS IN:</Text>
          <View style={styles.countdownContainer}>
            <View style={styles.countdownSegment}>
              <Text style={styles.countdownValue}>{countdown.days}</Text>
              <Text style={styles.countdownUnit}>DAYS</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownSegment}>
              <Text style={styles.countdownValue}>
                {countdown.hours.toString().padStart(2, "0")}
              </Text>
              <Text style={styles.countdownUnit}>HRS</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownSegment}>
              <Text style={styles.countdownValue}>
                {countdown.minutes.toString().padStart(2, "0")}
              </Text>
              <Text style={styles.countdownUnit}>MIN</Text>
            </View>
            <Text style={styles.countdownSeparator}>:</Text>
            <View style={styles.countdownSegment}>
              <Text style={styles.countdownValue}>
                {countdown.seconds.toString().padStart(2, "0")}
              </Text>
              <Text style={styles.countdownUnit}>SEC</Text>
            </View>
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
                selectedFilter === filter && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText,
                ]}
              >
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
          selectedTeam={selectedBet?.team || "home"}
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
  miniCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(95, 165, 186, 0.2)',
  },
  miniRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceInfo: {
    flex: 1,
  },
  miniAmount: {
    fontSize: 28,
    fontFamily: Fonts.display,
    color: Colors.dark.text,
    letterSpacing: -1,
  },
  miniLabel: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: Colors.dark.icon,
    marginTop: 2,
  },
  miniMetrics: {
    alignItems: 'flex-end',
    gap: 4,
  },
  miniChange: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  miniRank: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#00d4ff',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  subtleCompetition: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(95, 165, 186, 0.1)',
  },
  competitionHint: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#6a8895',
    lineHeight: 14,
  },
  leaderName: {
    fontFamily: Fonts.medium,
    color: Colors.dark.text,
  },
  competitionBar: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: "#1c3540",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2a4a56",
    overflow: "hidden", // Important for shimmer effect
    position: "relative",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    width: 100,
    transform: [{ skewX: "-20deg" }],
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  competitionLabel: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: "#5fa5ba",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 12,
    textTransform: "uppercase",
    zIndex: 1,
  },
  countdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 1,
  },
  countdownSegment: {
    alignItems: "center",
    minWidth: 48,
  },
  countdownValue: {
    fontSize: 28,
    fontFamily: Fonts.bold,
    color: "#00d4ff",
    lineHeight: 32,
  },
  countdownUnit: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: "#6a8895",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 2,
  },
  countdownSeparator: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: "#4a6a75",
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
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
