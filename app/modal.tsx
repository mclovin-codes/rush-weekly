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
import { Colors, Fonts, Typography } from '@/constants/theme';
import { betService } from '@/services/bets';
import { useBetSlip } from '@/providers/BetSlipProvider';
import { Ionicons } from '@expo/vector-icons';
import { PlaceBetRequest } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

interface BetSlipBottomSheetProps {
  userUnits: number;
  userId?: string;
  poolId?: string;
  onBetPlaced?: () => void | Promise<void>;
}

// Helper function to calculate payout from American odds
const calculatePayout = (stake: number, americanOdds: number): number => {
  if (americanOdds > 0) {
    return stake + (stake * americanOdds) / 100;
  } else {
    return stake + (stake / Math.abs(americanOdds)) * 100;
  }
};

export default function BetSlipBottomSheet({
  userUnits,
  userId,
  poolId,
  onBetPlaced,
}: BetSlipBottomSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const {
    selections,
    stakePerBet,
    isVisible,
    removeSelection,
    clearSelections,
    setStakePerBet,
    closeBetSlip,
  } = useBetSlip();

  const [isPlacingBets, setIsPlacingBets] = useState(false);

  // Calculate totals for straight bets
  const totalStake = stakePerBet * selections.length;
  const potentialWinnings = selections.reduce((total, selection) => {
    return total + calculatePayout(stakePerBet, selection.odds);
  }, 0);
  const totalProfit = potentialWinnings - totalStake;

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
    if (isVisible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      translateY.setValue(SHEET_HEIGHT);
    }
  }, [isVisible]);

  const closeSheet = () => {
    Animated.timing(translateY, {
      toValue: SHEET_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      closeBetSlip();
    });
  };

  const handleQuickAmount = (amount: number) => {
    setStakePerBet(amount);
  };

  const handlePlaceBets = async () => {
    if (selections.length === 0) {
      Alert.alert('No Selections', 'Please add bets to your slip');
      return;
    }

    if (stakePerBet <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid bet amount');
      return;
    }

    if (totalStake > userUnits) {
      Alert.alert(
        'Insufficient Credits',
        `You need ${totalStake.toFixed(2)} credits but only have ${userUnits.toFixed(2)} available`
      );
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

    setIsPlacingBets(true);
    const successfulBets: string[] = [];
    const failedBets: string[] = [];

    try {
      // Place each bet individually (backend doesn't support batch placing)
      for (const selection of selections) {
        try {
          const betData: PlaceBetRequest = {
            user: userId,
            pool: poolId,
            eventID: selection.eventID,
            leagueID: selection.leagueID,
            betType: selection.betType,
            selection: selection.selection,
            stake: stakePerBet,
            // Add player prop specific fields if this is a player prop bet
            ...(selection.betType === 'player_prop' && selection.playerPropData ? {
              playerId: selection.playerPropData.playerId,
              playerName: selection.playerPropData.playerName,
              statType: selection.playerPropData.statType,
              displayName: selection.playerPropData.displayName,
              category: selection.playerPropData.category,
            } : {}),
          };

          // Log bet data for debugging
          if (selection.betType === 'player_prop') {
            console.log('[Player Prop Bet] Placing bet:', JSON.stringify(betData, null, 2));
          }

          const response = await betService.placeBet(betData);

          if (response.success) {
            console.log(`[Bet Success] ${selection.betType === 'player_prop' ? 'Player Prop' : 'Game'} bet placed:`, selection.teamName);
            successfulBets.push(selection.teamName);
          } else {
            console.error(`[Bet Failed] Response indicates failure for ${selection.teamName}:`, response.error || 'Unknown error');
            failedBets.push(selection.teamName);
          }
        } catch (error) {
          console.error(`[Bet Error] Failed to place bet on ${selection.teamName}:`, error);
          console.error('[Bet Error] Selection data:', JSON.stringify(selection, null, 2));
          if (error instanceof Error) {
            console.error('[Bet Error] Error message:', error.message);
            console.error('[Bet Error] Error stack:', error.stack);
          }
          failedBets.push(selection.teamName);
        }
      }

      // Show results
      if (successfulBets.length > 0 && failedBets.length === 0) {
        // All bets succeeded
        Alert.alert(
          'Bets Placed Successfully!',
          `${successfulBets.length} bet${successfulBets.length > 1 ? 's' : ''} placed for ${totalStake.toFixed(2)} credits`,
          [
            {
              text: 'OK',
              onPress: () => {
                clearSelections();
                closeSheet();
                if (onBetPlaced) {
                  onBetPlaced();
                }
              },
            },
          ]
        );
      } else if (successfulBets.length > 0 && failedBets.length > 0) {
        // Some bets succeeded, some failed
        Alert.alert(
          'Partial Success',
          `${successfulBets.length} bet(s) placed successfully.\n${failedBets.length} bet(s) failed.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Remove successful bets from slip
                successfulBets.forEach(betName => {
                  const selection = selections.find(s => s.teamName === betName);
                  if (selection) {
                    removeSelection(selection.id);
                  }
                });
                if (onBetPlaced) {
                  onBetPlaced();
                }
              },
            },
          ]
        );
      } else {
        // All bets failed
        Alert.alert('Error', 'All bets failed to place. Please try again.');
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || 'An error occurred';
      Alert.alert('Error', errorMsg);
    } finally {
      setIsPlacingBets(false);
    }
  };

  return (
    <Modal
      visible={isVisible}
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

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Bet Slip</Text>
              <View style={styles.headerRight}>
                {selections.length > 0 && (
                  <TouchableOpacity
                    onPress={clearSelections}
                    style={styles.clearButton}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.clearButtonText}>Clear All</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={closeSheet} activeOpacity={0.7}>
                  <Ionicons name="close" size={28} color={Colors.dark.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {selections.length === 0 ? (
              /* Empty State */
              <View style={styles.emptyState}>
                <Ionicons name="ticket-outline" size={64} color={Colors.dark.border} />
                <Text style={styles.emptyTitle}>Your bet slip is empty</Text>
                <Text style={styles.emptySubtitle}>
                  Tap on odds to add bets to your slip
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {/* Selections List */}
                <View style={styles.selectionsSection}>
                  <Text style={styles.sectionTitle}>
                    YOUR PICKS ({selections.length})
                  </Text>
                  {selections.map((selection) => (
                    <View key={selection.id} style={styles.selectionCard}>
                      <View style={styles.selectionHeader}>
                        <View style={styles.selectionInfo}>
                          <Text style={styles.matchupText}>{selection.matchup}</Text>
                          <Text style={styles.betTypeText}>{selection.betTypeLabel}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeSelection(selection.id)}
                          style={styles.removeButton}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="close-circle" size={24} color={Colors.dark.danger} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.selectionDetails}>
                        <Text style={styles.teamName}>{selection.teamName}</Text>
                        <View style={styles.oddsChip}>
                          <Text style={styles.oddsText}>
                            {selection.odds > 0 ? `+${selection.odds}` : selection.odds}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Bet Amount Section */}
                <View style={styles.betAmountSection}>
                  <Text style={styles.sectionTitle}>BET AMOUNT (PER BET)</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      value={stakePerBet.toString()}
                      onChangeText={(val) => setStakePerBet(Number(val) || 0)}
                      placeholder="0"
                      placeholderTextColor={Colors.dark.border}
                      keyboardType="numeric"
                    />
                    <Text style={styles.inputUnit}>credits</Text>
                  </View>
                  <Text style={styles.balanceText}>
                    Available: {userUnits.toFixed(2)} credits
                  </Text>

                  {/* Quick Amount Buttons */}
                  <View style={styles.quickAmounts}>
                    {[10, 25, 50, 100].map((amount) => (
                      <TouchableOpacity
                        key={amount}
                        style={[
                          styles.quickButton,
                          stakePerBet === amount && styles.quickButtonActive,
                        ]}
                        onPress={() => handleQuickAmount(amount)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.quickButtonText,
                            stakePerBet === amount && styles.quickButtonTextActive,
                          ]}
                        >
                          {amount}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Stake</Text>
                    <Text style={styles.summaryValue}>
                      {stakePerBet} × {selections.length} = {totalStake.toFixed(2)} credits
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Potential Win</Text>
                    <Text style={styles.potentialWinValue}>
                      {potentialWinnings.toFixed(2)} credits
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.profitLabel}>Total Profit</Text>
                    <Text style={[
                      styles.profitValue,
                      { color: totalProfit > 0 ? Colors.dark.success : Colors.dark.textSecondary }
                    ]}>
                      {totalProfit > 0 ? '+' : ''}{totalProfit.toFixed(2)} credits
                    </Text>
                  </View>
                </View>

                {/* Place Bet Button */}
                <TouchableOpacity
                  style={[
                    styles.placeBetButton,
                    (isPlacingBets || stakePerBet <= 0 || totalStake > userUnits) &&
                      styles.placeBetButtonDisabled,
                  ]}
                  onPress={handlePlaceBets}
                  disabled={isPlacingBets || stakePerBet <= 0 || totalStake > userUnits}
                  activeOpacity={0.7}
                >
                  {isPlacingBets ? (
                    <View style={styles.loadingButton}>
                      <ActivityIndicator size="small" color={Colors.dark.background} />
                      <Text style={styles.placeBetButtonText}>Placing Bets...</Text>
                    </View>
                  ) : (
                    <Text style={styles.placeBetButtonText}>
                      Place {selections.length} Bet{selections.length > 1 ? 's' : ''} - {totalStake.toFixed(2)} credits
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
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
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border + '40',
  },
  headerTitle: {
    ...Typography.title.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 22,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearButtonText: {
    ...Typography.body.small,
    color: Colors.dark.danger,
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    ...Typography.title.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
  selectionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    ...Typography.meta.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.display,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  selectionCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border + '40',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  selectionInfo: {
    flex: 1,
  },
  matchupText: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
    fontSize: 13,
    marginBottom: 4,
  },
  betTypeText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 11,
  },
  removeButton: {
    padding: 4,
  },
  selectionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamName: {
    ...Typography.title.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
  },
  oddsChip: {
    backgroundColor: '#007BFF' + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007BFF' + '40',
  },
  oddsText: {
    ...Typography.emphasis.medium,
    color: '#007BFF',
    fontFamily: Fonts.display,
    fontSize: 15,
  },
  betAmountSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.border + '60',
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    ...Typography.title.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 28,
    paddingVertical: 12,
  },
  inputUnit: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.medium,
  },
  balanceText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 12,
    marginBottom: 16,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
  },
  quickButton: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border + '60',
  },
  quickButtonActive: {
    backgroundColor: Colors.dark.tint + '20',
    borderColor: Colors.dark.tint,
  },
  quickButtonText: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
  },
  quickButtonTextActive: {
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
  },
  summaryCard: {
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border + '40',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  summaryValue: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border + '40',
    marginVertical: 8,
  },
  potentialWinValue: {
    ...Typography.title.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
  },
  profitLabel: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  profitValue: {
    ...Typography.title.small,
    fontFamily: Fonts.display,
    fontSize: 16,
  },
  placeBetButton: {
    backgroundColor: Colors.dark.tint,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  placeBetButtonDisabled: {
    backgroundColor: Colors.dark.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  placeBetButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.display,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
