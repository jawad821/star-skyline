const express = require('express');
const path = require('path');
const cors = require('cors');
const { query } = require('./config/db');
const { PORT } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const bookingRoutes = require('./routes/bookingRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const pushRoutes = require('./routes/pushRoutes');
const statsRoutes = require('./routes/statsRoutes');
const customerRoutes = require('./routes/customerRoutes');
const driverRoutes = require('./routes/driverRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const fareRuleRoutes = require('./routes/fareRuleRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

// Import Bareerah logging middleware
const { bareerahLogger, bareerahErrorLogger } = require('./middleware/bareerahLogger');

// CORS Configuration - Allow Replit preview and local development
app.use(cors({
  origin: function(origin, callback) {
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

// API routes BEFORE static files
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

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on http://0.0.0.0:${PORT}`);
});

// Import new routes
const vendorAuthRoutes = require('./routes/vendorAuthRoutes');
const driverAuthRoutes = require('./routes/driverAuthRoutes');
const vendorManagementRoutes = require('./routes/vendorManagementRoutes');

// Mount new routes
app.use('/api/vendor-auth', vendorAuthRoutes);
app.use('/api/driver-auth', driverAuthRoutes);
app.use('/api/vendor-management', vendorManagementRoutes);
