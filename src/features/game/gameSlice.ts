import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CardType = 'Cat' | 'Defuse' | 'Shuffle' | 'ExplodingKitten';

export interface GameState {
  deck: CardType[];
  drawnCard: CardType | null;
  gameOver: boolean;
  gameWon: boolean;
  defuseCards: number;
  score: number;
}

const initialState: GameState = {
  deck: [],
  drawnCard: null,
  gameOver: false,
  gameWon: false,
  defuseCards: 0,
  score: 0,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    startGame: (state, action: PayloadAction<CardType[]>) => {
      state.deck = action.payload;
      state.drawnCard = null;
      state.gameOver = false;
      state.gameWon = false;
      state.defuseCards = 0;
    },
    drawCard: (state) => {
      if (state.deck.length > 0) {
        const card = state.deck.pop()!;
        state.drawnCard = card;

        switch (card) {
          case 'Cat':
            break;
          case 'Defuse':
            state.defuseCards++;
            break;
          case 'Shuffle':
            if (state.deck.length === 0) {
              state.deck = shuffleDeck();
              state.defuseCards = 0;
            }
            break;
          case 'ExplodingKitten':
            if (state.defuseCards > 0) {
              state.defuseCards--;
            } else {
              state.gameOver = true;
              state.gameWon = false;
            }
            break;
        }

        if (state.deck.length === 0 && !state.gameOver) {
          state.gameWon = true;
          state.gameOver = true;
        }
      }
    },
    endGame: (state) => {
      state.gameOver = true;
    },
    setScore: (state, action: PayloadAction<number>) => {
      state.score = action.payload;
    },
    loadGame: (state, action: PayloadAction<GameState>) => {
      return { ...state, ...action.payload };
    },
  },
});

function shuffleDeck(): CardType[] {
  const cards: CardType[] = ['Cat', 'Cat', 'Defuse', 'Shuffle', 'ExplodingKitten'];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export const { startGame, drawCard, endGame, setScore, loadGame } = gameSlice.actions;
export default gameSlice.reducer;