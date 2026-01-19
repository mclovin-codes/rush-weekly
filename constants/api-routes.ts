export const API_ROUTES = {
    // ==================== SPORTS ====================
    SPORTS: {
      GET: '/api/sports',
      CREATE: '/api/sports',
      GET_BY_ID: (id: string) => `/api/sports/${id}`,
      UPDATE: (id: string) => `/api/sports/${id}`,
      DELETE: (id: string) => `/api/sports/${id}`,
    },
  
    // ==================== LEAGUES ====================
    LEAGUES: {
      GET: '/api/leagues',
      CREATE: '/api/leagues',
      GET_BY_ID: (id: string) => `/api/leagues/${id}`,
      UPDATE: (id: string) => `/api/leagues/${id}`,
      DELETE: (id: string) => `/api/leagues/${id}`,
    },
  
    // ==================== TEAMS ====================
    TEAMS: {
      GET: '/api/teams',
      CREATE: '/api/teams',
      GET_BY_ID: (id: string) => `/api/teams/${id}`,
      UPDATE: (id: string) => `/api/teams/${id}`,
      DELETE: (id: string) => `/api/teams/${id}`,
    },
  
    // ==================== GAMES ====================
    GAMES: {
      GET: '/api/games',
      CREATE: '/api/games',
      GET_BY_ID: (id: string) => `/api/games/${id}`,
      UPDATE: (id: string) => `/api/games/${id}`,
      DELETE: (id: string) => `/api/games/${id}`,
    },
  
    // ==================== GAME ODDS ====================
    GAME_ODDS: {
      GET: '/api/game-odds',
      CREATE: '/api/game-odds',
      GET_BY_ID: (id: string) => `/api/game-odds/${id}`,
      GET_BY_GAME: (gameId: string) => `/api/game-odds?where[game][equals]=${gameId}&where[isActive][equals]=true`,
      UPDATE: (id: string) => `/api/game-odds/${id}`,
      DELETE: (id: string) => `/api/game-odds/${id}`,
    },
  
    // ==================== POOLS ====================
    POOLS: {
      GET: '/api/pools',
      GET_ACTIVE: '/api/pools?where[is_active][equals]=true',
      CREATE: '/api/pools',
      GET_BY_ID: (id: string) => `/api/pools/${id}`,
      UPDATE: (id: string) => `/api/pools/${id}`,
      DELETE: (id: string) => `/api/pools/${id}`,
    },
  
    // ==================== POOL MEMBERSHIPS ====================
    POOL_MEMBERSHIPS: {
      GET: '/api/pool-memberships',
      CREATE: '/api/pool-memberships',
      GET_BY_ID: (id: string) => `/api/pool-memberships/${id}`,
      UPDATE: (id: string) => `/api/pool-memberships/${id}`,
      DELETE: (id: string) => `/api/pool-memberships/${id}`,
    },
  
    // ==================== BETS ====================
    BETS: {
      GET: '/api/bets',
      CREATE: '/api/bets',
      PLACE: '/api/bets/place',
      PARLAY: '/api/bets/parlay',
      GET_BY_ID: (id: string) => `/api/bets/${id}`,
      UPDATE: (id: string) => `/api/bets/${id}`,
      DELETE: (id: string) => `/api/bets/${id}`,
    },

    // ==================== USERS ====================
    USERS: {
      GET: '/api/users',
      GET_ME: '/api/users/me',
      GET_BY_ID: (id: string) => `/api/users/${id}`,
      UPDATE: (id: string) => `/api/users/${id}`,
      DELETE: (id: string) => `/api/users/${id}`,
      ACTIVATE_MEMBERSHIP: '/api/users/activate-membership',
      BUY_BACK_ELIGIBILITY: '/api/users/buy-back-eligibility',
      BUY_BACK_CREDITS: '/api/users/buy-back-credits',
    },

    // ==================== CUSTOM ENDPOINTS ====================
    CUSTOM: {
      PLACE_BET: '/api/custom/place-bet',
      LEADERBOARD: (poolId: string) => `/api/custom/leaderboard/${poolId}`,
      MY_POOL: '/api/custom/my-pool',
      MY_BETS: '/api/custom/my-bets',
    },
  };