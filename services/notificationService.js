const logger = require('../utils/logger');
let fetchImpl = global.fetch;
if (!fetchImpl) {
  try {
    // prefer node-fetch if running on older Node
    // eslint-disable-next-line global-require
    fetchImpl = require('node-fetch');
  } catch (e) {
    fetchImpl = undefined;
  }
}

let nodemailer;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  nodemailer = null;
}

const { WHATSAPP_API_TOKEN, WHATSAPP_PHONE_ID, RESEND_API_KEY, RESEND_FROM_EMAIL } = require('../config/env');
const emailService = require('../utils/emailService');
const emailTemplates = require('../utils/emailTemplates');
const Notification = require('../models/Notification');
const { query } = require('../config/db');
const fs = require('fs');
const path = require('path');

function logDebug(message) {
  try {
    const logPath = path.join(__dirname, '..', 'whatsapp_debug.txt');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
  } catch (e) {
    // ignore
  }
}

// Helper to get WhatsApp settings from DB or Env
async function getWhatsAppConfig() {
  try {
    const result = await query("SELECT setting_key, setting_value FROM settings WHERE category = 'whatsapp'");
    const settings = {};
    result.rows.forEach(row => {
      // Trim values to avoid whitespace issues
      settings[row.setting_key] = (row.setting_value || '').trim();
    });

    logDebug(`Found Settings - Provider: '${settings.whatsapp_provider}', PhoneID: '${settings.whatsapp_phone_number_id}', TokenPrefix: ${settings.whatsapp_access_token ? settings.whatsapp_access_token.substring(0, 5) : 'NONE'}`);

    if (settings.whatsapp_provider === 'meta' && settings.whatsapp_access_token && settings.whatsapp_phone_number_id) {
      logDebug(`Using DB Configuration. ID: ${settings.whatsapp_phone_number_id}`);
      return {
        token: settings.whatsapp_access_token,
        phoneId: settings.whatsapp_phone_number_id,
        configured: true
      };
    }
  } catch (err) {
    logDebug(`DB Fetch Error: ${err.message}`);
    logger.error('Failed to fetch WhatsApp settings from DB:', err);
  }

  // Fallback to env
  logDebug(`Fallback to Env - PhoneID: ${WHATSAPP_PHONE_ID}`);
  return {
    token: WHATSAPP_API_TOKEN,
    phoneId: WHATSAPP_PHONE_ID,
    configured: !!(WHATSAPP_API_TOKEN && WHATSAPP_PHONE_ID)
  };
}

// Helper to sanitize phone number (remove + and non-digits)
function sanitizePhone(phone) {
  if (!phone) return '';
  return phone.toString().replace(/\D/g, '');
}

async function sendWhatsAppMessage(to, text) {
  try {
    const config = await getWhatsAppConfig();
    const cleanTo = sanitizePhone(to);

    if (!config.configured) {
      logger.warn('WhatsApp API not configured - message not sent (test mode)');
      return { success: true, message: 'WhatsApp would be sent (not configured)', preview: text };
    }

    if (!fetchImpl) {
      logger.warn('Fetch not available in runtime - cannot send WhatsApp');
      return { success: false, error: 'Fetch not available' };
    }

    const url = `https://graph.facebook.com/v22.0/${config.phoneId}/messages`;
    const body = {
      messaging_product: 'whatsapp',
      to: cleanTo,
      type: 'text',
      text: { preview_url: false, body: text }
    };

    const resp = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const json = await resp.json();
    if (!resp.ok) throw new Error(JSON.stringify(json));
    logger.info(`WhatsApp sent to ${cleanTo}`);
    return { success: true, result: json };
  } catch (error) {
    logger.error('WhatsApp send failed:', error && error.message ? error.message : error);
    return { success: false, error: error.message || String(error) };
  }
}

