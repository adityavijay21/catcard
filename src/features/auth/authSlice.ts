import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  username: string;
}

const initialState: AuthState = {
  username: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
    },
  },
});

export const { setUsername } = authSlice.actions;
export default authSlice.reducer;