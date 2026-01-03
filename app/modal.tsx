import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts } from '@/constants/theme';
import { PopulatedGame, GameOdds, Bet, PlaceBetRequest, MarketGame } from '@/types';
import { gameOddsService } from '@/services/game-odds';
import { betService } from '@/services/bets';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.75;

interface BetSlipBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  game: PopulatedGame | MarketGame | null;
  betType?: 'spread' | 'total' | 'moneyline';
  selectedTeam: 'home' | 'away';
  selection?: 'over' | 'under';
  userUnits: number;
  userId?: string;
  poolId?: string;
  onBetPlaced?: () => void | Promise<void>;
}

// Type guard to check if game is MarketGame
const isMarketGame = (game: PopulatedGame | MarketGame | null): game is MarketGame => {
  return game !== null && typeof game === 'object' && 'eventID' in game;
};

// Helper function to calculate payout from American odds
const calculatePayout = (stake: number, americanOdds: number): number => {
  if (americanOdds > 0) {
    // Underdog: (Stake × Odds) / 100
    return stake + (stake * americanOdds) / 100;
  } else {
    // Favorite: Stake + (Stake / |Odds|) × 100
    return stake + (stake / Math.abs(americanOdds)) * 100;
  }
};

export default function BetSlipBottomSheet({
  visible,
  onClose,
  game,
  betType = 'moneyline',
  selectedTeam,
  selection,
  userUnits,
  userId,
  poolId,
  onBetPlaced,
}: BetSlipBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [betAmount, setBetAmount] = useState('');
  const [gameOdds, setGameOdds] = useState<GameOdds | null>(null);
  const [isLoadingOdds, setIsLoadingOdds] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  // Fetch game odds when modal opens (only for PopulatedGame)
  useEffect(() => {
    if (visible && game) {
      if (isMarketGame(game)) {
        // MarketGame already has odds - no need to fetch
        setIsLoadingOdds(false);
      } else {
        // PopulatedGame needs to fetch odds
        fetchGameOdds();
      }
    }
  }, [visible, game]);

  const fetchGameOdds = async () => {
    if (!game || isMarketGame(game)) return;

    setIsLoadingOdds(true);
    try {
      const odds = await gameOddsService.getActiveOdds(game.id);
      setGameOdds(odds);
    } catch (error) {
      console.error('Error fetching game odds:', error);
      Alert.alert('Error', 'Failed to load betting odds');
    } finally {
      setIsLoadingOdds(false);
    }
  };

  // Get bet details based on bet type
  const getBetDetails = () => {
    if (!game) return { description: '', odds: 0, line: null };

    if (isMarketGame(game)) {
      const spread = game.markets?.spread;
      const total = game.markets?.total;

      switch (betType) {
        case 'spread':
          const spreadSide = selectedTeam === 'home' ? spread?.home : spread?.away;
          return {
            description: `${selectedTeam === 'home' ? game.home_team.abbreviation : game.away_team.abbreviation} ${spreadSide?.point > 0 ? '+' : ''}${spreadSide?.point || '--'}`,
            odds: spreadSide?.payout || 0,
            line: spreadSide?.point || null,
          };
        case 'total':
          const isOver = selection === 'over';
          return {
            description: `${isOver ? 'Over' : 'Under'} ${total?.line || '--'}`,
            odds: isOver ? (total?.over_payout || 0) : (total?.under_payout || 0),
            line: total?.line || null,
          };
        case 'moneyline':
        default:
          const teamObj = selectedTeam === 'home' ? game.home_team : game.away_team;
          return {
            description: teamObj.name,
            odds: teamObj.moneyline || 0,
            line: null,
          };
      }
    } else {
      // PopulatedGame structure
      const selectedTeamObj = selectedTeam === 'home' ? game?.homeTeam : game?.awayTeam;
      const teamName = typeof selectedTeamObj === 'object' ? selectedTeamObj?.name : 'Unknown';

      switch (betType) {
        case 'spread':
          const spreadLine = gameOdds?.spread?.point || 0;
          const spreadPayout = gameOdds?.spread?.[selectedTeam] || 0;
          return {
            description: `${teamName} ${spreadLine > 0 ? '+' : ''}${spreadLine}`,
            odds: spreadPayout,
            line: spreadLine,
          };
        case 'total':
          const totalLine = gameOdds?.total?.point || 0;
          const totalPayout = selection === 'over' ? gameOdds?.total?.overPayout : gameOdds?.total?.underPayout;
          return {
            description: `${selection === 'over' ? 'Over' : 'Under'} ${totalLine}`,
            odds: totalPayout || 0,
            line: totalLine,
          };
        case 'moneyline':
        default:
          return {
            description: teamName,
            odds: gameOdds?.moneyline?.[selectedTeam] || 0,
            line: null,
          };
      }
    }
  };

  const betDetails = getBetDetails();

  // Get bet type label
  const getBetTypeLabel = () => {
    switch (betType) {
      case 'spread':
        return 'Spread';
      case 'total':
        return 'Total';
      case 'moneyline':
      default:
        return 'Moneyline';
    }
  };

  // Calculate potential win and profit
  const betAmountNum = betAmount ? parseFloat(betAmount) : 0;
  const potentialWin = betAmountNum && betDetails.odds ? calculatePayout(betAmountNum, betDetails.odds).toFixed(2) : '0';
  const potentialProfit = betAmountNum && betDetails.odds ? (calculatePayout(betAmountNum, betDetails.odds) - betAmountNum).toFixed(2) : '0';

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      translateY.setValue(SHEET_HEIGHT);
      setBetAmount('');
    }
  }, [visible]);

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleQuickAmount = (amount: number) => {
    setBetAmount(amount.toString());
  };

  const handlePlaceBet = async () => {
    if (!game || !betAmount || betAmountNum <= 0) {
      Alert.alert('Invalid Bet', 'Please enter a valid bet amount');
      return;
    }

    if (betAmountNum > userUnits) {
      Alert.alert('Insufficient Units', `You only have ${userUnits} units available`);
      return;
    }

    // Check odds availability
    if (!betDetails.odds) {
      Alert.alert('No Odds Available', 'Betting odds are not available');
      return;
    }

    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please try logging in again.');
      return;
    }

    if (!poolId) {
      Alert.alert('Error', 'No active pool found. Please join a pool first.');
      return;
    }

    setIsPlacingBet(true);
    try {
      let betData: PlaceBetRequest;

      if (isMarketGame(game)) {
        // MarketGame - use new format
        betData = {
          user: userId,
          pool: poolId,
          eventID: game.eventID,
          leagueID: game.leagueID,
          betType: betType,
          selection: betType === 'total' ? selection! : selectedTeam,
          stake: betAmountNum,
        };
      } else {
        // PopulatedGame - use old format (backward compatible)
        betData = {
          user: userId,
          pool: poolId,
          eventID: game.externalId || game.id,
          leagueID: typeof game.league === 'object' ? game.league.externalId : 'UNKNOWN',
          betType: betType,
          selection: betType === 'total' ? selection! : selectedTeam,
          stake: betAmountNum,
          game: game.id,
          oddsAtPlacement: betDetails.odds,
          lineAtPlacement: betDetails.line || undefined,
        };
      }

      console.log('Placing bet:', betData);
      const response = await betService.placeBet(betData);

      if (!response.success) {
        Alert.alert('Bet Failed', response.error || 'An error occurred, try again');
        return;
      }

      // Call the callback to refresh data
      if (onBetPlaced) {
        await onBetPlaced();
      }

      Alert.alert(
        'Bet Placed!',
        response.message || `${betAmountNum} units on ${betDetails.description}`,
        [
          {
            text: 'OK',
            onPress: () => {
              closeSheet();
            },
          },
        ]
      );
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || 'An error occurred, try again';
      Alert.alert('Bet Failed', errorMsg);
      console.error('Bet error:', error);
    } finally {
      setIsPlacingBet(false);
    }
  };

  if (!game) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={closeSheet}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [{ translateY }],
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            {/* Handle Bar */}
            <View style={styles.handleContainer} {...panResponder.panHandlers}>
              <View style={styles.handle} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Place Bet</Text>
                <TouchableOpacity onPress={closeSheet} activeOpacity={0.7}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Selection Info */}
              <View style={styles.selectionCard}>
                <View style={styles.matchup}>
                  <Text style={styles.matchupLabel}>Match</Text>
                  <Text style={styles.matchupText}>
                    {isMarketGame(game)
                      ? `${game.away_team.abbreviation} @ ${game.home_team.abbreviation}`
                      : `${typeof game.awayTeam === 'object' ? game.awayTeam.name : 'TBD'} @ ${typeof game.homeTeam === 'object' ? game.homeTeam.name : 'TBD'}`
                    }
                  </Text>
                </View>
                <View style={styles.divider} />
                {isLoadingOdds ? (
                  <View style={styles.loadingOdds}>
                    <ActivityIndicator size="small" color={Colors.dark.tint} />
                    <Text style={styles.loadingText}>Loading odds...</Text>
                  </View>
                ) : (
                  <View style={styles.selection}>
                    <View>
                      <Text style={styles.selectionLabel}>Your Pick ({getBetTypeLabel()})</Text>
                      <Text style={styles.selectionTeam}>{betDetails.description}</Text>
                    </View>
                    <View style={styles.oddsContainer}>
                      <Text style={styles.oddsValue}>
                        {betDetails.odds > 0 ? `+${betDetails.odds}` : betDetails.odds}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Bet Amount Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Bet Amount</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={betAmount}
                    onChangeText={setBetAmount}
                    placeholder="0"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                  />
                  <Text style={styles.inputUnit}>units</Text>
                </View>
                <Text style={styles.balanceText}>
                  Available: {userUnits.toLocaleString()} units
                </Text>
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmounts}>
                {[10, 25, 50, 100].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickButton}
                    onPress={() => handleQuickAmount(amount)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickButtonText}>{amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Potential Win */}
              <View style={styles.potentialWinCard}>
                <View style={styles.potentialRow}>
                  <Text style={styles.potentialLabel}>Potential Win</Text>
                  <Text style={styles.potentialValue}>{potentialWin} units</Text>
                </View>
                <View style={styles.potentialRow}>
                  <Text style={styles.potentialLabel}>Profit</Text>
                  <Text style={styles.profitValue}>+{potentialProfit} units</Text>
                </View>
              </View>

              {/* Place Bet Button */}
              <TouchableOpacity
                style={[
                  styles.placeBetButton,
                  (!betAmount || isPlacingBet || isLoadingOdds) && styles.placeBetButtonDisabled,
                ]}
                onPress={handlePlaceBet}
                disabled={!betAmount || parseFloat(betAmount) <= 0 || isPlacingBet || isLoadingOdds}
                activeOpacity={0.7}
              >
                {isPlacingBet ? (
                  <View style={styles.loadingButton}>
                    <ActivityIndicator size="small" color={Colors.dark.background} />
                    <Text style={styles.placeBetButtonText}>Placing Bet...</Text>
                  </View>
                ) : (
                  <Text style={styles.placeBetButtonText}>
                    {betAmount && parseFloat(betAmount) > 0
                      ? `Place Bet - ${betAmount} units`
                      : 'Enter Amount'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  keyboardAvoid: {
    justifyContent: 'flex-end',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.dark.icon,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: Fonts.display,
    color: Colors.dark.text,
  },
  closeButton: {
    fontSize: 28,
    color: Colors.dark.icon,
    fontFamily: Fonts.display,
  },
  selectionCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
  },
  matchup: {
    marginBottom: 12,
  },
  matchupLabel: {
    fontSize: 11,
    fontFamily: Fonts.condensed,
    color: Colors.dark.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  matchupText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.dark.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.icon,
    marginBottom: 12,
  },
  selection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.condensed,
    color: Colors.dark.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  selectionTeam: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.dark.text,
  },
  oddsContainer: {
    backgroundColor: Colors.dark.text,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  oddsValue: {
    fontSize: 20,
    fontFamily: Fonts.display,
    color: Colors.dark.background,
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: Fonts.condensed,
    color: Colors.dark.icon,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.icon,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 32,
    fontFamily: Fonts.display,
    color: Colors.dark.text,
    paddingVertical: 12,
  },
  inputUnit: {
    fontSize: 16,
    fontFamily: Fonts.medium,
    color: Colors.dark.icon,
  },
  balanceText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.dark.icon,
    marginTop: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  quickButton: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.icon,
  },
  quickButtonText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.dark.text,
  },
  potentialWinCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
  },
  potentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  potentialLabel: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.dark.icon,
  },
  potentialValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.dark.text,
  },
  profitValue: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.dark.success,
  },
  placeBetButton: {
    backgroundColor: Colors.dark.text,
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeBetButtonDisabled: {
    backgroundColor: Colors.dark.icon,
  },
  placeBetButtonText: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: Colors.dark.background,
  },
  loadingOdds: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: Colors.dark.icon,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
