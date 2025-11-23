export interface Game {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: Date;
  isLive: boolean;
  moneyline: {
    home: number;
    away: number;
  };
  spread?: {
    home: number;
    away: number;
    homeOdds: number;
    awayOdds: number;
  };
  total?: {
    line: number;
    overOdds: number;
    underOdds: number;
  };
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  rank: number;
  units: number;
  change: number;
  potentialWinnings: number;
  isUser: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  currentPool: string;
  rank: number;
  totalPlayers: number;
  units: number;
  weeklyChange: number;
  betsPlaced: number;
  winRate: number;
  biggestWin: number;
  currentStreak: number;
  friends: Friend[];
}

export interface Friend {
  id: string;
  username: string;
  units: number;
  change: number;
}

export interface BetSlipEntry {
  id: string;
  game: Game;
  betType: 'moneyline' | 'spread' | 'total';
  selection: string;
  odds: number;
  stake: number;
  potentialReturn: number;
}

// Mock Data
export const mockGames: Game[] = [
  {
    id: '1',
    sport: 'NFL',
    league: 'NFL',
    homeTeam: 'Buffalo Bills',
    awayTeam: 'Miami Dolphins',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    isLive: false,
    moneyline: {
      home: 120,
      away: -140
    },
    spread: {
      home: -2.5,
      away: 2.5,
      homeOdds: -110,
      awayOdds: -110
    },
    total: {
      line: 48.5,
      overOdds: -110,
      underOdds: -110
    }
  },
  {
    id: '2',
    sport: 'NFL',
    league: 'NFL',
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Las Vegas Raiders',
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    isLive: false,
    moneyline: {
      home: -300,
      away: 240
    },
    spread: {
      home: -7.5,
      away: 7.5,
      homeOdds: -110,
      awayOdds: -110
    },
    total: {
      line: 45.5,
      overOdds: -105,
      underOdds: -115
    }
  },
  {
    id: '3',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Boston Celtics',
    startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago (live)
    isLive: true,
    moneyline: {
      home: -110,
      away: -110
    },
    spread: {
      home: -1.5,
      away: 1.5,
      homeOdds: -110,
      awayOdds: -110
    },
    total: {
      line: 220.5,
      overOdds: -110,
      underOdds: -110
    }
  },
  {
    id: '4',
    sport: 'NBA',
    league: 'NBA',
    homeTeam: 'Golden State Warriors',
    awayTeam: 'Phoenix Suns',
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    isLive: false,
    moneyline: {
      home: -140,
      away: 120
    }
  },
  {
    id: '5',
    sport: 'Soccer',
    league: 'Premier League',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    isLive: false,
    moneyline: {
      home: 210,
      away: 125
    },
    spread: {
      home: 0.5,
      away: -0.5,
      homeOdds: -105,
      awayOdds: -125
    }
  }
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    id: '1',
    username: 'SportsMaster',
    rank: 1,
    units: 1450,
    change: 450,
    potentialWinnings: 1000,
    isUser: false
  },
  {
    id: '2',
    username: 'BetKing',
    rank: 2,
    units: 1380,
    change: 380,
    potentialWinnings: 600,
    isUser: false
  },
  {
    id: '3',
    username: 'LuckyLarry',
    rank: 3,
    units: 1320,
    change: 320,
    potentialWinnings: 400,
    isUser: false
  },
  // ... more entries
  {
    id: '23',
    username: 'You',
    rank: 23,
    units: 980,
    change: -20,
    potentialWinnings: 0,
    isUser: true
  },
  // ... more entries to make it 97 total
];

export const mockUserProfile: UserProfile = {
  id: 'user1',
  username: 'player123',
  currentPool: 'Pool C',
  rank: 23,
  totalPlayers: 97,
  units: 980,
  weeklyChange: -20,
  betsPlaced: 12,
  winRate: 58,
  biggestWin: 120,
  currentStreak: 2,
  friends: [
    {
      id: '1',
      username: 'SportsMaster',
      units: 1450,
      change: 450
    },
    {
      id: '2',
      username: 'BetKing',
      units: 1380,
      change: 380
    },
    {
      id: '3',
      username: 'UserName3',
      units: 920,
      change: -80
    }
  ]
};

export const mockFilters = [
  'All',
  'Live Now',
  'Today',
  'Tomorrow',
  'Soccer',
  'Basketball',
  'Football'
];