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
      let poolId: string;
      let poolName: string;
      let isNewPool = false;

      // First, check if there's an active pool
      console.log('[DevTools] Checking for active pools...');
      const activePools = await apiHelpers.get(API_ROUTES.POOLS.GET_ACTIVE);
      console.log('[DevTools] Active pools response:', JSON.stringify(activePools, null, 2));

      if (activePools?.docs && activePools.docs.length > 0) {
        // Join existing active pool
        const existingPool = activePools.docs[0];
        poolId = existingPool.id;
        poolName = existingPool.name;
        console.log('[DevTools] Found existing active pool:', poolName, 'ID:', poolId);
      } else {
        // No active pool exists, create a new one
        console.log('[DevTools] No active pool found, creating new pool...');
        isNewPool = true;

        // Get current week dates
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

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

        poolId = newPool.id || newPool.doc?.id;
        poolName = poolData.name;

        if (!poolId) {
          throw new Error('Pool ID not found in response. Check pool creation response above.');
        }

        console.log('[DevTools] Created new pool:', poolName, 'ID:', poolId);
      }

      // Set user's current credits to 1000
      console.log('[DevTools] Setting user credits...');
      const updateResponse = await apiHelpers.patch(API_ROUTES.USERS.UPDATE(userId), {
        current_credits: 1000,
      });
      console.log('[DevTools] Credits updated:', updateResponse.current_credits);

      // Create pool membership to join the pool
      console.log('[DevTools] Creating pool membership...');
      const membershipData = {
        pool: poolId,
        user: userId,
        score: 0,
        initial_credits_at_start: 1000,
      };

      const membership = await apiHelpers.post(API_ROUTES.POOL_MEMBERSHIPS.CREATE, membershipData);
      console.log('[DevTools] Pool membership created successfully!');
      console.log('[DevTools] Membership response:', JSON.stringify(membership, null, 2));

      Alert.alert(
        isNewPool ? 'Pool Created! 🎉' : 'Joined Pool! 🎉',
        isNewPool
          ? `You're all set!\n\nPool: ${poolName}\n\nYou've been given 1,000 credits to start playing.\n\nGood luck!`
          : `You've joined the active pool!\n\nPool: ${poolName}\n\nYou've been given 1,000 credits to start playing.\n\nGood luck!`,
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
        `Failed to join/create pool:\n\n${error?.message || error?.toString() || 'Unknown error'}\n\nCheck console for details.`
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
                  <Text style={styles.buttonText}>Joining Pool...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Join Pool & Get Credits</Text>
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
