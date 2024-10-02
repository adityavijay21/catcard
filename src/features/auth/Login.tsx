import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUsername } from './authSlice';

const Login: React.FC = () => {
  const [username, setUsernameLocal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (username.trim()) {
      try {
        const response = await fetch('http://localhost:8080/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username }),
        });
        const data = await response.json();
        if (data.success) {
          dispatch(setUsername(username));
          navigate('/game');
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
      } catch (error) {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Enter Your Username</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsernameLocal(e.target.value)}
          placeholder="Username"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors duration-200"
        >
          Start Game
        </button>
      </form>
      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
    </div>
  );
};

export default Login;