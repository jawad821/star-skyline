const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT v.*, vn.name as vendor_name,
             d.name as driver_name
      FROM vehicles v
      LEFT JOIN vendors vn ON v.vendor_id = vn.id
      LEFT JOIN drivers d ON v.driver_id = d.id
      ORDER BY v.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
