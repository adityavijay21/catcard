const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const http = require('http');
const socketIo = require('socket.io');

console.log('Environment variables:');
console.log('REDIS_URL:', process.env.REDIS_URL);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 8080; // Change this to 8080

// Use the Redis URL from the environment variable
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
console.log('Connecting to Redis at:', redisUrl);

const redis = new Redis(redisUrl, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

const corsOptions = {
  origin: process.env.CORS_ORIGIN || "https://catcard.onrender.com",
  methods: ["GET", "POST"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  try {
    await redis.setnx(`user:${username}`, 0);
    const score = await redis.get(`user:${username}`);
    res.json({ success: true, message: 'Logged in successfully', score: parseInt(score) });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error during login' });
  }
});

app.post('/api/game/start', async (req, res) => {
  const { username } = req.body;
  const deck = shuffleDeck();
  const score = await redis.get(`user:${username}`);
  res.json({ success: true, deck, score: parseInt(score) });
});

app.post('/api/game/save', async (req, res) => {
  const { username, gameState } = req.body;
  try {
    await redis.set(`gameState:${username}`, JSON.stringify(gameState));
    res.json({ success: true, message: 'Game saved successfully' });
  } catch (error) {
    console.error('Save game error:', error);
    res.status(500).json({ success: false, message: 'Error saving game' });
  }
});

app.get('/api/game/load/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const gameState = await redis.get(`gameState:${username}`);
    if (gameState) {
      res.json(JSON.parse(gameState));
    } else {
      res.status(404).json({ success: false, message: 'No saved game found' });
    }
  } catch (error) {
    console.error('Load game error:', error);
    res.status(500).json({ success: false, message: 'Error loading game' });
  }
});

app.post('/api/game/end', async (req, res) => {
  const { username, won } = req.body;
  try {
    if (won) {
      await redis.incr(`user:${username}`);
      console.log(`User ${username} won a game. Score incremented.`);
    }
    const newScore = await redis.get(`user:${username}`);
    
    const leaderboard = await getLeaderboard();
    io.emit('leaderboardUpdate', leaderboard);

    res.json({ success: true, score: parseInt(newScore) });
  } catch (error) {
    console.error('End game error:', error);
    res.status(500).json({ success: false, message: 'Error ending game' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const users = await redis.keys('user:*');
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const score = await redis.get(user);
        return { username: user.split(':')[1], score: parseInt(score) };
      })
    );
    leaderboard.sort((a, b) => b.score - a.score);
    console.log('Leaderboard:', leaderboard);
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
  }
});

function shuffleDeck() {
  const cards = ['Cat', 'Cat', 'Defuse', 'Shuffle', 'ExplodingKitten'];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

async function getLeaderboard() {
  const users = await redis.keys('user:*');
  const leaderboard = await Promise.all(
    users.map(async (user) => {
      const score = await redis.get(user);
      return { username: user.split(':')[1], score: parseInt(score) };
    })
  );
  return leaderboard.sort((a, b) => b.score - a.score);
}

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
}).on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Please choose a different port.`);
    process.exit(1);
  } else {
    console.error('Server error:', e);
  }
});