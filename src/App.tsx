import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import Login from './features/auth/Login';
import Game from './features/game/Game';
import Leaderboard from './features/leaderboard/Leaderboard';

function App() {
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