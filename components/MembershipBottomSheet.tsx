import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Typography } from '@/constants/theme';

export interface MembershipBottomSheetRef {
  open: () => void;
  close: () => void;
}

interface MembershipBottomSheetProps {
  onActivate: (duration: 'week' | 'month' | 'year') => void;
  isLoading?: boolean;
}

const MembershipBottomSheet = forwardRef<MembershipBottomSheetRef, MembershipBottomSheetProps>(
  ({ onActivate, isLoading = false }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['85%'], []);

    console.log('[MembershipBottomSheet] Component rendering');
    console.log('[MembershipBottomSheet] Snap points:', snapPoints);

    useImperativeHandle(ref, () => ({
      open: () => {
        console.log('[MembershipBottomSheet] Opening bottom sheet');
        console.log('[MembershipBottomSheet] Ref exists:', !!bottomSheetRef.current);
        if (bottomSheetRef.current) {
          console.log('[MembershipBottomSheet] Calling present()');
          bottomSheetRef.current.present();
          console.log('[MembershipBottomSheet] Present() called');
        } else {
          console.error('[MembershipBottomSheet] Ref is null!');
        }
      },
      close: () => {
        console.log('[MembershipBottomSheet] Closing bottom sheet');
        bottomSheetRef.current?.dismiss();
      },
    }));

    const renderBackdrop = useMemo(
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

    const PLAN_DURATION = 'week';
    const PLAN_PRICE = '$4.99';
    const PLAN_CREDITS = 1000;

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
          console.log('[MembershipBottomSheet] Index changed to:', index);
        }}
        onAnimate={(fromIndex, toIndex) => {
          console.log('[MembershipBottomSheet] Animating from', fromIndex, 'to', toIndex);
        }}
        style={{ zIndex: 9999 }}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Weekly Pass</Text>
            <Text style={styles.subtitle}>
              Join weekly pools and start competing with other players
            </Text>
          </View>

          {/* Plan Card */}
          <View style={styles.planCard}>
            <View style={styles.planIcon}>
              <Ionicons name="trophy" size={48} color={Colors.dark.tint} />
            </View>

            <Text style={styles.planTitle}>Weekly Pool Entry</Text>
            <Text style={styles.creditsAmount}>{PLAN_CREDITS.toLocaleString()} credits</Text>
            <Text style={styles.creditsLabel}>to start playing</Text>

            <View style={styles.benefitsContainer}>
              <View style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.dark.tint} />
                <Text style={styles.benefitText}>Compete with ~100 players</Text>
              </View>
              <View style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.dark.tint} />
                <Text style={styles.benefitText}>Access all betting markets</Text>
              </View>
              <View style={styles.benefitRow}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.dark.tint} />
                <Text style={styles.benefitText}>Weekly leaderboard rankings</Text>
              </View>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>{PLAN_PRICE}</Text>
              <Text style={styles.pricePeriod}>/week</Text>
            </View>

            <TouchableOpacity
              style={styles.activateButton}
              onPress={() => !isLoading && onActivate(PLAN_DURATION as any)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Colors.dark.background} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.dark.background} />
                  <Text style={styles.activateButtonText}>Activate Membership</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerIcon}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.dark.success} />
            </View>
            <Text style={styles.footerText}>
              100% virtual credits • No real money prizes • Entertainment only
            </Text>
          </View>
        </View>
      </BottomSheetModal>
    );
  }
);

MembershipBottomSheet.displayName = 'MembershipBottomSheet';

export default MembershipBottomSheet;

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.dark.background,
  },
  handleIndicator: {
    backgroundColor: Colors.dark.border,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...Typography.title.large,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
  },
  planCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 32,
    borderWidth: 2,
    borderColor: Colors.dark.tint,
    alignItems: 'center',
    marginBottom: 20,
  },
  planIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.tint + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  planTitle: {
    ...Typography.title.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    marginBottom: 12,
  },
  creditsAmount: {
    ...Typography.title.large,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 36,
    marginBottom: 4,
  },
  creditsLabel: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    marginBottom: 24,
  },
  benefitsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    flex: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: Colors.dark.tint + '15',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 24,
    gap: 4,
  },
  price: {
    ...Typography.title.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.display,
    fontSize: 32,
  },
  pricePeriod: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
  },
  activateButton: {
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
  activateButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.display,
    letterSpacing: 0.5,
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
  },
});
