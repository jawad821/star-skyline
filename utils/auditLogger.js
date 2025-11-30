const { query } = require('../config/db');
const logger = require('./logger');

const auditLogger = {
  async logChange(entityType, entityId, action, changes, userId, userName, userRole, ipAddress = null) {
    try {
      await query(`
        INSERT INTO audit_logs 
          (entity_type, entity_id, action, changes, updated_by_id, updated_by_name, user_role, ip_address, created_at)
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        entityType,
        entityId,
        action,
        JSON.stringify(changes),
        userId,
        userName,
        userRole,
        ipAddress
      ]);
      
      logger.info(`[AUDIT] ${action} ${entityType} ${entityId} by ${userName}`);
    } catch (error) {
      logger.error(`Audit logging error: ${error.message}`);
    }
  },

  async getLogsForEntity(entityType, entityId) {
    try {
      const result = await query(`
        SELECT * FROM audit_logs 
        WHERE entity_type = $1 AND entity_id = $2
        ORDER BY created_at DESC
        LIMIT 50
      `, [entityType, entityId]);
      return result.rows;
    } catch (error) {
      logger.error(`Get logs error: ${error.message}`);
      return [];
    }
  },

  async getAllLogs(limit = 100, offset = 0) {
    try {
      const result = await query(`
        SELECT * FROM audit_logs 
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `, [limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error(`Get all logs error: ${error.message}`);
      return [];
    }
  },

  async getLogsByUser(userName, limit = 50) {
    try {
      const result = await query(`
        SELECT * FROM audit_logs 
        WHERE updated_by_name = $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [userName, limit]);
      return result.rows;
    } catch (error) {
      logger.error(`Get user logs error: ${error.message}`);
      return [];
    }
  }
};

module.exports = auditLogger;
