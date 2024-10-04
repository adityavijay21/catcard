import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import io from 'socket.io-client';
import { API_URL } from '../../config';

const socket = io(API_URL);

interface LeaderboardEntry {
  username: string;
  score: number;
}

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { username } = useSelector((state: RootState) => state.auth);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRank, setUserRank] = useState<number | null>(null);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/leaderboard`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      const data = await response.json();
      setLeaderboard(data);
      const rank = data.findIndex((entry: LeaderboardEntry) => entry.username === username) + 1;
      setUserRank(rank);
      setLoading(false);
    } catch (error) {
      setError('Error fetching leaderboard');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    socket.on('leaderboardUpdate', (updatedLeaderboard) => {
      setLeaderboard(updatedLeaderboard);
      const rank = updatedLeaderboard.findIndex((entry: LeaderboardEntry) => entry.username === username) + 1;
      setUserRank(rank);
    });

    return () => {
      socket.off('leaderboardUpdate');
    };
  }, [username]);

  const handleBackToGame = () => {
    navigate('/game');
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );
  
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Leaderboard</h2>
      {userRank && (
        <p className="text-center mb-4 text-gray-600">Your Rank: {userRank} out of {leaderboard.length}</p>
      )}
      <ul className="space-y-2 mb-6">
        {leaderboard.map((entry, index) => (
          <li 
            key={index} 
            className={`flex justify-between items-center p-3 rounded-lg ${entry.username === username ? 'bg-yellow-100' : 'bg-gray-100'}`}
          >
            <span className="font-medium">{index + 1}. {entry.username}</span>
            <span className="font-bold">{entry.score} points</span>
          </li>
        ))}
      </ul>
      <button 
        onClick={handleBackToGame}
        className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
      >
        Back to Game
      </button>
    </div>
  );
};

export default Leaderboard;