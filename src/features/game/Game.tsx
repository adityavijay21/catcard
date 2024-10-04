import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { drawCard, startGame, setScore, loadGame } from './gameSlice';
import { useNavigate } from 'react-router-dom';
import { setUsername } from '../auth/authSlice';
import io from 'socket.io-client';
import { API_URL } from '../../config';

const socket = io(API_URL);

const Game: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useSelector((state: RootState) => state.auth);
  const { deck, drawnCard, gameOver, gameWon, defuseCards, score } = useSelector((state: RootState) => state.game);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      navigate('/login');
    } else {
      loadSavedGame();
    }

    socket.on('leaderboardUpdate', (data) => {
      console.log('Leaderboard updated:', data);
    });

    return () => {
      socket.off('leaderboardUpdate');
    };
  }, [username, navigate]);

  useEffect(() => {
    if (gameOver) {
      fetch('http://localhost:8080/api/game/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, won: gameWon }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          dispatch(setScore(data.score));
        }
      });
    }
  }, [gameOver, gameWon, username, dispatch]);

  useEffect(() => {
    if (username) {
      saveGame();
    }
  }, [deck, drawnCard, gameOver, gameWon, defuseCards, score, username]);

  const loadSavedGame = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/game/load/${username}`);
      if (response.ok) {
        const data = await response.json();
        dispatch(loadGame(data));
      } else {
        handleStartGame();
      }
    } catch (error) {
      console.error('Failed to load game:', error);
      handleStartGame();
    } finally {
      setIsLoading(false);
    }
  };

  const saveGame = async () => {
    try {
      await fetch(`${API_URL}/api/game/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          gameState: { deck, drawnCard, gameOver, gameWon, defuseCards, score }
        }),
      });
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  };

  const handleStartGame = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/game/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        throw new Error('Failed to start game');
      }
      const data = await response.json();
      dispatch(startGame(data.deck));
      dispatch(setScore(data.score));
    } catch (error) {
      console.error('Failed to start game:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrawCard = () => {
    dispatch(drawCard());
  };

  const handleViewLeaderboard = () => {
    navigate('/leaderboard');
  };

  const handleLogout = () => {
    dispatch(setUsername(''));
    navigate('/login');
  };

  const getCardEmoji = (card: string) => {
    switch (card) {
      case 'Cat': return '😼';
      case 'Defuse': return '🙅‍♂️';
      case 'Shuffle': return '🔀';
      case 'ExplodingKitten': return '💣';
      default: return '🂠';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 relative">
      <button 
        onClick={handleLogout}
        className="absolute top-2 right-2 py-1 px-3 bg-red-500 text-white text-sm font-semibold rounded-md shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors duration-200"
      >
        Logout
      </button>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome, {username}!</h2>
      <p className="text-center text-gray-600 mb-4">Total Points: {score}</p>
      <div className="flex justify-center items-center h-32 mb-6">
        {drawnCard ? (
          <div className="text-7xl">{getCardEmoji(drawnCard)}</div>
        ) : (
          <div className="text-7xl">🂠</div>
        )}
      </div>
      {!gameOver && deck.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span>Cards left: {deck.length}</span>
            <span>Defuse cards: {defuseCards}</span>
          </div>
          <button 
            onClick={handleDrawCard}
            className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
          >
            Draw Card
          </button>
        </div>
      )}
      {gameOver && (
        <div className="space-y-4">
          <p className="text-center text-2xl font-bold text-gray-800">{gameWon ? 'You won!' : 'Game over!'}</p>
          <button 
            onClick={handleStartGame}
            className={`w-full py-2 px-4 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-colors duration-200 ${
              gameWon 
                ? 'bg-green-500 hover:bg-green-600 focus:ring-green-400' 
                : 'bg-red-500 hover:bg-red-600 focus:ring-red-400'
            }`}
          >
            Start New Game
          </button>
        </div>
      )}
      <button 
        onClick={handleViewLeaderboard}
        className="w-full mt-4 py-2 px-4 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-colors duration-200"
      >
        View Leaderboard
      </button>
    </div>
  );
};

export default Game;