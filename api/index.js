require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const routes = require('../server/routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root & health check routes
app.get(['/api', '/api/health', '/health', '/'], (req, res) => {
  res.json({ status: 'ok', message: 'AIMPS School API is running' });
});

// Mount API routes at both /api and root to handle any rewrite format
app.use('/api', routes);
app.use('/', routes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('[API Error]', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;




