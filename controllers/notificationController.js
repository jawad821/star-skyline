const { query } = require('../config/db');

const notificationController = {
    /**
     * Get recent notifications
     */
    getNotifications: async (req, res, next) => {
        try {
            const limit = parseInt(req.query.limit) || 50;

            const result = await query(`
        SELECT * FROM notification_logs 
        ORDER BY created_at DESC 
        LIMIT $1
      `, [limit]);

            res.status(200).json({
                success: true,
                count: result.rowCount,
                data: result.rows
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = notificationController;
