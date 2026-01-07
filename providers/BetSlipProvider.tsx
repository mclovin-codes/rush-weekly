import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MarketGame } from '@/types';

const BET_SLIP_STORAGE_KEY = '@rush_bet_slip';

export interface BetSelection {
  id: string;
  eventID: string;
  leagueID: string;
  gameTime: string;
  matchup: string;
  teamName: string;
  betType: 'spread' | 'total' | 'moneyline' | 'player_prop';
  betTypeLabel: string;
  selection: 'home' | 'away' | 'over' | 'under' | 'yes' | 'no';
  odds: number;
  line?: number | null;
  // Individual stake for this bet
  stake?: number;
  // Keep reference to full game data for bet placement
  game: MarketGame;
  // Player prop specific fields (only present when betType is 'player_prop')
  playerPropData?: {
    playerId: string;
    playerName: string;
    statType: string;
    displayName: string;
    category: string;
  };
}

interface BetSlipState {
  selections: BetSelection[];
  isVisible: boolean;
}

interface BetSlipContextType extends BetSlipState {
  addSelection: (selection: BetSelection) => void;
  removeSelection: (id: string) => void;
  clearSelections: () => void;
  setStakeForBet: (id: string, amount: number) => void;
  openBetSlip: () => void;
  closeBetSlip: () => void;
  hasSelection: (id: string) => boolean;
}

const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined);

const initialState: BetSlipState = {
  selections: [],
  isVisible: false,
};

export const BetSlipProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<BetSlipState>(initialState);

  // Load bet slip from storage on mount
  useEffect(() => {
    loadBetSlip();
  }, []);

  // Save bet slip to storage whenever selections change
  useEffect(() => {
    if (state.selections.length > 0) {
      saveBetSlip();
    }
  }, [state.selections]);

  const loadBetSlip = async () => {
    try {
      const saved = await AsyncStorage.getItem(BET_SLIP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = new Date();

        // Filter out bets for games that have already started (stale bets)
        const validSelections = (parsed.selections || []).filter((selection: BetSelection) => {
          const gameTime = new Date(selection.gameTime);
          return gameTime > now; // Only keep bets for future games
        });

        setState(prev => ({
          ...prev,
          selections: validSelections,
        }));

        // If we filtered out any bets, update storage
        if (validSelections.length !== (parsed.selections || []).length) {
          await AsyncStorage.setItem(
            BET_SLIP_STORAGE_KEY,
            JSON.stringify({
              selections: validSelections,
            })
          );
        }
      }
    } catch (error) {
      console.error('Failed to load bet slip:', error);
    }
  };

  const saveBetSlip = async () => {
    try {
      await AsyncStorage.setItem(
        BET_SLIP_STORAGE_KEY,
        JSON.stringify({
          selections: state.selections,
        })
      );
    } catch (error) {
      console.error('Failed to save bet slip:', error);
    }
  };

  const addSelection = (selection: BetSelection) => {
    setState(prev => {
      // Check if a bet already exists for this event (same ID)
      const existingIndex = prev.selections.findIndex(s => s.id === selection.id);

      if (existingIndex !== -1) {
        const existing = prev.selections[existingIndex];

        // If it's the EXACT same bet (same betType AND same selection/team), toggle it off
        const isSameBet = existing.betType === selection.betType &&
                          existing.selection === selection.selection;

        if (isSameBet) {
          return {
            ...prev,
            selections: prev.selections.filter((_, i) => i !== existingIndex),
          };
        }

        // Different bet (different betType OR different team), replace it
        // Preserve existing stake if it exists
        const newSelections = [...prev.selections];
        newSelections[existingIndex] = { ...selection, stake: existing.stake };
        return {
          ...prev,
          selections: newSelections,
          isVisible: true,
        };
      }

      // Add new selection with default stake of 10
      return {
        ...prev,
        selections: [...prev.selections, { ...selection, stake: 10 }],
        isVisible: true, // Auto-open bet slip when adding
      };
    });
  };

  const removeSelection = (id: string) => {
    setState(prev => ({
      ...prev,
      selections: prev.selections.filter(s => s.id !== id),
    }));
  };

  const clearSelections = async () => {
    setState(prev => ({
      ...prev,
      selections: [],
    }));

    // Also clear from AsyncStorage
    try {
      await AsyncStorage.removeItem(BET_SLIP_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear bet slip from storage:', error);
    }
  };

  const setStakeForBet = (id: string, amount: number) => {
    setState(prev => ({
      ...prev,
      selections: prev.selections.map(s =>
        s.id === id ? { ...s, stake: amount } : s
      ),
    }));
  };

  const openBetSlip = () => {
    setState(prev => ({ ...prev, isVisible: true }));
  };

  const closeBetSlip = () => {
    setState(prev => ({ ...prev, isVisible: false }));
  };

  const hasSelection = (id: string): boolean => {
    return state.selections.some(s => s.id === id);
  };

  return (
    <BetSlipContext.Provider
      value={{
        selections: state.selections,
        isVisible: state.isVisible,
        addSelection,
        removeSelection,
        clearSelections,
        setStakeForBet,
        openBetSlip,
        closeBetSlip,
        hasSelection,
      }}
    >
      {children}
    </BetSlipContext.Provider>
  );
};

export const useBetSlip = () => {
  const context = useContext(BetSlipContext);
  if (!context) {
    throw new Error('useBetSlip must be used within BetSlipProvider');
  }
  return context;
};
