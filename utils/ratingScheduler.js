const { query } = require('../config/db');
const emailService = require('./emailService');
const ratingTemplate = require('./ratingTemplate');
const logger = require('./logger');

const ratingScheduler = {
  pendingJobs: new Map(),

  scheduleRatingEmail(bookingId, delayMs = 120000) {
    // Clear any existing job for this booking
    if (this.pendingJobs.has(bookingId)) {
      clearTimeout(this.pendingJobs.get(bookingId));
    }

    const timeout = setTimeout(async () => {
      try {
        const booking = await query(
          'SELECT * FROM bookings WHERE id = $1',
          [bookingId]
        );

        if (booking.rows[0]) {
          const emailTemplate = ratingTemplate.requestRating(booking.rows[0]);

          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM_EMAIL || 'noreply@starskylinelimousine.com',
              to: booking.rows[0].customer_email,
              subject: emailTemplate.subject,
              html: emailTemplate.html
            })
          });

          if (response.ok) {
            logger.info(`Rating email sent for booking ${bookingId}`);
            this.pendingJobs.delete(bookingId);
          }
        }
      } catch (error) {
        logger.error(`Failed to send rating email: ${error.message}`);
      }
    }, delayMs);

    this.pendingJobs.set(bookingId, timeout);
  },

  cancelRatingEmail(bookingId) {
    if (this.pendingJobs.has(bookingId)) {
      clearTimeout(this.pendingJobs.get(bookingId));
      this.pendingJobs.delete(bookingId);
    }
  }
};

module.exports = ratingScheduler;