async function sendWhatsAppTemplate(to, templateName, languageCode = 'en_US', components = []) {
  try {
    const config = await getWhatsAppConfig();
    const cleanTo = sanitizePhone(to);

    if (!config.configured) {
      logger.warn('WhatsApp API not configured - template not sent (test mode)');
      return { success: true, message: 'WhatsApp template would be sent (not configured)', preview: templateName };
    }

    if (!fetchImpl) {
      logger.warn('Fetch not available in runtime - cannot send WhatsApp');
      return { success: false, error: 'Fetch not available' };
    }

    const url = `https://graph.facebook.com/v22.0/${config.phoneId}/messages`;

    // Construct the template object
    const templateObj = {
      name: templateName,
      language: {
        code: languageCode
      }
    };

    if (components && components.length > 0) {
      templateObj.components = components;
    }

    const body = {
      messaging_product: 'whatsapp',
      to: cleanTo,
      type: 'template',
      template: templateObj
    };

    const resp = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const json = await resp.json();
    if (!resp.ok) throw new Error(JSON.stringify(json));
    logger.info(`WhatsApp template '${templateName}' sent to ${cleanTo}`);
    return { success: true, result: json };
  } catch (error) {
    logger.error('WhatsApp template send failed:', error && error.message ? error.message : error);
    return { success: false, error: error.message || String(error) };
  }
}

async function sendWhatsAppToCustomer(phone, booking) {
  try {
    // Use approved template instead of plain text
    const components = [{
      type: "body",
      parameters: [
        { type: "text", text: booking.customer_name || "Customer" },
        { type: "text", text: booking.pickup_location || "N/A" },
        { type: "text", text: booking.dropoff_location || "N/A" },
        { type: "text", text: booking.pickup_datetime || new Date().toLocaleString() },
        { type: "text", text: booking.vehicle_model || booking.vehicle_type || "Standard" },
        { type: "text", text: booking.fare_aed || booking.total_fare || "0" },
        { type: "text", text: booking.id ? booking.id.substring(0, 8).toUpperCase() : "N/A" }
      ]
    }];

    const resp = await sendWhatsAppTemplate(phone, 'booking_confirmed_customer', 'en', components);

    // log notification
    try {
      await Notification.logNotification({
        recipient_type: 'customer',
        recipient_phone: phone,
        channel: 'whatsapp',
        template_id: 'booking_confirmed_customer',
        content: JSON.stringify(components),
        status: resp.success ? 'sent' : 'failed',
        metadata: { booking_id: booking.id }
      });
    } catch (e) {
      logger.error('Notification log error (customer whatsapp):', e);
    }
    return resp;
  } catch (error) {
    logger.error('sendWhatsAppToCustomer error:', error);
    return { success: false, error: error.message };
  }
}

async function sendDriverAssignedNotification(booking, driver, vehicle = null) {
  try {
    const phone = booking.customer_phone;
    if (!phone) return { success: false, error: 'No customer phone' };

    // Debug logging
    logger.info('🔍 [NOTIFICATION] Driver Assignment Debug:');
    logger.info(`   Booking ID: ${booking.id}`);
    logger.info(`   Driver: ${driver.name} (${driver.phone})`);
    logger.info(`   Vehicle Object: ${vehicle ? 'PROVIDED' : 'NULL'}`);
    if (vehicle) {
      logger.info(`   Vehicle Model: ${vehicle.model || 'NOT SET'}`);
      logger.info(`   Vehicle Color: ${vehicle.color || 'NOT SET'}`);
      logger.info(`   Vehicle Plate: ${vehicle.plate_number || 'NOT SET'}`);
    }
    logger.info(`   Booking Vehicle ID: ${booking.assigned_vehicle_id || 'NOT ASSIGNED'}`);

    let vehicleInfo = booking.vehicle_model || "Standard";
    if (vehicle) {
      const model = vehicle.model || "Standard";
      const color = vehicle.color || "Color not set";
      const plateNumber = vehicle.plate_number || "Plate not set";
      vehicleInfo = `${model} - ${color} (${plateNumber})`;
      logger.info(`   ✅ Vehicle Info: ${vehicleInfo}`);
    } else {
      logger.warn(`   ⚠️  No vehicle object provided, using fallback: ${vehicleInfo}`);
    }

    const components = [{
      type: "body",
      parameters: [
        { type: "text", text: booking.customer_name || "Customer" },             // {{1}}
        { type: "text", text: driver.name || "Driver" },                         // {{2}}
        { type: "text", text: driver.phone || "N/A" },                           // {{3}}
        { type: "text", text: vehicleInfo },                                     // {{4}}
        { type: "text", text: booking.pickup_datetime || new Date(booking.created_at).toLocaleString() }, // {{5}}
        { type: "text", text: booking.pickup_location || "N/A" }                 // {{6}}
      ]
    }];

    const resp = await sendWhatsAppTemplate(phone, 'driver_assigned_customer', 'en', components);

    try {
      if (Notification && Notification.logNotification) {
        await Notification.logNotification({
          recipient_type: 'customer',
          recipient_phone: phone,
          channel: 'whatsapp',
          template_id: 'driver_assigned_customer',
          content: JSON.stringify(components),
          status: resp.success ? 'sent' : 'failed',
          metadata: { booking_id: booking.id, driver_id: driver.id }
        });
      }
    } catch (e) {
      logger.error('Notification log error (driver assigned):', e);
    }
    return resp;
  } catch (error) {
    logger.error('sendDriverAssignedNotification error:', error);
    return { success: false, error: error.message };
  }
}

