export interface Sport {
  id: string;
  externalId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface League {
  id: string;
  externalId: string;
  sport: string | Sport;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  externalId: string;
  league: string | League;
  name: string;
  abbreviation?: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  externalId: string;
  league: string | League;
  homeTeam: string | Team;
  awayTeam: string | Team;
  startTime: string;
  status: 'scheduled' | 'live' | 'finalized' | 'canceled';
  homeScore?: number;
  awayScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameOdds {
  id: string;
  game: string | Game;
  provider: string;
  moneyline?: {
    home: number;
    away: number;
  };
  spread?: {
    home: number;
    point: number;
    away: number;
  };
  total?: {
    overPayout: number;
    underPayout: number;
    point: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pool {
  id: string;
  week_start: string;
  week_end: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PoolMembership {
  id: string;
  pool: string | Pool;
  user: string | User;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bet {
  id: string;
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
  createdAt: string;
  updatedAt: string;
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

export interface QueryParams {
  limit?: number;
  page?: number;
  sort?: string;
  depth?: number;
  where?: Record<string, any>;
}

export interface OnboardingResponse {
  message: string;
  credits: number;
  is_paid_member: boolean;
  subscription_end_date: string;
  pool_id: string;
}

export interface OnboardingErrorResponse {
  error: string;
  message: string;
}
