const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const { startCycleScheduler } = require('./services/cycleScheduler');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
connectDB();

// Initialize Socket.io Real-Time Engine
initSocket(server);

// Start Order Cycle Auto-Close Background Scheduler (check every 60s)
startCycleScheduler(60000);

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/farmer', require('./routes/farmerRoutes'));
app.use('/api/consumer', require('./routes/consumerRoutes'));
app.use('/api/cycles', require('./routes/cycleRoutes'));
app.use('/api/produce', require('./routes/produceRoutes'));
app.use('/api', require('./routes/regionHubRoutes'));

// Root & Health Check Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to FarmConnect API (Express + Socket.io + Cycle Scheduler + Price Engine)',
    status: 'online',
    timestamp: new Date(),
  });
});

app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    status: 'ok',
    databaseState: states[dbState] || 'unknown',
    connected: dbState === 1,
    socket: 'initialized',
    scheduler: 'active',
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Not Found - ${req.originalUrl}`,
  });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 FarmConnect Server running on port ${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
});
