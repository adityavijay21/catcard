import axios from 'axios';
import { GameState } from '../features/game/gameSlice';

export const saveGame = async (gameState: GameState) => {
  await axios.post('/save-game', gameState);
};

export const getSavedGame = async (username: string): Promise<GameState | null> => {
  try {
    const response = await axios.get<GameState>(`/load-game/${username}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};