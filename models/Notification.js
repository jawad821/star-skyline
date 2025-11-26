const { query } = require('../config/db');

const Notification = {
  async logNotification(data) {
    try {
      const result = await query(`
        INSERT INTO notification_logs (
          recipient_type, recipient_phone, recipient_email, 
          channel, template_id, content, status, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        data.recipient_type, // 'customer', 'driver', 'admin'
        data.recipient_phone,
        data.recipient_email,
        data.channel, // 'whatsapp', 'email', 'sms'
        data.template_id,
        data.content,
        data.status || 'pending',
        JSON.stringify(data.metadata || {})
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Notification log error:', error);
      return null;
    }
  },

  async getNotificationLogs(limit = 50) {
    const result = await query(
      'SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }
};

module.exports = Notification;
