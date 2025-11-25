const express = require('express');
const { query } = require('./db/db');
const bookingsRouter = require('./routes/bookings');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: "Backend running" });
});

app.get('/db-test', async (req, res) => {
  try {
    const result = await query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.use('/api/bookings', bookingsRouter);

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3000');
});
