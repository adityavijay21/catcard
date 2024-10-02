import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import { API_URL } from './config';
import store from './store';
import Login from './features/auth/Login';
import Game from './features/game/Game';
import Leaderboard from './features/leaderboard/Leaderboard';

function App() {
  const [socket, setSocket] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    const newSocket = io(API_URL, {
      withCredentials: true,
    });
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('leaderboardUpdate', (updatedLeaderboard: any) => {
        setLeaderboard(updatedLeaderboard);
      });
    }
  }, [socket]);

  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gradient-to-b from-purple-400 to-blue-500 flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">Exploding Kittens Card Game</h1>
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/game" element={<Game />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              </Routes>
          </div>
        </div>
      </Router>
    </Provider>
  );
}

export default App;