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
  betType: 'spread' | 'total' | 'moneyline';
  betTypeLabel: string;
  selection: 'home' | 'away' | 'over' | 'under';
  odds: number;
  line?: number | null;
  // Keep reference to full game data for bet placement
  game: MarketGame;
}

interface BetSlipState {
  selections: BetSelection[];
  stakePerBet: number;
  isVisible: boolean;
}

interface BetSlipContextType extends BetSlipState {
  addSelection: (selection: BetSelection) => void;
  removeSelection: (id: string) => void;
  clearSelections: () => void;
  setStakePerBet: (amount: number) => void;
  openBetSlip: () => void;
  closeBetSlip: () => void;
  hasSelection: (id: string) => boolean;
}

const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined);

const initialState: BetSlipState = {
  selections: [],
  stakePerBet: 10,
  isVisible: false,
};

export const BetSlipProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<BetSlipState>(initialState);

  // Load bet slip from storage on mount
  useEffect(() => {
    loadBetSlip();
  }, []);

  // Save bet slip to storage whenever selections or stake changes
  useEffect(() => {
    if (state.selections.length > 0 || state.stakePerBet !== initialState.stakePerBet) {
      saveBetSlip();
    }
  }, [state.selections, state.stakePerBet]);

  const loadBetSlip = async () => {
    try {
      const saved = await AsyncStorage.getItem(BET_SLIP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          selections: parsed.selections || [],
          stakePerBet: parsed.stakePerBet || initialState.stakePerBet,
        }));
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
          stakePerBet: state.stakePerBet,
        })
      );
    } catch (error) {
      console.error('Failed to save bet slip:', error);
    }
  };

  const addSelection = (selection: BetSelection) => {
    setState(prev => {
      // Check if this exact bet already exists (toggle behavior)
      const exists = prev.selections.find(s => s.id === selection.id);

      if (exists) {
        // Remove it (toggle off)
        return {
          ...prev,
          selections: prev.selections.filter(s => s.id !== selection.id),
        };
      }

      // Add new selection
      return {
        ...prev,
        selections: [...prev.selections, selection],
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

  const clearSelections = () => {
    setState(prev => ({
      ...prev,
      selections: [],
      stakePerBet: initialState.stakePerBet,
    }));
  };

  const setStakePerBet = (amount: number) => {
    setState(prev => ({ ...prev, stakePerBet: amount }));
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
        stakePerBet: state.stakePerBet,
        isVisible: state.isVisible,
        addSelection,
        removeSelection,
        clearSelections,
        setStakePerBet,
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
