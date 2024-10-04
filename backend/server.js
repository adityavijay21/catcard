const express = require('express');
const cors = require('cors');
const Redis = require('ioredis');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://catcard.onrender.com/login", 
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 8080;

const redis = new Redis(process.env.REDIS_URL, {
  tls: {
    rejectUnauthorized: false
  },
  retryStrategy: function(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

app.use(cors());
app.use(express.json());

app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  try {
    await redis.setnx(`user:${username}`, 0);
    const score = await redis.get(`user:${username}`);
    res.json({ success: true, message: 'Logged in successfully', score: parseInt(score) });
  } catch (error) {
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
    res.status(500).json({ success: false, message: 'Error loading game' });
  }
});

app.post('/api/game/end', async (req, res) => {
  const { username, won } = req.body;
  try {
    if (won) {
      await redis.incr(`user:${username}`);
    }
    const newScore = await redis.get(`user:${username}`);
    
    const leaderboard = await getLeaderboard();
    io.emit('leaderboardUpdate', leaderboard);

    res.json({ success: true, score: parseInt(newScore) });
  } catch (error) {
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
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching leaderboard' });
  }
});

app.get('/ip', async (req, res) => {
  try {
    const response = await axios.get('https://ifconfig.me');
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error fetching IP');
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
});