async function sendTripCompletedNotification(booking, driver) {
  try {
    const phone = booking.customer_phone;
    if (!phone) return { success: false, error: 'No customer phone' };

    const components = [{
      type: "body",
      parameters: [
        { type: "text", text: booking.customer_name || "Customer" },             // {{1}}
        { type: "text", text: booking.id ? booking.id.substring(0, 8).toUpperCase() : "N/A" }, // {{2}}
        { type: "text", text: booking.vehicle_model || "Standard" },             // {{3}}
        { type: "text", text: driver ? driver.name : "Driver" }                  // {{4}}
      ]
    }];

    const resp = await sendWhatsAppTemplate(phone, 'trip_completed_customer', 'en', components);

    try {
      await Notification.logNotification({
        recipient_type: 'customer',
        recipient_phone: phone,
        channel: 'whatsapp',
        template_id: 'trip_completed_customer',
        content: JSON.stringify(components),
        status: resp.success ? 'sent' : 'failed',
        metadata: { booking_id: booking.id }
      });
    } catch (e) {
      logger.error('Notification log error (trip completed):', e);
    }
    return resp;
  } catch (error) {
    logger.error('sendTripCompletedNotification error:', error);
    return { success: false, error: error.message };
  }
}

async function sendWhatsAppToDriver(phone, booking) {
  try {
    // Use approved template for driver (requires 9 parameters)
    // Generate map URL from pickup location
    let mapUrl = 'https://maps.google.com';
    if (booking.pickup_location) {
      mapUrl = `https://maps.google.com/?q=${encodeURIComponent(booking.pickup_location)}`;
    }

    const components = [{
      type: "body",
      parameters: [
        { type: "text", text: booking.driver_name || "Driver" },                    // {{1}}
        { type: "text", text: booking.pickup_location || "N/A" },                   // {{2}}
        { type: "text", text: booking.dropoff_location || "N/A" },                  // {{3}}
        { type: "text", text: booking.pickup_datetime || new Date().toLocaleString() }, // {{4}}
        { type: "text", text: booking.customer_name || "Customer" },                // {{5}}
        { type: "text", text: booking.customer_phone || "N/A" },                    // {{6}}
        { type: "text", text: booking.vehicle_model || booking.vehicle_type || "Standard" }, // {{7}}
        { type: "text", text: booking.id ? booking.id.substring(0, 8).toUpperCase() : "N/A" }, // {{8}}
        { type: "text", text: mapUrl }                                              // {{9}}
      ]
    }];

    const resp = await sendWhatsAppTemplate(phone, 'booking_assigned_driver', 'en', components);

    try {
      await Notification.logNotification({
        recipient_type: 'driver',
        recipient_phone: phone,
        channel: 'whatsapp',
        template_id: 'booking_assigned_driver',
        content: JSON.stringify(components),
        status: resp.success ? 'sent' : 'failed',
        metadata: { booking_id: booking.id }
      });
    } catch (e) {
      logger.error('Notification log error (driver whatsapp):', e);
    }
    return resp;
  } catch (error) {
    logger.error('sendWhatsAppToDriver error:', error);
    return { success: false, error: error.message };
  }
}

