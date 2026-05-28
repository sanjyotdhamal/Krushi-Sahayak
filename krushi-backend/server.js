// server.js — Krushi Sahayak Backend Entry Point
require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Connect MongoDB ──
connectDB();

const app = express();

// ── Middleware ──
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── CORS — allow your frontend ──
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
  ],
  credentials: true,
}));

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      500,            // 500 — each page makes 5-10 API calls, so 100 was too low
  message:  { success: false, msg: 'Too many requests. Please try again after 15 minutes.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, msg: 'Too many login attempts. Please wait 15 minutes.' },
});
app.use('/api/', limiter);
app.use('/api/auth/login',      authLimiter);
app.use('/api/auth/send-otp',   authLimiter);

// ══════════════════════════════════════
// ROUTES
// ══════════════════════════════════════
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/farmer',        require('./routes/farmer'));
app.use('/api/applications',  require('./routes/applications'));
app.use('/api/notifications', require('./routes/notifications'));

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    msg:     '🌾 Krushi Sahayak API is running!',
    env:     process.env.NODE_ENV,
    time:    new Date().toISOString(),
  });
});

// ── 404 handler ──
app.use('*', (req, res) => {
  res.status(404).json({ success: false, msg: `Route ${req.originalUrl} not found.` });
});

// ── Global error handler ──
app.use(errorHandler);

// ── Start server ──
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Krushi Sahayak Server running on port ${PORT}`);
  console.log(`📡 API Base: http://localhost:${PORT}/api`);
  console.log(`🏥 Health:   http://localhost:${PORT}/api/health\n`);
});
