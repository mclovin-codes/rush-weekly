import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Typography } from '@/constants/theme';
import { BetSelection } from '@/providers/BetSlipProvider';

interface Prop {
  stat_type: string;
  display_name: string;
  category: string;
  yes_payout?: number | null;
  no_payout?: number | null;
}

interface PlayerProps {
  player_id: string;
  player_name: string;
  props: Prop[];
}

interface NFLScoringCardProps {
  players: PlayerProps[];
  eventID: string;
  leagueID: string;
  gameTime: string;
  matchup: string;
  onBetSelect: (selection: BetSelection) => void;
}

// Helper to format odds
const formatOdds = (odds: number | null | undefined): string => {
  if (odds === null || odds === undefined) return '-';
  return odds > 0 ? `+${odds}` : String(odds);
};

// Priority order for scoring props (ones that show by default)
const PRIORITY_SCORING_PROPS = ['firstTouchdown', 'touchdowns'];

export default function NFLScoringCard({
  players,
  eventID,
  leagueID,
  gameTime,
  matchup,
  onBetSelect,
}: NFLScoringCardProps) {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  const togglePlayer = (playerId: string) => {
    setExpandedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const handleBetPress = (player: PlayerProps, prop: Prop) => {
    if (prop.yes_payout === null || prop.yes_payout === undefined) return;

    const betSelection: BetSelection = {
      id: `${eventID}-${player.player_id}-${prop.stat_type}`,
      eventID,
      leagueID,
      gameTime,
      matchup,
      teamName: player.player_name,
      betType: 'player_prop',
      betTypeLabel: prop.display_name,
      selection: 'yes',
      odds: prop.yes_payout,
      line: null,
      playerPropData: {
        playerId: player.player_id,
        playerName: player.player_name,
        statType: prop.stat_type,
        displayName: prop.display_name,
        category: prop.category,
      },
    };

    onBetSelect(betSelection);
  };

  // Separate props into priority (always shown) and extra (expandable)
  const separateProps = (props: Prop[]) => {
    const priority: Prop[] = [];
    const extra: Prop[] = [];

    props.forEach(prop => {
      if (PRIORITY_SCORING_PROPS.includes(prop.stat_type)) {
        priority.push(prop);
      } else {
        extra.push(prop);
      }
    });

    return { priority, extra };
  };

  return (
    <View style={styles.container}>
      {players.map(({ player_id, player_name, props }) => {
        const { priority, extra } = separateProps(props);
        const isExpanded = expandedPlayers.has(player_id);
        const hasExtra = extra.length > 0;

        return (
          <View key={player_id} style={styles.playerCard}>
            {/* Player Header */}
            <View style={styles.playerHeader}>
              <Text style={styles.playerName}>{player_name}</Text>
              {hasExtra && (
                <TouchableOpacity
                  style={styles.expandButton}
                  onPress={() => togglePlayer(player_id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.expandButtonText}>
                    {isExpanded ? 'Show Less' : `+${extra.length} More`}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors.dark.tint}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Scoring Props Buttons */}
            <View style={styles.propsContainer}>
              {/* Priority Props (Always Visible) */}
              {priority.map(prop => (
                <TouchableOpacity
                  key={prop.stat_type}
                  style={styles.propButton}
                  onPress={() => handleBetPress({ player_id, player_name, props: [] }, prop)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.propName}>{prop.display_name}</Text>
                  <Text style={styles.propOdds}>{formatOdds(prop.yes_payout)}</Text>
                </TouchableOpacity>
              ))}

              {/* Extra Props (Shown When Expanded) */}
              {isExpanded &&
                extra.map(prop => (
                  <TouchableOpacity
                    key={prop.stat_type}
                    style={[styles.propButton, styles.extraPropButton]}
                    onPress={() => handleBetPress({ player_id, player_name, props: [] }, prop)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.propName}>{prop.display_name}</Text>
                    <Text style={styles.propOdds}>{formatOdds(prop.yes_payout)}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  playerCard: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border + '50',
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerName: {
    ...Typography.title.small,
    color: Colors.dark.text,
    fontFamily: Fonts.display,
    fontSize: 16,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandButtonText: {
    ...Typography.body.small,
    color: Colors.dark.tint,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  propsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  propButton: {
    backgroundColor: Colors.dark.success + '20',
    borderWidth: 1,
    borderColor: Colors.dark.success + '50',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    flex: 1,
  },
  extraPropButton: {
    backgroundColor: Colors.dark.cardElevated + '40',
    borderColor: Colors.dark.border + '60',
  },
  propName: {
    ...Typography.body.small,
    color: Colors.dark.text,
    fontFamily: Fonts.medium,
    fontSize: 13,
    marginBottom: 4,
  },
  propOdds: {
    ...Typography.emphasis.medium,
    color: Colors.dark.success,
    fontFamily: Fonts.display,
    fontSize: 15,
  },
});
