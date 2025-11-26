const express = require('express');
const path = require('path');
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

const app = express();

app.use(express.json());

// API routes BEFORE static files
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/stats', statsRoutes);

// Login page (public)
app.get('/dashboard/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard', 'login.html'));
});

// Dashboard main page
app.get('/dashboard/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard', 'index.html'));
});

// Dashboard root redirects to login
app.get('/dashboard', (req, res) => {
  res.redirect('/dashboard/login.html');
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
