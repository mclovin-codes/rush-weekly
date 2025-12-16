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
} from 'react-native';
import { Colors, Fonts } from '@/constants/theme';
import { PopulatedGame, GameOdds, Bet, PlaceBetRequest } from '@/types';
import { gameOddsService } from '@/services/game-odds';
import { betService } from '@/services/bets';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;

interface BetSlipBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  game: PopulatedGame | null;
  selectedTeam: 'home' | 'away';
  userUnits: number;
  userId?: string;
  poolId?: string;
}

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
  selectedTeam,
  userUnits,
  userId,
  poolId,
}: BetSlipBottomSheetProps) {
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const [betAmount, setBetAmount] = useState('');
  const [gameOdds, setGameOdds] = useState<GameOdds | null>(null);
  const [isLoadingOdds, setIsLoadingOdds] = useState(false);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  // Fetch game odds when modal opens
  useEffect(() => {
    if (visible && game) {
      fetchGameOdds();
    }
  }, [visible, game]);

  const fetchGameOdds = async () => {
    if (!game) return;

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

  // Get selected team info
  const selectedTeamObj = selectedTeam === 'home' ? game?.homeTeam : game?.awayTeam;
  const selectedTeamName = typeof selectedTeamObj === 'object' ? selectedTeamObj?.name : 'Unknown';

  // Get moneyline odds for selected team
  const selectedOdds = gameOdds?.moneyline?.[selectedTeam] || 0;

  // Calculate potential win and profit
  const betAmountNum = betAmount ? parseFloat(betAmount) : 0;
  const potentialWin = betAmountNum && selectedOdds ? calculatePayout(betAmountNum, selectedOdds).toFixed(2) : '0';
  const potentialProfit = betAmountNum && selectedOdds ? (calculatePayout(betAmountNum, selectedOdds) - betAmountNum).toFixed(2) : '0';

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

    if (!gameOdds) {
      Alert.alert('No Odds Available', 'Betting odds are not available for this game');
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
      // Construct bet data according to API specification
      const betData: PlaceBetRequest = {
        user: userId,
        pool: poolId,
        game: game.id,
        betType: 'moneyline' as Bet['betType'],
        selection: selectedTeam,
        stake: betAmountNum,
        oddsAtPlacement: selectedOdds,
        status: 'pending' as const,
        payout: 0,
      };

      await betService.placeBet(betData);

      Alert.alert(
        'Bet Placed!',
        `Your bet of ${betAmountNum} units on ${selectedTeamName} has been placed successfully.`,
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
      console.error('Error placing bet:', error);
      Alert.alert(
        'Bet Failed',
        error?.message || 'Failed to place bet. Please try again.',
        [{ text: 'OK' }]
      );
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
              },
            ]}
          >
            {/* Handle Bar */}
            <View style={styles.handleContainer} {...panResponder.panHandlers}>
              <View style={styles.handle} />
            </View>

         
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
                  {typeof game.awayTeam === 'object' ? game.awayTeam.name : 'TBD'} @ {typeof game.homeTeam === 'object' ? game.homeTeam.name : 'TBD'}
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
                    <Text style={styles.selectionLabel}>Your Pick (Moneyline)</Text>
                    <Text style={styles.selectionTeam}>{selectedTeamName}</Text>
                  </View>
                  <View style={styles.oddsContainer}>
                    <Text style={styles.oddsValue}>
                      {selectedOdds > 0 ? `+${selectedOdds}` : selectedOdds}
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
    paddingBottom: 40,
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