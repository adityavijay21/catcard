import axios from 'axios';

export interface LeaderboardEntry {
  username: string;
  points: number;
}

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const response = await axios.get<LeaderboardEntry[]>('/leaderboard');
  return response.data;
};