async function sendWhatsAppToAdmin(data) {
  try {
    const adminNumber = process.env.ADMIN_WHATSAPP || '';

    let text = '';
    let bookingId = null;

    if (typeof data === 'string') {
      text = data;
    } else if (data && data.id) {
      text = `New booking: ${data.id.substring(0, 8).toUpperCase()} - ${data.customer_name} - ${data.pickup_location} -> ${data.dropoff_location}`;
      bookingId = data.id;
    } else {
      logger.warn('Invalid data passed to sendWhatsAppToAdmin');
      return { success: false, error: 'Invalid data' };
    }

    if (!adminNumber) {
      logger.warn('No ADMIN_WHATSAPP configured');
      return { success: true, message: 'Admin WhatsApp not configured' };
    }

    const resp = await sendWhatsAppMessage(adminNumber, text);

    try {
      await Notification.logNotification({
        recipient_type: 'admin',
        recipient_phone: adminNumber,
        channel: 'whatsapp',
        template_id: 'admin_alert',
        content: text,
        status: resp.success ? 'sent' : 'failed',
        metadata: { booking_id: bookingId }
      });
    } catch (e) {
      logger.error('Notification log error (admin whatsapp):', e);
    }
    return resp;
  } catch (error) {
    logger.error('sendWhatsAppToAdmin error:', error);
    return { success: false, error: error.message };
  }
}

async function sendEmailToCustomer(toEmail, booking) {
  try {
    const resp = await emailService.sendCustomerNotification(booking, null);
    try {
      await Notification.logNotification({
        recipient_type: 'customer',
        recipient_email: toEmail,
        channel: 'email',
        template_id: 'booking_confirmation_email',
        content: `Booking confirmation sent to ${toEmail}`,
        status: resp.success ? 'sent' : 'failed',
        metadata: { booking_id: booking.id }
      });
    } catch (e) {
      logger.error('Notification log error (customer email):', e);
    }
    return resp;
  } catch (error) {
    logger.error('sendEmailToCustomer error:', error);
    return { success: false, error: error.message };
  }
}

async function sendEmailToDriver(driverEmail, booking) {
  try {
    if (!driverEmail) {
      logger.warn('No driver email configured');
      return { success: false, error: 'No driver email' };
    }
    if (!RESEND_API_KEY) {
      logger.warn('Resend API key not configured - driver email not sent (test mode)');
      return { success: true, message: 'Driver email would be sent (Resend API key not configured)' };
    }

    const template = emailTemplates.bookingConfirmation(booking, null);

    // Primary: SMTP
    const smtpHost = process.env.SMTP_HOST;
    try {
      if (nodemailer && smtpHost) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '465', 10),
          secure: (process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === 'TRUE'),
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
        });

        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'info@booking.digitalmindsdemo.com',
          to: driverEmail,
          subject: template.subject,
          html: template.html
        });

        logger.info(`Driver email sent to ${driverEmail} via SMTP`);

        try {
          await Notification.logNotification({
            recipient_type: 'driver',
            recipient_email: driverEmail,
            channel: 'email',
            template_id: 'booking_assigned_email',
            content: `Driver email sent to ${driverEmail}`,
            status: 'sent',
            metadata: { booking_id: booking.id }
          });
        } catch (e) {
          logger.error('Notification log error (driver email):', e);
        }
        return { success: true, message: 'Email sent via SMTP' };
      }
    } catch (smtpError) {
      logger.error(`SMTP failed, trying Resend: ${smtpError.message}`);
    }

    if (!fetchImpl) {
      logger.warn('Fetch not available - cannot send driver email');
      return { success: false, error: 'Fetch not available' };
    }

    const resp = await fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: driverEmail,
        subject: template.subject,
        html: template.html
      })
    });

    const json = await resp.json();
    if (!resp.ok) throw new Error(json.message || 'Failed to send driver email');
    logger.info(`Driver email sent to ${driverEmail}`);
    try {
      await Notification.logNotification({
        recipient_type: 'driver',
        recipient_email: driverEmail,
        channel: 'email',
        template_id: 'booking_assigned_email',
        content: `Driver email sent to ${driverEmail}`,
        status: 'sent',
        metadata: { booking_id: booking.id }
      });
    } catch (e) {
      logger.error('Notification log error (driver email):', e);
    }
    return { success: true, result: json };
  } catch (error) {
    logger.error('sendEmailToDriver error:', error);
    return { success: false, error: error.message };
  }
}

