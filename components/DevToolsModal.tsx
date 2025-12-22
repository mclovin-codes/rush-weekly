import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { apiHelpers } from '@/config/api';
import { API_ROUTES } from '@/constants/api-routes';

interface DevToolsModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: string;
  onPoolCreated?: () => void;
}

export default function DevToolsModal({
  visible,
  onClose,
  userId,
  onPoolCreated,
}: DevToolsModalProps) {
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [isSettingCredits, setIsSettingCredits] = useState(false);

  const createWeeklyPool = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please log in.');
      return;
    }

    setIsCreatingPool(true);
    try {
      // Get current week dates
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      console.log('[DevTools] Creating pool...');
      // Create pool
      const poolData = {
        name: `Dev Pool - Week ${weekStart.toLocaleDateString()}`,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        isActive: true,
        initialCredits: 1000,
        entryFee: 0,
      };

      const newPool = await apiHelpers.post(API_ROUTES.POOLS.CREATE, poolData);
      console.log('[DevTools] Pool creation response:', JSON.stringify(newPool, null, 2));
      console.log('[DevTools] Pool ID from response:', newPool.id);
      console.log('[DevTools] Pool doc ID:', newPool.doc?.id);

      // Set user's current credits to 1000
      console.log('[DevTools] Setting user credits...');
      console.log('[DevTools] Update URL:', API_ROUTES.USERS.UPDATE(userId));
      console.log('[DevTools] Update data:', { current_credits: 1000 });

      const updateResponse = await apiHelpers.patch(API_ROUTES.USERS.UPDATE(userId), {
        current_credits: 1000,
      });

      console.log('[DevTools] Credits update response:', JSON.stringify(updateResponse, null, 2));
      console.log('[DevTools] Updated credits value:', updateResponse.current_credits);

      // Create pool membership to join the pool
      console.log('[DevTools] Creating pool membership...');

      // Extract pool ID - might be in different places depending on API response
      const poolId = newPool.id || newPool.doc?.id;
      console.log('[DevTools] Extracted Pool ID:', poolId);
      console.log('[DevTools] User ID:', userId);

      if (!poolId) {
        throw new Error('Pool ID not found in response. Check pool creation response above.');
      }

      const membershipData = {
        pool: poolId,
        user: userId,
        score: 0,
        initial_credits_at_start: 1000,
      };
      console.log('[DevTools] Membership data:', JSON.stringify(membershipData, null, 2));

      const membership = await apiHelpers.post(API_ROUTES.POOL_MEMBERSHIPS.CREATE, membershipData);
      console.log('[DevTools] Pool membership created successfully!');
      console.log('[DevTools] Membership response:', JSON.stringify(membership, null, 2));

      Alert.alert(
        'Pool Created! 🎉',
        `You're all set!\n\nYou've been given 1,000 credits to start playing.\n\nGood luck!`,
        [
          {
            text: 'Get Started',
            onPress: () => {
              onPoolCreated?.();
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('[DevTools] Error:', error);
      console.error('[DevTools] Error details:', JSON.stringify(error, null, 2));
      Alert.alert(
        'Error',
        `Failed to create pool:\n\n${error?.message || error?.toString() || 'Unknown error'}\n\nCheck console for details.`
      );
    } finally {
      setIsCreatingPool(false);
    }
  };

  const setUserCredits = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found. Please log in.');
      return;
    }

    setIsSettingCredits(true);
    try {
      await apiHelpers.patch(API_ROUTES.USERS.UPDATE(userId), {
        current_credits: 1000,
      });

      Alert.alert(
        'Success',
        'Your credits have been set to 1000!',
        [
          {
            text: 'OK',
            onPress: () => {
              onPoolCreated?.();
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error setting credits:', error);
      Alert.alert('Error', error?.message || 'Failed to set credits');
    } finally {
      setIsSettingCredits(false);
    }
  };

  const isLoading = isCreatingPool || isSettingCredits;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Action</Text>
      
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Pool Management</Text>
            <Text style={styles.description}>
            To get started, please join an available pool
            </Text>
            <View style={{paddingVertical: 15}}/>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={createWeeklyPool}
              disabled={isLoading}
            >
              {isCreatingPool ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.dark.background} />
                  <Text style={styles.buttonText}>Creating Pool...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Create & Join Weekly Pool</Text>
              )}
            </TouchableOpacity>
         
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.dark.background,
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.display,
    color: Colors.dark.tint,
  },
  closeButton: {
    fontSize: 28,
    color: Colors.dark.icon,
    fontFamily: Fonts.display,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    ...Typography.title.small,
    color: Colors.dark.text,
    marginBottom: 8,
    fontFamily: Fonts.bold,
  },
  description: {
    ...Typography.body.medium,
    color: Colors.dark.textSecondary,
    marginBottom: 16,
  },
  button: {
    backgroundColor: Colors.dark.tint,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.dark.tint,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.background,
    fontFamily: Fonts.bold,
  },
  secondaryButtonText: {
    ...Typography.emphasis.medium,
    color: Colors.dark.tint,
    fontFamily: Fonts.bold,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: 20,
  },
  infoCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  infoLabel: {
    ...Typography.body.small,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    ...Typography.body.medium,
    color: Colors.dark.text,
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
  warning: {
    backgroundColor: Colors.dark.danger + '15',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.danger,
  },
  warningText: {
    ...Typography.body.medium,
    color: Colors.dark.danger,
    fontFamily: Fonts.bold,
    marginBottom: 4,
  },
  warningSubtext: {
    ...Typography.body.small,
    color: Colors.dark.danger,
  },
});
