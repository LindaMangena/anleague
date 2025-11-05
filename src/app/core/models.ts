export type Position = 'GK' | 'DF' | 'MD' | 'AT';

export interface Player {
  id: string;
  name: string;
  natural: Position;        // natural position
  ratings: Record<Position, number>; // 50–100 for natural, 0–50 for others
  captain?: boolean;
}

export interface Team {
  id: string;
  country: string;
  manager: string;
  players: Player[];         // must be 23
  teamRating: number;        // avg of squad ratings (avg of each player's natural rating)
  createdAt: string;
}

export type RoundCode = 'QF' | 'SF' | 'F';
export const RoundOrder: RoundCode[] = ['QF', 'SF', 'F'];

export interface GoalEvent {
  minute: number;
  playerName: string;
  teamId: string;
}

export interface CommentaryEvent {
  minute: number;
  text: string;
}

export type MatchStatus = 'pending' | 'played' | 'simulated';

export interface Match {
  id: string;
  round: RoundCode;
  homeId: string;
  awayId: string;
  scheduledAt?: string; // optional for demo
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  goals: GoalEvent[];  // includes teamId and minute
  commentary?: CommentaryEvent[]; // only for played
  winnerId?: string;   // set when finished
  nextMatchId?: string; // link to next match in bracket
}
