BetSlip Multi-Selection Implementation Guide 
Overview 
This guide transforms your single-bet slip into a multi-bet slip that supports: 
Multiple bet selections in one slip 
Straight bets (each bet placed individually) 
• 
Parlay bets (all bets combined) 
• 
Persistent bet slip state across navigation 
CURRENT IMPLEMENTATION (Single Bet Only) 
Current BetSlip State Structure (PROBLEM) 
typescript 
// X CURRENT - Only stores ONE bet 
interface BetSlipState { 
} 
selectedBet: Bet | null; 
stake: number; 
is Visible: boolean; 
// When user selects a bet, it REPLACES the previous one 
const openBetSlip = (bet: Bet) => { 
setBetSlipState({ 
selectedBet: bet, //X This overwrites any previous selection 
stake: 250, 
is Visible: true 
}); 
}; 
Current BetSlip Component (PROBLEM) 
typescript 
//X CURRENT - Shows only ONE pick 
const BetSlip =() => { 
const { selectedBet, stake, is Visible } = useBetSlipState(); 
if (!selectedBet) return null; 
return ( 
<Modal visible={isVisible}> 
<View> 
{/*Shows single bet only */} 
<Text>YOUR PICK (MONEYLINE)</Text> 
<View> 
<Text>{selectedBet.teamName}</Text> 
<Text>{selectedBet.odds > 0? '+': "} {selectedBet.odds}</Text> 
</View> 
{/*Bet amount input */} 
<TextInput 
value={stake.toString()} 
onChangeText={(val) => setStake(Number(val))} 
{/* Potential win calculation (single bet only) */} 
<Text>Potential Win: {calculateWin(stake, selectedBet.odds)}</Text> 
{/* Place bet button */} 
<Button onPress={placeBet}> 
Place Bet - {stake} units 
</Button> 
</View> 
</Modal> 
); 
}; 
Current Issues: 
1. X Selecting a new bet clears the previous selection 
X 
2. Closing the modal loses the bet slip data 
3. No way to accumulate multiple bets 
4. No parlay option 
5. Bet slip state lives in component state (not persistent) 
NEW IMPLEMENTATION (Multi-Bet with Parlay Support) 
Step 1: Update State Management 
NEW BetSlip State Structure 
typescript 
NEW - Stores ARRAY of bets 
interface BetSelection { 
} 
id: string; 
gameId: string; 
teamName: string; 
matchup: string; // "Panthers @ Bucs" 
betType: string; // "Moneyline", "Spread -3.5", etc. 
odds: number; 
gameTime: string; 
interface BetSlipState { 
} 
selections: BetSelection[]; // Array of bets 
betType: 'straight' | 'parlay'; 
stakePerBet: number; 
is Visible: boolean; 
// Initial state 
const initialState: BetSlipState = { 
}; 
selections: [], 
betType: 'straight', 
stakePerBet: 250, 
is Visible: false 
Context Provider Implementation 
typescript 
//providers/BetSlipProvider.tsx 
import React, { createContext, useContext, useState, useEffect } from 'react'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
interface BetSlipContextType { 
selections: BetSelection[]; 
betType: 'straight' | 'parlay'; 
stakePerBet: number; 
is Visible: boolean; 
addSelection: (bet: BetSelection) => void; 
removeSelection: (id: string) => void; 
toggleBetType: () => void; 
setStakePerBet: (amount: number) => void; 
openBetSlip: () => void; 
} 
closeBetSlip: () => void; 
clearBetSlip: () => void; 
placeBets: () => Promise<void>; 
const BetSlipContext = createContext<BetSlipContextType | undefined>(undefined); 
export const BetSlipProvider: React.FC = ({ children }) => { 
const [state, setState] = useState<BetSlipState>(initialState); 
// Load bet slip from storage on mount 
useEffect(() => { 
loadBetSlip(); 
}, []); 
Save bet slip to storage whenever it changes 
useEffect(() => { 
saveBetSlip(); 
}, [state.selections, state.betType, state.stakePerBet]); 
const loadBetSlip = async () => { 
try { 
const saved = await AsyncStorage.getItem('betSlip'); 
if (saved) { 
const parsed = JSON.parse(saved); 
setState(prev => ({ 
...prev, 
selections: parsed.selections || [], 
betType: parsed.betType || 'straight', 
}: 
} 
stakePerBet: parsed.stakePerBet || 250 
})); 
} catch (error) { 
} 
console.error('Failed to load bet slip:', error); 
const saveBetSlip = async () => { 
try { 
await AsyncStorage.setItem('betSlip', JSON.stringify({ 
selections: state.selections, 
betType: state.betType, 
stakePerBet: state.stakePerBet 
})); 
} catch (error) { 
} 
}; 
// 
console.error('Failed to save bet slip:', error); 
ADD bet to selections (doesn't replace existing ones) 
const addSelection = (bet: BetSelection) => { 
setState(prev => { 
// Check if this bet is already in the slip 
const exists = prev.selections.find(s => s.id 
if (exists) { 
bet.id); 
// If already selected, remove it (toggle behavior) 
return { 
...prev, 
selections: prev.selections.filter(s => s.id !== bet.id), 
is Visible: true 
}; 
}; 
} 
// Add new selection 
return { 
}; 
}); 
...prev, 
selections: [...prev.selections, bet], 
is Visible: true 
const removeSelection = (id: string) => { 
}; 
setState(prev => ({ 
...prev, 
selections: prev.selections.filter(s => s.id !== id) 
})); 
const toggleBetType = () => { 
setState(prev => ({ 
...prev, 
betType: prev.betType 'straight' ? 'parlay' : 'straight' 
})); 
}; 
const setStakePerBet = (amount: number) => { 
}; 
setState(prev => ({ ...prev, stakePerBet: amount })); 
const openBetSlip = () => { 
}; 
setState(prev => ({ ...prev, is Visible: true })); 
const closeBetSlip = () => { 
}; 
setState(prev => ({ ...prev, isVisible: false })); 
const clearBetSlip = 0) => { 
setState(prev => ({ 
...prev, 
selections: [], 
betType: 'straight', 
stakePerBet: 250 
})); 
}; 
const placeBets = async () => { 
try { 
// Your API call to place bets 
if (state.betType 
'straight') { 
// Place each bet individually 
for (const selection of state.selections) { 
} 
await placeSingleBet(selection, state.stakePerBet); 
} else { 
// Place parlay bet 
}; 
} 
await placeParlayBet(state.selections, state.stakePerBet); 
// Clear bet slip on success 
clearBetSlip(); 
closeBetSlip(); 
// Show success message 
Alert.alert('Success', 'Bets placed successfully!'); 
} catch (error) { 
} 
Alert.alert('Error', 'Failed to place bets'); 
return ( 
<BetSlipContext.Provider 
value={{ 
selections: state.selections, 
betType: state.betType, 
stakePerBet: state.stakePerBet, 
is Visible: state.is Visible, 
addSelection, 
removeSelection, 
); 
}; 
toggleBetType, 
setStakePerBet, 
openBetSlip, 
closeBetSlip, 
clearBetSlip, 
placeBets 
}} 
{children} 
</BetSlipContext.Provider> 
export const useBetSlip = () => { 
const context = useContext(BetSlipContext); 
if (!context) { 
} 
throw new Error('useBetSlip must be used within BetSlipProvider'); 
return context; 
}; 
Step 2: Update Game Selection Component 
typescript 
// When user taps an odds button on a game card 
const GameCard = ({ game }) => { 
const { addSelection } = useBetSlip(); 
const handleOddsPress = (team: string, odds: number, betType: string) { 
const selection: BetSelection 
}; 
{ 
id: `${game.id} -${team}-${betType}, // Unique ID 
gameld: game.id, 
team Name: team, 
matchup: `${game.awayTeam} @ ${game.homeTeam}`, 
betType: betType, 
odds: odds, 
gameTime: game.startTime 
This ADDS to selections instead of replacing 
addSelection(selection); 
}; 
return ( 
<View style={styles.gameCard}> 
<Text>{game.awayTeam} @ {game.homeTeam}</Text> 
{/*Moneyline odds */} 
<View style={styles.oddsRow}> 
<TouchableOpacity 
onPress={() => handleOddsPress(game.awayTeam, game.awayML, 'Moneyline')} 
<Text>{game.awayML>0? '+': "} {game.awayML}</Text> 
</TouchableOpacity> 
<TouchableOpacity 
onPress={() => handleOddsPress(game.home Team, game.homeML, 'Moneyline')} 
<Text>{game.homeML> 0 ? '+': "} {game.homeML}</Text> 
</TouchableOpacity> 
</View> 
</View> 
); 
}; 
Step 3: New BetSlip Component with Multi-Selection 
typescript 
// components/BetSlip.tsx 
import React from 'react'; 
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native'; 
import { useBetSlip } from '../providers/BetSlipProvider'; 
const BetSlip = () => { 
const { 
selections, 
betType, 
stakePerBet, 
is Visible, 
removeSelection, 
toggleBetType, 
setStakePerBet, 
closeBetSlip, 
clearBetSlip, 
placeBets 
} = useBetSlip(); 
// Calculate potential winnings 
const calculateStraightWinnings = () => { 
let totalWin = 0; 
let totalStake = stakePerBet * selections.length; 
<= 
selections.forEach(sel => { 
const win = sel.odds > 0 
? (stakePerBet* (sel.odds / 100)) 
: (stakePerBet* (100 / Math.abs(sel.odds))); 
totalWin += stakePerBet + win; 
}); 
return { 
}; 
potential Win: totalWin.toFixed(2), 
profit: (totalWin - totalStake).toFixed(2), 
totalStake 
}; 
const calculateParlay Winnings = ( 
let combinedOdds = 1; 
selections.forEach(sel => { 
const decimal= sel.odds > 0 
{ 
? 1 + (sel.odds / 100) 
: 1+ (100 / Math.abs(sel.odds)); 
combinedOdds *= decimal; 
}); 
const potentialWin = stakePerBet* combinedOdds; 
const profit = potential Win - stakePerBet; 
return { 
potential Win: potentialWin.toFixed(2), 
profit: profit.toFixed(2), 
totalStake: stakePerBet 
}; 
}; 
const winnings = betType 
? calculateStraight Winnings() 
: calculate Parlay Winnings(); 
'straight' 
return ( 
<Modal 
visible={is Visible} 
animationType="slide" 
presentationStyle="pageSheet" 
<View style={styles.container}> 
{/*Header */} 
<View style={styles.header}> 
<TouchableOpacity onPress={closeBetSlip}> 
<Text style={styles.closeButton}>X</Text> 
</TouchableOpacity> 
<Text style={styles.headerTitle}>BET SLIP</Text> 
<TouchableOpacity onPress={clearBetSlip}> 
<Text style={styles.clearButton}>Clear All</Text> 
</TouchableOpacity> 
</View> 
{/* Empty State */ 
=== 
{selections.length 0?( 
<View style={styles.emptyState}> 
<Text style={styles.emptyText}> 
Select games to add to your bet slip 
</Text> 
</View> 
): ( 
<ScrollView style={styles.content}> 
{/* Selections List */} 
<Text style={styles.sectionTitle}>YOUR PICKS</Text> 
{selections.map(selection => ( 
<View key={selection.id} style={styles.selectionCard}> 
<View style={styles.selectionHeader}> 
<View> 
<Text style={styles.matchup}>{selection.matchup}</Text> 
<Text style={styles.betType}>{selection.betType}</Text> 
</View> 
<TouchableOpacity 
onPress={() => removeSelection(selection.id)} 
style={styles.removeButton} 
<Text style={styles.removeButtonText}>X</Text> 
</TouchableOpacity> 
</View> 
<View style={styles.selectionDetails}> 
<Text style={styles.teamName}>{selection.teamName}</Text> 
<Text style={styles.odds}> 
{selection.odds > 0? '+': "} {selection.odds} 
</Text> 
</View> 
</View> 
))} 
{/* Bet Type Toggle (only show if 2+ selections) */} 
{selections.length >= 2 && ( 
<View style={styles.betTypeSection}> 
<Text style={styles.sectionTitle}>BET TYPE</Text> 
<View style={styles.betTypeToggle}> 
<TouchableOpacity 
style={[ 
]} 
styles.betTypeButton, 
betType 
'straight' && styles.betTypeButtonActive 
onPress={() => betType !== 'straight' && toggleBetType()} 
<Text style={[ 
styles.betTypeButtonText, 
betType 
]}> 
Straight Bets 
='straight' && styles.betTypeButtonTextActive 
}} 
</Text> 
<Text style={styles.betTypeDescription}> 
{selections.length} separate bets 
</Text> 
</TouchableOpacity> 
<TouchableOpacity 
style={[ 
]} 
styles.betTypeButton, 
betType === 'parlay' && styles.betTypeButtonActive 
onPress={() => betType !== 'parlay' && toggleBetType()} 
<Text style={[ 
styles.betTypeButtonText, 
betType 
]}> 
'parlay' && styles.betTypeButtonTextActive 
Parlay 
</Text> 
<Text style={styles.betTypeDescription}> 
All must win 
</Text> 
</TouchableOpacity> 
</View> 
</View> 
{/* Bet Amount */} 
<View style={styles.betAmountSection}> 
<Text style={styles.sectionTitle}>BET AMOUNT</Text> 
<TextInput 
style={styles.betAmountInput} 
value={stakePerBet.toString()} 
onChangeText={(val) => setStakePerBet(Number(val) || 0)} 
keyboardType="number-pad" 
placeholder="Enter amount" 
<Text style={styles.unitsLabel}>units</Text> 
{/* Quick stake buttons */ 
<View style={styles.quickStakes}> 
{[10, 25, 50, 100].map(amount => ( 
<TouchableOpacity 
key={amount} 
style={styles.quickStakeButton} 
onPress={() => setStakePerBet(amount)} 
<Text style={styles.quickStakeText}>{amount}</Text> 
</TouchableOpacity> 
))} 
</View> 
{/* Show total stake for straight bets */} 
{betType= 'straight' && selections.length > 1 && ( 
)} 
<Text style={styles.totalStakeNote}> 
{stakePerBet} units {selections.length} bets = {winnings.totalStake} total units 
</Text> 
</View> 
)} 
{/* Potential Win */} 
<View style={styles.winningsSection}> 
<View style={styles.winningsRow}> 
<Text style={styles.winningsLabel}>Potential Win</Text> 
<Text style={styles.winnings Value}>{winnings.potentialWin} units</Text> 
</View> 
<View style={styles.winningsRow}> 
<Text style={styles.profitLabel}>Profit</Text> 
<Text style={[ 
styles.profitValue, 
{ color: Number(winnings.profit) > 0 ? '#10B981' : '#EF4444' } 
}}> 
{Number(winnings.profit) > 0 ? '+' : "} {winnings.profit} units 
</Text> 
</View> 
</View> 
</ScrollView> 
{/* Place Bet Button */} 
{selections.length > 0 && ( 
<View style={styles.footer}> 
<TouchableOpacity 
style={styles.placeBetButton} 
onPress={placeBets} 
<Text style={styles.placeBetButtonText}> 
Place Bet{selections.length > 1 ? 's': "} - {winnings.totalStake} units 
</Text> 
</TouchableOpacity> 
</View> 
}} 
</View> 
</Modal> 
); 
}; 
const styles = StyleSheet.create({ 
container: { 
}, 
flex: 1, 
backgroundColor: '#0F172A', 
header: { 
}, 
flexDirection: 'row', 
justifyContent: 'space-between', 
alignItems: 'center', 
padding: 20, 
borderBottom Width: 1, 
borderBottomColor: '#1E293B', 
closeButton: { 
fontSize: 24, 
color: '#F1F5F9', 
}, 
headerTitle: { 
fontSize: 18, 
fontWeight: 'bold', 
color: '#F1F5F9', 
}, 
clearButton: { 
fontSize: 14, 
}, 
color: '#EF4444', 
content: { 
flex: 1, 
padding: 20, 
}, 
emptyState: { 
}, 
flex: 1, 
justifyContent: 'center', 
alignItems: 'center', 
emptyText: { 
fontSize: 16, 
color: '#94A3B8', 
textAlign: 'center', 
}, 
sectionTitle: { 
}, 
fontSize: 12, 
fontWeight: '600', 
color: '#94A3B8', 
marginBottom: 12, 
marginTop: 20, 
selectionCard: { 
backgroundColor: '#1E293B', 
borderRadius: 12, 
padding: 16, 
marginBottom: 12, 
}, 
selectionHeader: { 
}, 
flexDirection: 'row', 
justifyContent: 'space-between', 
marginBottom: 8, 
matchup: { 
fontSize: 14, 
color: '#F1F5F9', 
fontWeight: '600', 
}, 
betType: { 
fontSize: 12, 
color: '#94A3B8', 
marginTop: 4, 
}, 
removeButton: { 
}, 
width: 24, 
height: 24, 
borderRadius: 12, 
backgroundColor: '#EF4444', 
justifyContent: 'center', 
alignItems: 'center', 
removeButtonText: { 
color: '#FFF', 
fontSize: 14, 
}, 
fontWeight: 'bold', 
selectionDetails: { 
flexDirection: 'row', 
justifyContent: 'space-between', 
}, 
alignItems: 'center', 
teamName: { 
fontSize: 16, 
}, 
ག 
color: '#F1F5F9', 
fontWeight: 'bold', 
odds: { 
fontSize: 16, 
color: '#3B82F6', 
fontWeight: 'bold', 
}, 
betTypeSection: { 
marginTop: 20, 
}, 
betTypeToggle: { 
flexDirection: 'row', 
}, 
gap: 12, 
betTypeButton: { 
}, 
flex: 1, 
padding: 16, 
borderRadius: 12, 
borderWidth: 2, 
borderColor: '#1E293B', 
backgroundColor: '#1E293B', 
betTypeButtonActive: { 
}, 
borderColor: '#3B82F6', 
backgroundColor: '#1E3A5F', 
betTypeButtonText: { 
}, 
fontSize: 16, 
fontWeight: '600', 
color: '#94A3B8', 
textAlign: 'center', 
betTypeButtonTextActive: { 
color: '#3B82F6', 
}, 
betTypeDescription: { 
}, 
fontSize: 12, 
color: '#94A3B8', 
textAlign: 'center', 
marginTop: 4, 
betAmountSection: { 
}, 
marginTop: 20, 
bet AmountInput: { 
backgroundColor: '#1E293B', 
borderRadius: 12, 
padding: 16, 
fontSize: 24, 
fontWeight: 'bold', 
color: '#F1F5F9', 
textAlign: 'center', 
}, 
unitsLabel: { 
fontSize: 14, 
color: '#94A3B8', 
textAlign: 'right', 
marginTop: 8, 
}, 
quickStakes: { 
flexDirection: 'row', 
}, 
gap: 12, 
marginTop: 16, 
quickStakeButton: { 
flex: 1, 
padding: 12, 
borderRadius: 8, 
backgroundColor: '#1E293B', 
borderWidth: 1, 
borderColor: '#334155', 
}, 
quickStake Text: { 
}, 
fontSize: 16, 
fontWeight: '600', 
color: '#F1F5F9', 
textAlign: 'center', 
totalStakeNote: { 
fontSize: 12, 
color: '#94A3B8', 
}, 
textAlign: 'center', 
marginTop: 12, 
winningsSection: { 
marginTop: 24, 
}, 
padding: 16, 
backgroundColor: '#1E293B', 
ན 
borderRadius: 12, 
winningsRow: { 
flexDirection: 'row', 
justifyContent: 'space-between', 
}, 
marginBottom: 8, 
winningsLabel: { 
fontSize: 14, 
color: '#94A3B8', 
}, 
winnings Value: { 
}, 
fontSize: 16, 
fontWeight: 'bold', 
color: '#F1F5F9', 
profitLabel: { 
fontSize: 14, 
color: '#94A3B8', 
}, 
profitValue: { 
fontSize: 18, 
}, 
fontWeight: 'bold', 
ག 
footer: { 
padding: 20, 
border Top Width: 1, 
borderTopColor: '#1E293B', 
}, 
placeBetButton: { 
}, 
backgroundColor: '#3B82F6', 
borderRadius: 12, 
padding: 18, 
placeBetButtonText: { 
fontSize: 16, 
fontWeight: 'bold', 
color: '#FFF', 
textAlign: 'center', 
}, 
}); 
export default BetSlip; 
Step 4: Add Bet Slip Badge to Show Count 
typescript 
// Add this to your tab navigator or wherever the bet slip button lives 
const BetSlipButton = () => { 
const { selections, openBetSlip } = useBetSlip(); 
return ( 
<TouchableOpacity onPress={openBetSlip} style={styles.betSlipButton}> 
<Text>Bet Slip</Text> 
{selections.length > 0 && ( 
<View style={styles.badge}> 
<Text style={styles.badgeText}>{selections.length}</Text> 
</View> 
</TouchableOpacity> 
)} 
); 
}; 
const styles = StyleSheet.create({ 
betSlipButton: { 
position: 'relative', 
}, 
badge: { 
position: 'absolute', 
}, 
top: -5, 
right: -5, 
backgroundColor: '#EF4444', 
borderRadius: 10, 
width: 20, 
height: 20, 
justifyContent: 'center', 
alignItems: 'center', 
badgeText: { 
color: '#FFF', 
}, 
}); 
fontSize: 12, 
fontWeight: 'bold', 
IMPLEMENTATION CHECKLIST 
Phase 1: State Management (Priority 1) 
Create (BetSlipProvider.tsx) with the new state structure 
Wrap your app with <BetSlipProvider>) in App.tsx 
Install AsyncStorage: [npm install @react-native-async-storage/async-storage 
Test that state persists when closing/reopening app 
Phase 2: Update Selection Logic (Priority 1) 
Update all odds buttons to use (addSelection() instead of (setSelectedBet()) 
Ensure each bet gets a unique ID 
Test that multiple bets can be added to slip 
Test that closing bet slip doesn't clear selections 
Phase 3: New BetSlip Component (Priority 2) 
Replace existing BetSlip component with multi-selection version Implement selection cards with remove buttons 
Add bet type toggle (only visible when 2+ selections) 
Update payout calculations for both straight and parlay 
Phase 4: UI Polish (Priority 3) 
Add bet slip badge showing count 
Add visual feedback when bet is added (toast/haptic) 
Add confirmation dialog before placing bets 
Add loading state during bet placement 
Add success/error toasts after placement 
Phase 5: Edge Cases (Priority 3) 
Handle insufficient units for straight bets 
Prevent duplicate bets (same game, same bet type) 
Lock bets when games start 
Handle bet slip when new week starts (clear old selections) 
Add max selections limit (e.g., 10 bets max) 
TESTING CHECKLIST 
Test these scenarios: 
1. 
Add single bet→→ opens bet slip → close slip 
→ bet remains 
2. 
Add 3 different bets → all show in slip 
3. 
Remove individual bet →→→ others remain 
4. 
Toggle between straight/parlay 
payouts update correctly 
5. 
Place straight bets → → deducts (stake × count) from balance 
6. 
✓ Place parlay bet→→ deducts single stake from balance 
7. 
✓Close app → reopen 
→ bet slip persists 
8. 
Clear all → 
slip empties 
9. 
Try to add same bet twice → removes it (toggle behavior) 
10. 
Start new week old bets auto-clear 
KEY DIFFERENCES SUMMARY 
Feature 
Current (Single Bet) 
New (Multi-Bet) 
selectedBet: Bet | null 
State structure 
Adding bets 
Replaces previous 
Bet slip close 
Loses data 
selections: BetSelection[] 
Appends to array 
Persists data 
Bet types 
Storage 
Badge 
Single only 
Component state 
No count 
Straight + Parlay 
AsyncStorage + Context 
Shows selection count 
Payout calc 
Single bet only 
Different for straight/parlay 
