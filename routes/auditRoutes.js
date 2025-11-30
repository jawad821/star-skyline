const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { rbacMiddleware } = require('../middleware/rbacMiddleware');
const auditLogger = require('../utils/auditLogger');
const { query } = require('../config/db');

// Get all audit logs
router.get('/', authMiddleware, rbacMiddleware(['admin', 'operator']), async (req, res) => {
  try {
    const { limit = 100, offset = 0, entity_type, entity_id, user_name } = req.query;
    let result;

    if (entity_type && entity_id) {
      result = await query(`
        SELECT * FROM audit_logs 
        WHERE entity_type = $1 AND entity_id = $2
        ORDER BY created_at DESC
        LIMIT $3
      `, [entity_type, entity_id, limit]);
    } else if (user_name) {
      result = await query(`
        SELECT * FROM audit_logs 
        WHERE updated_by_name = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `, [user_name, limit, offset]);
    } else {
      result = await query(`
        SELECT * FROM audit_logs 
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
    }

    // Get total count for pagination
    const countResult = await query('SELECT COUNT(*) as total FROM audit_logs');
    
    res.json({
      success: true,
      data: result.rows,
      total: countResult.rows[0].total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get logs for specific entity
router.get('/:entityType/:entityId', authMiddleware, rbacMiddleware(['admin', 'operator']), async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const logs = await auditLogger.getLogsForEntity(entityType, entityId);
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
