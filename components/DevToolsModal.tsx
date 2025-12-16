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
  const [isJoiningPool, setIsJoiningPool] = useState(false);
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

      // Set user's current credits to 1000
      await apiHelpers.patch(API_ROUTES.USERS.UPDATE(userId), {
        current_credits: 1000,
      });

      Alert.alert('Success', 'Pool created and credits added!');

      // Auto-join the pool
      await joinPool(newPool.id);
    } catch (error: any) {
      console.error('Error creating pool:', error);
      Alert.alert('Error', error?.message || 'Failed to create pool');
    } finally {
      setIsCreatingPool(false);
    }
  };

  const joinPool = async (poolId: string) => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    setIsJoiningPool(true);
    try {
      const membershipData = {
        pool: poolId,
        user: userId,
        score: 0,
        initial_credits_at_start: 1000,
      };

      await apiHelpers.post(API_ROUTES.POOL_MEMBERSHIPS.CREATE, membershipData);

      Alert.alert(
        'Success',
        'Pool created and joined successfully! You can now place bets.',
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
      console.error('Error joining pool:', error);
      Alert.alert('Error', error?.message || 'Failed to join pool');
    } finally {
      setIsJoiningPool(false);
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

  const isLoading = isCreatingPool || isJoiningPool || isSettingCredits;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Dev Tools</Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Pool Management</Text>
            <Text style={styles.description}>
              Create a test pool to start placing bets
            </Text>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={createWeeklyPool}
              disabled={isLoading}
            >
              {isCreatingPool || isJoiningPool ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.dark.background} />
                  <Text style={styles.buttonText}>
                    {isCreatingPool ? 'Creating Pool...' : 'Joining Pool...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Create & Join Weekly Pool</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
              onPress={setUserCredits}
              disabled={isLoading}
            >
              {isSettingCredits ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.dark.tint} />
                  <Text style={styles.secondaryButtonText}>Setting Credits...</Text>
                </View>
              ) : (
                <Text style={styles.secondaryButtonText}>Set My Credits to 1000</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Info</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>User ID:</Text>
              <Text style={styles.infoValue}>{userId || 'Not logged in'}</Text>
            </View>

            <View style={styles.warning}>
              <Text style={styles.warningText}>
                ⚠️ Development Mode Only
              </Text>
              <Text style={styles.warningSubtext}>
                These tools are for testing. Remove before production.
              </Text>
            </View>
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
