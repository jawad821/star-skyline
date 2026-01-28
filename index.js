require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const moment = require('moment-timezone');
const { query } = require('./config/db');
const { PORT } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const { bareerahLogger, bareerahErrorLogger } = require('./middleware/bareerahLogger');
console.log('Middleware loaded');

// Import Routes
console.log('Loading routes...');
const bookingRoutes = require('./routes/bookingRoutes');
console.log('bookingRoutes loaded');
const vehicleRoutes = require('./routes/vehicleRoutes');
console.log('vehicleRoutes loaded');
const vendorRoutes = require('./routes/vendorRoutes');
console.log('vendorRoutes loaded');
const authRoutes = require('./routes/authRoutes');
console.log('authRoutes loaded');
const reportRoutes = require('./routes/reportRoutes');
console.log('reportRoutes loaded');
const pushRoutes = require('./routes/pushRoutes');
console.log('pushRoutes loaded');
const statsRoutes = require('./routes/statsRoutes');
console.log('statsRoutes loaded');
const customerRoutes = require('./routes/customerRoutes');
console.log('customerRoutes loaded');
const driverRoutes = require('./routes/driverRoutes');
console.log('driverRoutes loaded');
const ratingRoutes = require('./routes/ratingRoutes');
console.log('ratingRoutes loaded');
const fareRuleRoutes = require('./routes/fareRuleRoutes');
console.log('fareRuleRoutes loaded');
const auditRoutes = require('./routes/auditRoutes');
console.log('auditRoutes loaded');
const driverStatsRoutes = require('./routes/driverStatsRoutes');
console.log('driverStatsRoutes loaded');
const vendorAuthRoutes = require('./routes/vendorAuthRoutes');
console.log('vendorAuthRoutes loaded');
const driverAuthRoutes = require('./routes/driverAuthRoutes');
console.log('driverAuthRoutes loaded');
const vendorManagementRoutes = require('./routes/vendorManagementRoutes');
console.log('vendorManagementRoutes loaded');
const settingsRoutes = require('./routes/settingsRoutes');
console.log('settingsRoutes loaded');
const notificationRoutes = require('./routes/notificationRoutes');
console.log('notificationRoutes loaded');
const webhookRoutes = require('./routes/webhookRoutes');
console.log('webhookRoutes loaded');

// Set Dubai timezone globally
process.env.TZ = 'Asia/Dubai';
moment.tz.setDefault('Asia/Dubai');

const app = express();
console.log('Express app created');

// CORS Configuration - Allow Replit preview and local development
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins for development - removes CORS barriers
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-JSON-Response'],
  optionsSuccessStatus: 200,
  maxAge: 600
}));

app.use(express.json());

// Apply Bareerah logging to all requests
app.use(bareerahLogger);

// Cache control middleware - disable caching for HTML/CSS/JS
app.use((req, res, next) => {
  if (req.path.includes('/dashboard/') || req.path.includes('/vendor') || req.path.includes('/driver') || req.path.endsWith('.html') || req.path.endsWith('.js') || req.path.endsWith('.css')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// API routes definition
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/fare-rules', fareRuleRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/driver-stats', driverStatsRoutes);
app.use('/api/vendor-auth', vendorAuthRoutes);
app.use('/api/driver-auth', driverAuthRoutes);
app.use('/api/vendor-management', vendorManagementRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', webhookRoutes); // WhatsApp webhook endpoint

// Admin Login page (public)
app.get('/dashboard/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard', 'login.html'));
});

// Admin Dashboard main page
app.get('/dashboard/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard', 'index.html'));
});

// Admin Dashboard root redirects to login
app.get('/dashboard', (req, res) => {
  res.redirect('/dashboard/login.html');
});

// Vendor Login page
app.get('/vendor-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vendor-login.html'));
});

// Vendor Dashboard page
app.get('/vendor-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vendor-dashboard.html'));
});

// Vendor Signup page
app.get('/vendor-signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vendor-signup.html'));
});

// Serve static files (CSS, JS, etc)
app.use(express.static(path.join(__dirname, 'public')));

// Database test
app.get('/db-test', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Seed data endpoint (admin only)
app.post('/seed-data', async (req, res) => {
  try {
    const seedModule = require('./scripts/seedData');
    res.json({ success: true, message: 'Seed data created' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Root redirects to login
app.get('/', (req, res) => {
  res.redirect('/dashboard/login.html');
});

// Error handling - MUST be last
app.use(errorHandler);

console.log('Attempting to listen on port ' + PORT);
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on http://0.0.0.0:${PORT}`);
});

server.on('error', (e) => {
  console.error('SERVER ERROR:', e);
});