async function sendEmailToAdmin(booking) {
  try {
    const resp = await emailService.sendAdminNotification(booking, null);
    try {
      await Notification.logNotification({
        recipient_type: 'admin',
        recipient_email: process.env.ADMIN_EMAIL || null,
        channel: 'email',
        template_id: 'booking_alert_email',
        content: `Admin email sent for booking ${booking.id}`,
        status: resp.success ? 'sent' : 'failed',
        metadata: { booking_id: booking.id }
      });
    } catch (e) {
      logger.error('Notification log error (admin email):', e);
    }
    return resp;
  } catch (error) {
    logger.error('sendEmailToAdmin error:', error);
    return { success: false, error: error.message };
  }
}

async function sendDriverApprovalNotification(driver) {
  try {
    const text = `Hello ${driver.name}, your driver account has been approved. You can now log in and receive bookings.`;
    await sendWhatsAppMessage(driver.phone, text);
    if (driver.email) {
      const template = {
        subject: 'Driver Account Approved',
        html: `<p>Hello ${driver.name},</p><p>Your driver account has been <strong>approved</strong>. You can now log in.</p>`
      };

      // Primary: SMTP
      let sentViaSmtp = false;
      const smtpHost = process.env.SMTP_HOST;
      try {
        if (nodemailer && smtpHost) {
          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: parseInt(process.env.SMTP_PORT || '465', 10),
            secure: (process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === 'TRUE'),
            auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
          });

          await transporter.sendMail({
            from: process.env.SMTP_FROM || 'info@booking.digitalmindsdemo.com',
            to: driver.email,
            subject: template.subject,
            html: template.html
          });
          logger.info(`Driver approval email sent to ${driver.email} via SMTP`);
          sentViaSmtp = true;
        }
      } catch (smtpError) {
        logger.error(`SMTP failed, trying Resend: ${smtpError.message}`);
      }

      if (!sentViaSmtp && RESEND_API_KEY) {
        if (!fetchImpl) {
          logger.warn('Fetch not available - cannot send approval email');
        } else {
          const resp = await fetchImpl('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: RESEND_FROM_EMAIL, to: driver.email, subject: template.subject, html: template.html })
          });
          const json = await resp.json();
          if (!resp.ok) throw new Error(json.message || 'Failed to send approval email');
        }
      } else {
        logger.warn('Resend API not configured - approval email not sent (test mode)');
      }
    }
    try {
      await Notification.logNotification({
        recipient_type: 'driver',
        recipient_phone: driver.phone,
        recipient_email: driver.email || null,
        channel: 'whatsapp',
        template_id: 'driver_approved',
        content: text,
        status: 'sent',
        metadata: {}
      });
    } catch (e) {
      logger.error('Notification log error (driver approval):', e);
    }
    return { success: true };
  } catch (error) {
    logger.error('sendDriverApprovalNotification error:', error);
    return { success: false, error: error.message };
  }
}

