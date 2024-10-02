import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import gameReducer from './features/game/gameSlice';
import leaderboardReducer from './features/leaderboard/leaderboardSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    leaderboard: leaderboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;