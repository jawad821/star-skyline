const { ADMIN_EMAIL, RESEND_API_KEY, RESEND_FROM_EMAIL } = require('../config/env');
const logger = require('./logger');

const emailService = {
  /**
   * Send email to customer about booking using Resend
   */
  async sendCustomerNotification(booking, vehicle) {
    try {
      if (!booking.customer_email) {
        logger.warn(`No customer email for booking ${booking.id}`);
        return { success: false, error: 'No customer email' };
      }

      if (!RESEND_API_KEY) {
        logger.warn('Resend API key not configured - email not sent (test mode)');
        return { success: true, message: 'Email would be sent (Resend API key not configured)' };
      }

      const emailTemplates = require('./emailTemplates');
      const template = emailTemplates.bookingConfirmation(booking, vehicle);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: template.subject,
          html: template.html
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
      }

      logger.info(`Customer email sent to ${booking.customer_email} for booking ${booking.id}`);
      return { success: true, message: 'Email sent successfully', messageId: result.id };
    } catch (error) {
      logger.error(`Failed to send customer email for booking ${booking.id}: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send email to admin about new booking using Resend
   */
  async sendAdminNotification(booking, vehicle) {
    try {
      if (!ADMIN_EMAIL) {
        logger.warn('Admin email not configured');
        return { success: false, error: 'Admin email not configured' };
      }

      if (!RESEND_API_KEY) {
        logger.warn('Resend API key not configured - admin email not sent (test mode)');
        return { success: true, message: 'Admin email would be sent (Resend API key not configured)' };
      }

      const emailTemplates = require('./emailTemplates');
      const template = emailTemplates.adminNotification(booking, vehicle);

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: template.subject,
          html: template.html
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email');
      }

      logger.info(`Admin email sent to ${ADMIN_EMAIL} for booking ${booking.id}`);
      return { success: true, message: 'Admin email sent', messageId: result.id };
    } catch (error) {
      logger.error(`Failed to send admin email: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get WhatsApp template message
   */
  getWhatsappTemplate(booking, vehicle) {
    const emailTemplates = require('./emailTemplates');
    return emailTemplates.whatsappTemplate(booking, vehicle);
  }
};

module.exports = emailService;
