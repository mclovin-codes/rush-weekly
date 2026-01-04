import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Typography } from '@/constants/theme';

export interface BuyBackCreditsBottomSheetRef {
  open: () => void;
  close: () => void;
}

interface BuyBackCreditsBottomSheetProps {
  onPurchase: (amount: number) => void;
  isLoading?: boolean;
  currentCredits?: number;
  lastBuybackDate?: string | null;
}

const BuyBackCreditsBottomSheet = forwardRef<BuyBackCreditsBottomSheetRef, BuyBackCreditsBottomSheetProps>(
  ({ onPurchase, isLoading = false, currentCredits = 0, lastBuybackDate = null }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['75%'], []);

    // Calculate if buy-back is allowed
    const canBuyBack = useMemo(() => {
      // Check 1: Balance must be 0
      if (currentCredits !== 0) {
        return {
          allowed: false,
          reason: 'balance',
          message: 'You can only buy-back when your balance is 0',
          daysRemaining: 0,
        };
      }

      // Check 2: Must wait 7 days since last buyback
      if (lastBuybackDate) {
        const lastBuyback = new Date(lastBuybackDate);
        const now = new Date();
        const daysSinceLastBuyback = (now.getTime() - lastBuyback.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceLastBuyback < 7) {
          const daysRemaining = Math.ceil(7 - daysSinceLastBuyback);
          return {
            allowed: false,
            reason: 'cooldown',
            message: `You can buy-back again in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
            daysRemaining,
          };
        }
      }

      return {
        allowed: true,
        reason: null,
        message: 'Buy-back available',
        daysRemaining: 0,
      };
    }, [currentCredits, lastBuybackDate]);

    console.log('[BuyBackCreditsBottomSheet] Component rendering');
    console.log('[BuyBackCreditsBottomSheet] Snap points:', snapPoints);

    useImperativeHandle(ref, () => ({
      open: () => {
        console.log('[BuyBackCreditsBottomSheet] Opening bottom sheet');
        console.log('[BuyBackCreditsBottomSheet] Ref exists:', !!bottomSheetRef.current);
        if (bottomSheetRef.current) {
          console.log('[BuyBackCreditsBottomSheet] Calling present()');
          try {
            bottomSheetRef.current.present();
            console.log('[BuyBackCreditsBottomSheet] Present() called successfully');
          } catch (error) {
            console.error('[BuyBackCreditsBottomSheet] Error calling present():', error);
          }
        } else {
          console.error('[BuyBackCreditsBottomSheet] Ref is null!');
        }
      },
      close: () => {
        console.log('[BuyBackCreditsBottomSheet] Closing bottom sheet');
        bottomSheetRef.current?.dismiss();
      },
    }));

    const renderBackdrop = useMemo(
      // eslint-disable-next-line react/display-name
      () => (props: any) =>
        (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.5}
          />
        ),
      []
    );

    const CREDIT_AMOUNT = 1000;
    const CREDIT_PRICE = '$4.99';

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        enableDynamicSizing={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        onChange={(index) => {
          console.log('[BuyBackCreditsBottomSheet] Index changed to:', index);
        }}
        onAnimate={(fromIndex, toIndex) => {
          console.log('[BuyBackCreditsBottomSheet] Animating from', fromIndex, 'to', toIndex);
        }}
        style={{ zIndex: 9999 }}
      >
        <BottomSheetScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Buy-Back Credits</Text>
            <Text style={styles.subtitle}>
              Reload your virtual credits to continue playing
            </Text>
          </View>

          {/* Current Balance */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceIcon}>
              <Ionicons name="wallet" size={32} color={Colors.dark.tint} />
            </View>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceValue}>{currentCredits.toFixed(2)} credits</Text>
            </View>
          </View>

          {/* Status Alert */}
          {!canBuyBack.allowed && (
            <View style={[
              styles.statusAlert,
              canBuyBack.reason === 'balance' ? styles.statusAlertWarning : styles.statusAlertInfo
            ]}>
              <Ionicons
                name={canBuyBack.reason === 'balance' ? 'alert-circle' : 'time'}
                size={20}
                color={canBuyBack.reason === 'balance' ? '#FFA500' : Colors.dark.tint}
              />
              <Text style={styles.statusAlertText}>{canBuyBack.message}</Text>
            </View>
          )}

          {canBuyBack.allowed && (
            <View style={styles.statusAlert}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.dark.success} />
              <Text style={[styles.statusAlertText, { color: Colors.dark.success }]}>
                Buy-back available! You can purchase credits now.
              </Text>
            </View>
          )}

          {/* Credit Package */}
          <View style={styles.packageCard}>
            <View style={styles.packageHeader}>
              <Ionicons name="diamond" size={48} color={Colors.dark.tint} />
            </View>

            <Text style={styles.creditsAmount}>{CREDIT_AMOUNT.toLocaleString()}</Text>
            <Text style={styles.creditsLabel}>Virtual Credits</Text>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>{CREDIT_PRICE}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.purchaseButton,
                (!canBuyBack.allowed || isLoading) && styles.purchaseButtonDisabled
              ]}
              onPress={() => !isLoading && canBuyBack.allowed && onPurchase(CREDIT_AMOUNT)}
              disabled={isLoading || !canBuyBack.allowed}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.dark.background} />
              ) : (
                <>
                  <Ionicons
                    name={canBuyBack.allowed ? "cart" : "lock-closed"}
                    size={20}
                    color={canBuyBack.allowed ? Colors.dark.background : Colors.dark.textSecondary}
                  />
                  <Text style={[
                    styles.purchaseButtonText,
                    !canBuyBack.allowed && styles.purchaseButtonTextDisabled
                  ]}>
                    {canBuyBack.allowed ? 'Purchase Credits' : 'Unavailable'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerIcon}>
              <Ionicons name="information-circle" size={16} color={Colors.dark.textSecondary} />
            </View>
            <Text style={styles.footerText}>
              Virtual credits have no cash value. Buy-back is only available when your balance is 0, once every 7 days.
            </Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

BuyBackCreditsBottomSheet.displayName = 'BuyBackCreditsBottomSheet';

export default BuyBackCreditsBottomSheet;

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.dark.background,
  },
  handleIndicator: {
    backgroundColor: Colors.dark.border,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  balanceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.tint + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  balanceValue: {
    ...Typography.title.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
  },
  packageCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 32,
    marginTop: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.dark.tint,
    alignItems: 'center',
  },
  packageHeader: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.tint + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  creditsAmount: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 48,
    marginBottom: 4,
  },
  creditsLabel: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    marginBottom: 24,
  },
  priceContainer: {
    backgroundColor: Colors.dark.tint + '15',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  price: {
    ...Typography.title.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 32,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.tint,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
    width: '100%',
    shadowColor: Colors.dark.tint,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  purchaseButtonDisabled: {
    backgroundColor: Colors.dark.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  purchaseButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.display,
    letterSpacing: 0.5,
  },
  purchaseButtonTextDisabled: {
    color: Colors.dark.textSecondary,
  },
  statusAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.tint + '15',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.tint + '40',
  },
  statusAlertWarning: {
    backgroundColor: '#FFA500' + '15',
    borderColor: '#FFA500' + '40',
  },
  statusAlertInfo: {
    backgroundColor: Colors.dark.tint + '15',
    borderColor: Colors.dark.tint + '40',
  },
  statusAlertText: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  footerIcon: {
    marginRight: 4,
  },
  footerText: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    flex: 1,
  },
});
