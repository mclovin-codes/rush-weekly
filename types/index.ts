
export interface BaseDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Media extends BaseDocument {
  filename: string;
  mimeType: string;
  filesize: number;
  width?: number;
  height?: number;
  url: string;
  alt?: string;
}


export interface Sport extends BaseDocument {
  externalId: string;
  name: string;
}

export interface League extends BaseDocument {
  externalId: string;
  sport: string | Sport;
  name: string;
  active: boolean;
}

export interface Team extends BaseDocument {
  externalId: string;
  league: string | League;
  name: string;
  abbreviation?: string;
  logoUrl?: string;
}

export interface Game extends BaseDocument {
  externalId: string;
  league: string | League;
  homeTeam: string | Team;
  awayTeam: string | Team;
  startTime: string;
  status: 'scheduled' | 'live' | 'finalized' | 'canceled';
  homeScore?: number;
  awayScore?: number;
}

export interface GameOdds extends BaseDocument {
  game: string | Game;
  provider: string;
  moneyline?: {
    home?: number;
    away?: number;
  };
  spread?: {
    home?: number;
    point?: number;
    away?: number;
  };
  total?: {
    overPayout?: number;
    underPayout?: number;
    point?: number;
  };
  isActive: boolean;
}

export interface User extends BaseDocument {
  username: string;
  email: string;
  credits: number; // Alias for current_credits for backwards compatibility
  current_credits?: number;
  is_paid_member?: boolean;
  subscription_end_date?: string;
}

export interface Pool extends BaseDocument {
  weekStart: string;
  weekEnd: string;
  isActive: boolean;
}

export interface PoolMembership extends BaseDocument {
  pool: string | Pool;
  user: string | User;
  score: number;
}

export interface Bet extends BaseDocument {
  user: string | User;
  pool: string | Pool;
  game: string | Game;
  betType: 'moneyline' | 'spread' | 'total';
  selection: 'home' | 'away' | 'over' | 'under';
  stake: number;
  oddsAtPlacement: number;
  lineAtPlacement?: number;
  status: 'pending' | 'won' | 'lost' | 'push';
  payout: number;
}

// ==================== POPULATED TYPES ====================

export type PopulatedLeague = Populated<League, 'sport'> & {
  sport: Sport;
};

export type PopulatedTeam = Populated<Team, 'league'> & {
  league: League;
};

export type PopulatedGame = Populated<Game, 'league' | 'homeTeam' | 'awayTeam'> & {
  league: League;
  homeTeam: Team;
  awayTeam: Team;
};

export type PopulatedGameOdds = Populated<GameOdds, 'game'> & {
  game: PopulatedGame;
};

export type PopulatedPoolMembership = Populated<PoolMembership, 'pool' | 'user'> & {
  pool: Pool;
  user: User;
};

export type PopulatedBet = Populated<Bet, 'user' | 'pool' | 'game'> & {
  user: User;
  pool: Pool;
  game: PopulatedGame;
};


export interface GameFilters {
  leagueId?: string;
  status?: Game['status'];
  startTimeAfter?: string;
  startTimeBefore?: string;
  page?: number;
  limit?: number;
}

export interface BetFilters {
  userId?: string;
  poolId?: string;
  gameId?: string;
  status?: Bet['status'];
  page?: number;
  limit?: number;
}

export interface PoolMembershipFilters {
  poolId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface LeaderboardFilters {
  poolId: string;
  page?: number;
  limit?: number;
}

// ==================== REQUEST/RESPONSE TYPES ====================

export interface PlaceBetRequest {
  gameId: string;
  betType: Bet['betType'];
  selection: Bet['selection'];
  stake: number;
}

export interface PlaceBetResponse {
  bet: Bet;
  remainingCredits: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  score: number;
  totalBets: number;
  wonBets: number;
  lostBets: number;
}

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export type Populated<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] extends string | infer U
    ? U extends any[]
      ? U
      : U
    : T[P] extends (string | infer U)[]
      ? U[]
      : never;
};