async function sendWordPressBookingAdminEmail(booking, vehicle) {
  try {
    const resp = await emailService.sendWordPressBookingNotification(booking, vehicle);
    try {
      await Notification.logNotification({
        recipient_type: 'admin',
        recipient_email: process.env.ADMIN_EMAIL || 'multiple_recipients',
        channel: 'email',
        template_id: 'wordpress_booking_alert',
        content: `WordPress booking email sent for ${booking.id}`,
        status: resp.success ? 'sent' : 'failed',
        metadata: { booking_id: booking.id }
      });
    } catch (e) {
      logger.error('Notification log error (wordpress admin email):', e);
    }
    return resp;
  } catch (error) {
    logger.error('sendWordPressBookingAdminEmail error:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendWhatsAppMessage,
  sendWhatsAppTemplate,
  sendWhatsAppToCustomer,
  sendWhatsAppToDriver,
  sendWhatsAppToAdmin,
  sendEmailToCustomer,
  sendEmailToDriver,
  sendEmailToAdmin,
  sendDriverApprovalNotification,
  sendWordPressBookingAdminEmail,
  sendDriverAssignedNotification,
  sendTripCompletedNotification,

  /**
   * Handle driver response from WhatsApp button (Accept/Reject)
   */
  async handleDriverResponse(from, response, buttonId) {
    try {
      const Driver = require('../models/Driver');
      const Booking = require('../models/Booking');

      // 1. Find Driver by Phone
      // WhatsApp sends number like '971501234567' (no +)
      // DB might have '+971501234567' or '0501234567'
      // Try exact, then with +, then fuzzy
      let driver = await Driver.findByPhone(from);
      if (!driver) {
        driver = await Driver.findByPhone('+' + from);
      }

      if (!driver) {
        logger.warn(`Received ${response} from unknown driver phone: ${from}`);
        return { success: false, error: 'Driver not found' };
      }

      logger.info(`Processing ${response} from driver: ${driver.name} (${driver.id})`);

      // 2. Identify Booking
      // If buttonId contains ID (e.g. "reject_123") use it
      let bookingId = null;
      if (buttonId) {
        const parts = buttonId.split('_');
        if (parts.length > 1 && !isNaN(parts[parts.length - 1])) {
          bookingId = parseInt(parts[parts.length - 1]);
        }
      }

      // If no ID in button, find active assigned booking
      let booking;
      if (bookingId) {
        booking = await Booking.findById(bookingId);
      } else {
        // Find latest booking assigned to this driver that is 'assigned' or 'pending'
        const result = await query(
          `SELECT * FROM bookings 
             WHERE driver_id = $1 
             AND status IN ('assigned', 'pending_driver') 
             ORDER BY created_at DESC LIMIT 1`,
          [driver.id]
        );
        booking = result.rows[0];
      }

      if (!booking) {
        logger.warn(`No active booking found for driver ${driver.id} to ${response}`);
        return { success: false, error: 'No active booking found' };
      }

      // 3. Process Response
      if (response === 'reject') {
        logger.info(`Driver ${driver.name} REJECTED booking ${booking.id}`);

        // Update status to 'manual_assignment_required' so it appears in Admin Dashboard
        // And clear the driver assignment so it's open again? 
        // Or keep driver_id to show WHO rejected?
        // Let's set status 'driver_rejected' if system supports it, or 'manual_assignment_required'.
        await query(
          `UPDATE bookings 
             SET status = 'manual_assignment_required', 
                 notes = COALESCE(notes, '') || '\n[System] Driver ${driver.name} rejected via WhatsApp at ' || NOW()
             WHERE id = $1`,
          [booking.id]
        );

        // Notify Admin
        const adminMsg = `⚠️ *Driver Rejection Alert*\n\nDriver: ${driver.name}\nBooking ID: #${booking.id}\nPickup: ${booking.pickup_location}\n\nDriver clicked "Reject/Busy". Please reassign manually.`;
        await module.exports.sendWhatsAppToAdmin(adminMsg); // Use module.exports to access self

      } else if (response === 'accept') {
        logger.info(`Driver ${driver.name} ACCEPTED booking ${booking.id}`);

        // Update status to 'confirmed' or 'driver_accepted'
        await query(
          `UPDATE bookings SET status = 'driver_accepted', updated_at = NOW() WHERE id = $1`,
          [booking.id]
        );

        // Notify Admin
        await module.exports.sendWhatsAppToAdmin(`✅ Driver ${driver.name} ACCEPTED booking #${booking.id}.`);

        // Notify Customer ?? (Optional, maybe specific flow)
      }

      return { success: true };

    } catch (error) {
      logger.error(`handleDriverResponse error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
};
