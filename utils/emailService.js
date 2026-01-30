const { ADMIN_EMAIL, RESEND_API_KEY, RESEND_FROM_EMAIL } = require('../config/env');
const logger = require('./logger');
const { query } = require('../config/db');
let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

/**
 * Helper to get SMTP config from database or fallback to env
 */
async function getSmtpConfig() {
  try {
    const result = await query("SELECT setting_key, setting_value FROM settings WHERE category = 'email'");
    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    // Check if we have minimum requirements from DB
    if (settings.smtp_host && settings.smtp_user) {
      return {
        host: settings.smtp_host,
        port: parseInt(settings.smtp_port || '465', 10),
        secure: settings.smtp_secure === 'true',
        auth: {
          user: settings.smtp_user,
          pass: settings.smtp_password
        },
        from: settings.smtp_from || 'info@booking.digitalmindsdemo.com'
      };
    }
  } catch (err) {
    logger.error('Failed to fetch SMTP settings from DB:', err);
  }

  // Fallback to env
  return {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: (process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === 'TRUE'),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    from: process.env.SMTP_FROM || 'info@booking.digitalmindsdemo.com'
  };
}

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

      const emailTemplates = require('./emailTemplates');
      const template = emailTemplates.bookingConfirmation(booking, vehicle);

      const textBody = template.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      // Primary: Resend API (HTTP-based, works on Railway)
      if (RESEND_API_KEY) {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: RESEND_FROM_EMAIL || 'onboarding@resend.dev',
              to: booking.customer_email,
              subject: template.subject,
              html: template.html
            })
          });

          const result = await response.json();
          if (!response.ok) {
            logger.error(`Resend API error: ${result.message || 'Unknown error'}`);
            throw new Error(result.message || 'Failed to send email via Resend');
          }
          logger.info(`✅ Customer email sent to ${booking.customer_email} via Resend: ${result.id}`);
          return { success: true, message: 'Email sent via Resend', messageId: result.id };
        } catch (resendError) {
          logger.error(`Resend failed, trying SMTP: ${resendError.message}`);
          // Fall through to SMTP
        }
      }

      // Fallback: SMTP via nodemailer (if Resend fails or not configured)
      const smtpConfig = await getSmtpConfig();
      if (nodemailer && smtpConfig.host) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure !== undefined ? smtpConfig.secure : (smtpConfig.port === 465), // Default to true for 465
            auth: smtpConfig.auth,
            // Increase timeouts to prevent early disconnects
            connectionTimeout: 10000, // 10 seconds
            greetingTimeout: 10000,   // 10 seconds
            socketTimeout: 20000,     // 20 seconds
            tls: { rejectUnauthorized: false }
          });
          const info = await transporter.sendMail({
            from: smtpConfig.from,
            to: booking.customer_email,
            subject: template.subject,
            html: template.html,
            text: textBody
          });
          logger.info(`✅ Customer email sent to ${booking.customer_email} via SMTP: ${info.messageId}`);
          return { success: true, message: 'Email sent via SMTP', messageId: info.messageId };
        } catch (smtpError) {
          logger.error(`❌ SMTP failed: ${smtpError.message}`);
          return { success: false, error: `Email failed: ${smtpError.message}` };
        }
      }



      logger.warn('Email not sent: no Resend API key or SMTP configured');
      return { success: true, message: 'Email would be sent (no provider configured)' };
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

      const emailTemplates = require('./emailTemplates');
      const template = emailTemplates.adminNotification(booking, vehicle);

      const textBody = template.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      // Primary: Resend API
      if (RESEND_API_KEY) {
        try {
          logger.info(`Attempting to send Admin email to: ${ADMIN_EMAIL} via Resend`);
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: RESEND_FROM_EMAIL || 'onboarding@resend.dev',
              to: ADMIN_EMAIL,
              subject: template.subject,
              html: template.html
            })
          });

          const result = await response.json();
          if (!response.ok) {
            logger.error(`❌ Resend Admin Email Error: ${JSON.stringify(result)}`);
            throw new Error(result.message || 'Failed to send admin email via Resend');
          }
          logger.info(`✅ Admin email sent to ${ADMIN_EMAIL} via Resend: ${result.id}`);
          return { success: true, message: 'Admin email sent via Resend', messageId: result.id };
        } catch (resendError) {
          logger.error(`⚠️ Resend failed for Admin, trying SMTP. Reason: ${resendError.message}`);
          // Fall through to SMTP
        }
      }

      // Fallback: SMTP
      const smtpConfig = await getSmtpConfig();
      if (nodemailer && smtpConfig.host) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure !== undefined ? smtpConfig.secure : (smtpConfig.port === 465),
            auth: smtpConfig.auth,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
            tls: { rejectUnauthorized: false }
          });
          const info = await transporter.sendMail({
            from: smtpConfig.from,
            to: ADMIN_EMAIL,
            subject: template.subject,
            html: template.html,
            text: textBody
          });
          logger.info(`✅ Admin email sent to ${ADMIN_EMAIL} via SMTP: ${info.messageId}`);
          return { success: true, message: 'Admin email sent via SMTP', messageId: info.messageId };
        } catch (smtpError) {
          logger.error(`❌ SMTP failed: ${smtpError.message}`);
          return { success: false, error: `SMTP Failed: ${smtpError.message}` };
        }
      }



      logger.warn('Admin email not sent: no Resend API key or SMTP configured');
      return { success: true, message: 'Admin email would be sent (no provider configured)' };
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
  },

  /**
   * Send WordPress booking notification to multiple admin emails
   */
  async sendWordPressBookingNotification(booking, vehicle) {
    try {
      // SMTP request will be tried first, then Resend

      // Primary recipient (Resend testing mode only allows verified email)
      // To add rameez.net@gmail.com: verify a domain at resend.com/domains
      const recipients = [];
      if (ADMIN_EMAIL) recipients.push(ADMIN_EMAIL);
      // Fallback or additional hardcoded emails if needed

      const vehicleTypeNames = {
        'classic': 'Classic Sedan',
        'executive': 'Executive',
        'first_class': 'First Class',
        'urban_suv': 'Urban SUV',
        'luxury_suv': 'Luxury SUV',
        'elite_van': 'Elite Van',
        'mini_bus': 'Mini Bus'
      };

      const vehicleName = vehicleTypeNames[booking.vehicle_type] || booking.vehicle_type;
      const createdAt = new Date(booking.created_at).toLocaleString('en-AE', {
        timeZone: 'Asia/Dubai',
        dateStyle: 'full',
        timeStyle: 'short'
      });

      const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; text-align: center;">
      <h1 style="color: #ffc107; margin: 0; font-size: 24px; font-weight: 600;">New WordPress Booking</h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">A new booking has been submitted</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <!-- Booking ID -->
      <div style="background: #ffc107; color: #1a1a2e; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</span>
        <div style="font-size: 18px; font-weight: 700; margin-top: 5px;">${booking.id.substring(0, 8).toUpperCase()}</div>
      </div>

      <!-- Customer Details -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ffc107;">Customer Details</h3>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #666;">Name:</td><td style="padding: 8px 0; color: #333; font-weight: 500;">${booking.customer_name}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0; color: #333;">${booking.customer_email}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Phone:</td><td style="padding: 8px 0; color: #333;">${booking.customer_phone}</td></tr>
        </table>
      </div>

      <!-- Trip Details -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ffc107;">Trip Details</h3>
        <div style="display: flex; margin-bottom: 15px;">
          <div style="width: 30px;">
            <div style="width: 12px; height: 12px; background: #4caf50; border-radius: 50%; margin: 3px auto;"></div>
            <div style="width: 2px; height: 30px; background: #ddd; margin: 0 auto;"></div>
            <div style="width: 12px; height: 12px; background: #f44336; border-radius: 50%; margin: 3px auto;"></div>
          </div>
          <div style="flex: 1;">
            <div style="padding: 0 0 20px 10px; font-size: 14px; color: #333;">${booking.pickup_location}</div>
            <div style="padding: 10px 0 0 10px; font-size: 14px; color: #333;">${booking.dropoff_location}</div>
          </div>
        </div>
        <table style="width: 100%; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #666;">Passengers:</td><td style="padding: 8px 0; color: #333;">${booking.passengers_count}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Luggage:</td><td style="padding: 8px 0; color: #333;">${booking.luggage_count}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Vehicle:</td><td style="padding: 8px 0; color: #333; font-weight: 500;">${vehicleName}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Payment:</td><td style="padding: 8px 0; color: #333;">${booking.payment_method}</td></tr>
        </table>
      </div>

      ${booking.notes ? `
      <!-- Notes -->
      <div style="margin-bottom: 25px;">
        <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ffc107;">Special Instructions</h3>
        <p style="background: #f8f9fa; padding: 15px; border-radius: 8px; font-size: 14px; color: #333; margin: 0;">${booking.notes}</p>
      </div>
      ` : ''}

      <!-- Fare -->
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; border-radius: 8px; text-align: center;">
        <span style="color: #999; font-size: 12px; text-transform: uppercase;">Total Fare</span>
        <div style="color: #ffc107; font-size: 28px; font-weight: 700; margin-top: 5px;">AED ${parseFloat(booking.fare_aed || 0).toFixed(2)}</div>
      </div>

      <!-- Footer -->
      <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">Submitted: ${createdAt}</p>
        <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">Source: WordPress Booking Form</p>
      </div>
    </div>
  </div>
</body>
</html>`;



      const textBody = emailHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      // Primary: SMTP
      const smtpConfig = await getSmtpConfig();
      if (nodemailer && smtpConfig.host) {
        try {
          const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure !== undefined ? smtpConfig.secure : (smtpConfig.port === 465),
            auth: smtpConfig.auth,
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
            tls: { rejectUnauthorized: false }
          });

          for (const recipient of recipients) {
            await transporter.sendMail({
              from: smtpConfig.from,
              to: recipient,
              subject: `🚗 New WordPress Booking - ${booking.customer_name} (${vehicleName})`,
              html: emailHtml,
              text: textBody
            });
          }

          logger.info(`WordPress booking email sent to ${recipients.join(', ')} via SMTP`);
          return { success: true, message: 'Email sent via SMTP' };
        } catch (smtpError) {
          logger.error(`SMTP failed: ${smtpError.message}`);
          return { success: false, error: `SMTP Failed: ${smtpError.message}` };
        }
      }

      if (false && RESEND_API_KEY) { // Disabled
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: RESEND_FROM_EMAIL || 'noreply@starskylinelimousine.com',
            to: recipients,
            subject: `🚗 New WordPress Booking - ${booking.customer_name} (${vehicleName})`,
            html: emailHtml
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to send email');
        }

        logger.info(`WordPress booking email sent to ${recipients.join(', ')} for booking ${booking.id}`);
        return { success: true, message: 'Email sent successfully', messageId: result.id };
      }

      logger.warn('WordPress email not sent: no Resend API key or SMTP configured');
      return { success: true, message: 'Email would be sent (no provider configured)' };
    } catch (error) {
      logger.error(`Failed to send WordPress booking email: ${error.message}`);
      return { success: false, error: error.message };
    }
  },

  /**
   * Send ride completion email to customer
   */
  async sendRideCompletionNotification(booking) {
    try {
      if (!booking.customer_email) {
        logger.warn(`No customer email for completion notification, booking ${booking.id}`);
        return { success: false, error: 'No customer email' };
      }

      const emailTemplates = require('./emailTemplates');
      const template = emailTemplates.rideCompletion(booking);

      // Primary: SMTP
      const smtpConfig = await getSmtpConfig();
      try {
        if (nodemailer && smtpConfig.host) {
          const transporter = nodemailer.createTransport({
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            auth: smtpConfig.auth
          });

          await transporter.sendMail({
            from: smtpConfig.from,
            to: booking.customer_email,
            subject: template.subject,
            html: template.html
          });

          logger.info(`Ride completion email sent to ${booking.customer_email} via SMTP`);
          return { success: true, message: 'Email sent via SMTP' };
        }
      } catch (smtpError) {
        logger.error(`SMTP failed, trying Resend: ${smtpError.message}`);
      }

      // Fallback: Resend
      if (RESEND_API_KEY) {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: RESEND_FROM_EMAIL || 'noreply@starskylinelimousine.com',
            to: booking.customer_email,
            subject: template.subject,
            html: template.html
          })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to send email via Resend');

        logger.info(`Ride completion email sent to ${booking.customer_email} via Resend`);
        return { success: true, message: 'Email sent via Resend', messageId: result.id };
      }

      return { success: true, message: 'No email service configured' };
    } catch (error) {
      logger.error(`Failed to send ride completion email: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
};

module.exports = emailService;
