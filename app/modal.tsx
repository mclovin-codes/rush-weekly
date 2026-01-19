import { Colors, Fonts, Typography } from '@/constants/theme';
import { useBetSlip } from '@/providers/BetSlipProvider';
import { betService } from '@/services/bets';
import { PlaceBetRequest, PlaceParlayRequest } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

// Helper function to convert American odds to decimal
const americanToDecimal = (americanOdds: number): number => {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1;
  }
  return 100 / Math.abs(americanOdds) + 1;
};

// Helper function to convert decimal odds to American
const decimalToAmerican = (decimalOdds: number): number => {
  if (decimalOdds >= 2.0) {
    return Math.round((decimalOdds - 1) * 100);
  }
  return Math.round(-100 / (decimalOdds - 1));
};

// Helper function to calculate combined parlay odds
const calculateParlayOdds = (odds: number[]): { american: number; decimal: number } => {
  const combinedDecimal = odds.reduce((acc, odds) => acc * americanToDecimal(odds), 1);
  const combinedAmerican = decimalToAmerican(combinedDecimal);
  return { american: combinedAmerican, decimal: combinedDecimal };
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
    isVisible,
    removeSelection,
    clearSelections,
    setStakeForBet,
    closeBetSlip,
    betType,
    parlayStake,
    setParlayStake,
    setBetType,
  } = useBetSlip();

  const [isPlacingBets, setIsPlacingBets] = useState(false);

  // Parlay validation: check for same game selections (not allowed for parlays)
  const hasSameGameSelections = useMemo(() => {
    const eventIds = selections.map(s => s.eventID);
    const uniqueEventIds = new Set(eventIds);
    return eventIds.length !== uniqueEventIds.size;
  }, [selections]);

  // Parlay validation: minimum 2 legs required
  const canParlay = selections.length >= 2 && !hasSameGameSelections;

  // Calculate combined parlay odds
  const parlayOdds = useMemo(() => {
    if (selections.length < 2) return null;
    const oddsArray = selections.map(s => s.odds);
    return calculateParlayOdds(oddsArray);
  }, [selections]);

  // Calculate totals based on bet type
  const totalStake = useMemo(() => {
    if (betType === 'parlay') {
      return parlayStake || 0;
    }
    return selections.reduce((total, selection) => total + (selection.stake || 0), 0);
  }, [betType, selections, parlayStake]);

  const potentialWinnings = useMemo(() => {
    if (betType === 'parlay') {
      if (!parlayOdds) return 0;
      return totalStake * parlayOdds.decimal;
    }
    return selections.reduce((total, selection) => {
      return total + calculatePayout(selection.stake || 0, selection.odds);
    }, 0);
  }, [betType, selections, totalStake, parlayOdds]);

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

    // Cleanup: reset position when component unmounts to prevent overlay issues
    return () => {
      translateY.setValue(SHEET_HEIGHT);
    };
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

  const handlePlaceBets = async () => {
    if (selections.length === 0) {
      Alert.alert('No Selections', 'Please add bets to your slip');
      return;
    }

    // Validation for parlay
    if (betType === 'parlay') {
      if (selections.length < 2) {
        Alert.alert('Not Enough Legs', 'Parlay bets require at least 2 selections');
        return;
      }
      if (hasSameGameSelections) {
        Alert.alert('Invalid Parlay', 'Cannot parlay bets from the same game');
        return;
      }
    }

    // Check if any bet has no stake or invalid stake
    if (betType === 'straight') {
      const hasInvalidStake = selections.some(s => !s.stake || s.stake <= 0);
      if (hasInvalidStake) {
        Alert.alert('Invalid Amount', 'Please enter a valid bet amount for each bet');
        return;
      }
    } else {
      if (!parlayStake || parlayStake <= 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid bet amount');
        return;
      }
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

    try {
      if (betType === 'parlay') {
        // Place parlay bet
        const parlayData: PlaceParlayRequest = {
          user: userId,
          pool: poolId,
          stake: parlayStake || 0,
          legs: selections.map(s => ({
            eventID: s.eventID,
            leagueID: s.leagueID,
            betType: s.betType,
            selection: s.selection,
            // Add player prop fields if applicable
            ...(s.betType === 'player_prop' && s.playerPropData ? {
              playerId: s.playerPropData.playerId,
              playerName: s.playerPropData.playerName,
              statType: s.playerPropData.statType,
              displayName: s.playerPropData.displayName,
            } : {}),
          })),
        };

  
        const response = await betService.placeParlay(parlayData);

        
        if (response.success) {
          
          Alert.alert(
            'Parlay Placed Successfully!',
            `${selections.length} leg parlay placed for ${totalStake.toFixed(2)} credits\nPotential payout: ${potentialWinnings.toFixed(2)} credits`,
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
        } else {
          console.log('=== PARLAY FAILED ===');
          console.log('Failed with error:', response.error);
          Alert.alert('Parlay Failed', response.error || 'Failed to place parlay bet');
        }
      } else {
        // Place straight bets individually
        const successfulBets: { name: string; id: string }[] = [];
        const failedBets: { name: string; error: string }[] = [];

        for (const selection of selections) {
          try {
            const betData: PlaceBetRequest = {
              user: userId,
              pool: poolId,
              eventID: selection.eventID,
              leagueID: selection.leagueID,
              betType: selection.betType,
              selection: selection.selection,
              stake: selection.stake || 0,
              // Add player prop specific fields if this is a player prop bet
              ...(selection.betType === 'player_prop' && selection.playerPropData ? {
                playerId: selection.playerPropData.playerId,
                playerName: selection.playerPropData.playerName,
                statType: selection.playerPropData.statType,
                displayName: selection.playerPropData.displayName,
                category: selection.playerPropData.category,
              } : {}),
            };

            const response = await betService.placeBet(betData);

            if (response.success) {
              successfulBets.push({ name: selection.teamName, id: selection.id });
            } else {
              failedBets.push({
                name: selection.teamName,
                error: response.error || 'Unknown error',
              });
            }
          } catch (error: any) {
            const errorMsg = error?.response?.data?.error || error?.message || 'Failed to place bet';
            failedBets.push({
              name: selection.teamName,
              error: errorMsg,
            });
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
          // Some bets succeeded, some failed - show detailed error
          const failedList = failedBets.map(f => `• ${f.name}: ${f.error}`).join('\n');
          Alert.alert(
            'Partial Success',
            `${successfulBets.length} bet(s) placed successfully.\n\n${failedBets.length} bet(s) failed:\n${failedList}`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Remove successful bets from slip
                  successfulBets.forEach(bet => {
                    removeSelection(bet.id);
                  });
                  if (onBetPlaced) {
                    onBetPlaced();
                  }
                },
              },
            ]
          );
        } else if (failedBets.length > 0) {
          // All bets failed - show detailed error
          const failedList = failedBets.map(f => `• ${f.name}: ${f.error}`).join('\n');
          Alert.alert(
            'Bets Failed',
            `Failed to place ${failedBets.length} bet(s):\n\n${failedList}`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error: any) {
      console.log('=== PARLAY CATCH ERROR ===');
      console.log('Error object:', error);
      console.log('Error message:', error?.message);
      console.log('Error response:', error?.response);
      console.log('Error response data:', error?.response?.data);
      const errorMsg = error?.response?.data?.error || error?.message || 'An error occurred';
      console.log('Final error message to show:', errorMsg);
      Alert.alert('Error', errorMsg);
    } finally {
      setIsPlacingBets(false);
    }
  };

  // Don't render anything if not visible - prevents overlay conflicts when navigating
  if (!isVisible) {
    return null;
  }

  return (
    <Modal
      visible={true}
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
                {/* Selections List with Individual Stakes */}
                <View style={styles.selectionsSection}>
                  <Text style={styles.sectionTitle}>
                    YOUR PICKS ({selections.length})
                  </Text>
                  {selections.map((selection) => {
                    const betStake = selection.stake || 0;
                    const betPayout = calculatePayout(betStake, selection.odds);
                    const betProfit = betPayout - betStake;

                    return (
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
                          <View style={styles.selectionLeft}>
                            <Text style={styles.teamName}>{selection.teamName}</Text>
                            <View style={styles.oddsChip}>
                              <Text style={styles.oddsText}>
                                {selection.odds > 0 ? `+${selection.odds}` : selection.odds}
                              </Text>
                            </View>
                          </View>
                          {betType === 'straight' && (
                            <Text style={styles.toWinText}>
                              To Win: {betProfit > 0 ? '+' : ''}{betProfit.toFixed(0)}
                            </Text>
                          )}
                        </View>

                        {/* Individual Stake Input - only for straight bets */}
                        {betType === 'straight' && (
                          <>
                            <View style={styles.stakeInputRow}>
                              <Text style={styles.stakeLabel}>Amount</Text>
                              <View style={styles.stakeInputWrapper}>
                                <TextInput
                                  style={styles.stakeInput}
                                  value={betStake > 0 ? betStake.toString() : ''}
                                  onChangeText={(val) => setStakeForBet(selection.id, Number(val) || 0)}
                                  placeholder="0"
                                  placeholderTextColor={Colors.dark.border}
                                  keyboardType="numeric"
                                />
                                <Text style={styles.stakeUnit}>cr</Text>
                              </View>
                            </View>

                            {/* Quick Amount Buttons per card */}
                            <View style={styles.quickAmountsRow}>
                              {[10, 25, 50, 100].map((amount) => (
                                <TouchableOpacity
                                  key={amount}
                                  style={[
                                    styles.quickAmountChip,
                                    betStake === amount && styles.quickAmountChipActive,
                                  ]}
                                  onPress={() => setStakeForBet(selection.id, amount)}
                                  activeOpacity={0.7}
                                >
                                  <Text style={[
                                    styles.quickAmountChipText,
                                    betStake === amount && styles.quickAmountChipTextActive,
                                  ]}>
                                    {amount}
                                  </Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          </>
                        )}
                      </View>
                    );
                  })}
                </View>

                {/* Bet Type Toggle - show when 2+ selections */}
                {selections.length >= 2 && (
                  <View style={styles.betTypeSection}>
                    <Text style={styles.sectionTitle}>BET TYPE</Text>
                    <View style={styles.betTypeToggle}>
                      <TouchableOpacity
                        style={[
                          styles.betTypeButton,
                          betType === 'straight' && styles.betTypeButtonActive,
                        ]}
                        onPress={() => setBetType('straight')}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.betTypeButtonText,
                          betType === 'straight' && styles.betTypeButtonTextActive,
                        ]}>
                          Straight Bets
                        </Text>
                        <Text style={styles.betTypeDescription}>
                          {selections.length} separate bets
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.betTypeButton,
                          betType === 'parlay' && styles.betTypeButtonActive,
                          !canParlay && styles.betTypeButtonDisabled,
                        ]}
                        onPress={() => canParlay && setBetType('parlay')}
                        activeOpacity={0.7}
                        disabled={!canParlay}
                      >
                        <Text style={[
                          styles.betTypeButtonText,
                          betType === 'parlay' && styles.betTypeButtonTextActive,
                          !canParlay && styles.betTypeButtonTextDisabled,
                        ]}>
                          Parlay
                        </Text>
                        <Text style={styles.betTypeDescription}>
                          All must win
                        </Text>
                        {parlayOdds && (
                          <Text style={[
                            styles.parlayOddsText,
                            betType === 'parlay' && styles.parlayOddsTextActive,
                          ]}>
                            {parlayOdds.american > 0 ? `+${parlayOdds.american}` : parlayOdds.american}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Same game warning */}
                    {hasSameGameSelections && (
                      <View style={styles.warningBox}>
                        <Ionicons name="warning" size={16} color={Colors.dark.warning} />
                        <Text style={styles.warningText}>
                          Cannot parlay bets from the same game
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Parlay Bet Amount - show when parlay is selected */}
                {betType === 'parlay' && (
                  <View style={styles.parlayAmountSection}>
                    <Text style={styles.sectionTitle}>BET AMOUNT</Text>
                    <View style={styles.parlayAmountInputRow}>
                      <View style={styles.parlayAmountInputWrapper}>
                        <TextInput
                          style={styles.parlayAmountInput}
                          value={parlayStake?.toString() || '10'}
                          onChangeText={(val) => setParlayStake(Number(val) || 0)}
                          placeholder="10"
                          placeholderTextColor={Colors.dark.border}
                          keyboardType="numeric"
                        />
                        <Text style={styles.stakeUnit}>credits</Text>
                      </View>
                    </View>

                    {/* Quick Amount Buttons for parlay */}
                    <View style={styles.quickAmountsRow}>
                      {[10, 25, 50, 100].map((amount) => (
                        <TouchableOpacity
                          key={amount}
                          style={[
                            styles.quickAmountChip,
                            parlayStake === amount && styles.quickAmountChipActive,
                          ]}
                          onPress={() => setParlayStake(amount)}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.quickAmountChipText,
                            parlayStake === amount && styles.quickAmountChipTextActive,
                          ]}>
                            {amount}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Parlay odds display */}
                    {parlayOdds && (
                      <View style={styles.parlayOddsDisplay}>
                        <Text style={styles.parlayOddsLabel}>Combined Odds</Text>
                        <Text style={styles.parlayOddsValue}>
                          {parlayOdds.american > 0 ? `+${parlayOdds.american}` : parlayOdds.american}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Balance Info */}
                <View style={styles.balanceSection}>
                  <Text style={styles.balanceText}>
                    Available: {userUnits.toFixed(2)} credits
                  </Text>
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Stake</Text>
                    <Text style={styles.summaryValue}>
                      {totalStake.toFixed(2)} credits
                    </Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Potential Win</Text>
                    <Text style={styles.potentialWinValue}>
                      {potentialWinnings.toFixed(2)} credits
                    </Text>
                  </View>
                  {betType === 'parlay' && parlayOdds && (
                    <>
                      <View style={styles.divider} />
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Parlay Odds</Text>
                        <Text style={styles.parlayOddsSummaryValue}>
                          {parlayOdds.american > 0 ? `+${parlayOdds.american}` : parlayOdds.american}
                        </Text>
                      </View>
                    </>
                  )}
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
                    (isPlacingBets || totalStake <= 0 || totalStake > userUnits || (betType === 'parlay' && !canParlay)) &&
                      styles.placeBetButtonDisabled,
                  ]}
                  onPress={handlePlaceBets}
                  disabled={isPlacingBets || totalStake <= 0 || totalStake > userUnits || (betType === 'parlay' && !canParlay)}
                  activeOpacity={0.7}
                >
                  {isPlacingBets ? (
                    <View style={styles.loadingButton}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={[styles.placeBetButtonText, {color: isPlacingBets ? '#fff': Colors.dark.background}]}>Placing Bets...</Text>
                    </View>
                  ) : (
                    <Text style={styles.placeBetButtonText}>
                      {betType === 'parlay'
                        ? `Place Parlay - ${selections.length} Legs - ${totalStake.toFixed(0)} credits`
                        : `Place ${selections.length} Bet${selections.length > 1 ? 's' : ''} - ${totalStake.toFixed(0)} credits`
                      }
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
  selectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toWinText: {
    ...Typography.body.small,
    color: Colors.dark.success,
    fontFamily: Fonts.medium,
    fontSize: 13,
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
  // Individual stake input styles
  stakeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border + '40',
  },
  stakeLabel: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  stakeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border + '60',
    paddingHorizontal: 12,
    paddingVertical: 4,
    minWidth: 80,
  },
  stakeInput: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
    flex: 1,
    textAlign: 'right',
    paddingVertical: 4,
  },
  stakeUnit: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 11,
    marginLeft: 4,
  },
  balanceSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    alignItems: 'flex-end',
  },
  balanceText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 12,
  },
  // Per-card quick amounts
  quickAmountsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  quickAmountChip: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border + '60',
  },
  quickAmountChipActive: {
    backgroundColor: Colors.dark.tint + '20',
    borderColor: Colors.dark.tint,
  },
  quickAmountChipText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: Fonts.medium,
  },
  quickAmountChipTextActive: {
    color: Colors.dark.tint,
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
    justifyContent: 'center',
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
    justifyContent: 'center',
    gap: 10,
    width: '100%',
  },
  // Bet type toggle styles
  betTypeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  betTypeToggle: {
    flexDirection: 'row',
    gap: 12,
  },
  betTypeButton: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.dark.border + '40',
    alignItems: 'center',
  },
  betTypeButtonActive: {
    borderColor: Colors.dark.tint,
    backgroundColor: Colors.dark.tint + '15',
  },
  betTypeButtonDisabled: {
    opacity: 0.5,
  },
  betTypeButtonText: {
    ...Typography.title.small,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.display,
    fontSize: 14,
  },
  betTypeButtonTextActive: {
    color: Colors.dark.tint,
  },
  betTypeButtonTextDisabled: {
    color: Colors.dark.textSecondary + '80',
  },
  betTypeDescription: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  parlayOddsText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts.display,
    fontSize: 16,
    marginTop: 6,
  },
  parlayOddsTextActive: {
    color: Colors.dark.tint,
  },
  // Warning box styles
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.warning + '15',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    ...Typography.body.small,
    color: Colors.dark.warning,
    fontSize: 12,
    flex: 1,
  },
  // Parlay amount section styles
  parlayAmountSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  parlayAmountInputRow: {
    marginBottom: 12,
  },
  parlayAmountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.dark.border + '40',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  parlayAmountInput: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 24,
    flex: 1,
    textAlign: 'center',
    paddingVertical: 4,
  },
  parlayOddsDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.tint + '15',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 12,
  },
  parlayOddsLabel: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    fontSize: 13,
  },
  parlayOddsValue: {
    ...Typography.emphasis.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 18,
  },
  parlayOddsSummaryValue: {
    ...Typography.title.small,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 16,
  },
});
