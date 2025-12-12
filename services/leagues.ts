import { apiHelpers } from "@/config/api";

export interface League {
  id: string;
  externalId: string;
  sport: string | Sport;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Sport {
  id: string;
  externalId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaguesResponse {
  docs: League[];
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

export interface GetLeaguesParams {
  active?: boolean;
  limit?: number;
  page?: number;
  depth?: number;
}

/**
 * Fetch all leagues from the API
 */
export const getLeagues = async (params?: GetLeaguesParams): Promise<LeaguesResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.active !== undefined) {
    queryParams.append('where[active][equals]', String(params.active));
  }
  if (params?.limit) {
    queryParams.append('limit', String(params.limit));
  }
  if (params?.page) {
    queryParams.append('page', String(params.page));
  }
  if (params?.depth) {
    queryParams.append('depth', String(params.depth));
  }

  const url = `/api/leagues${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiHelpers.get<LeaguesResponse>(url);
};

/**
 * Fetch a single league by ID
 */
export const getLeagueById = async (id: string, depth?: number): Promise<League> => {
  const queryParams = new URLSearchParams();
  if (depth) {
    queryParams.append('depth', String(depth));
  }

  const url = `/api/leagues/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiHelpers.get<League>(url);
};
