const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await query(`
      SELECT d.*, v.name as vendor_name
      FROM drivers d
      LEFT JOIN vendors v ON d.vendor_id = v.id
      ORDER BY d.created_at DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
