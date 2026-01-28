/**
 * Email & WhatsApp Notification Templates
 * NOTE: Commissions and profits are NEVER sent to customers - internal use only
 */

const emailTemplates = {
  // Email to customer
  bookingConfirmation: (booking, vehicle) => {
    const bookingDate = new Date(booking.created_at);
    const bookingId = booking.id.substring(0, 8).toUpperCase();
    const fare = typeof booking.fare_aed === 'string' ? parseFloat(booking.fare_aed) : booking.fare_aed;
    const paymentStatus = booking.payment_method === 'cash'
      ? 'Cash - To be collected in vehicle'
      : 'Card - Prepaid';

    const vehicleName = booking.vehicle_model || (booking.vehicle_type ? booking.vehicle_type.replace('_', ' ').toUpperCase() : 'Standard');
    const vehicleColor = booking.vehicle_color || 'Color TBA';

    // Format date
    const dateStr = bookingDate.toLocaleDateString('en-AE', {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Dubai'
    });
    const timeStr = bookingDate.toLocaleTimeString('en-AE', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai'
    });

    return {
      subject: `✅ Your Star Skyline Limousine Ride Confirmed - ${booking.booking_type === 'round_trip' ? '🔄 Round Trip' : booking.booking_type === 'multi_stop' ? '📍 Multi-Stop' : '🚗 Point-to-Point'} - Ref #${bookingId}`,
      html: `
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
              <h1 style="color: #ffc107; margin: 0; font-size: 24px; font-weight: 600;">Booking Confirmed!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Your ride is ready. Ref: <strong>${bookingId}</strong></p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <!-- Booking Reference Box -->
              <div style="background: #ffc107; color: #1a1a2e; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</span>
                <div style="font-size: 18px; font-weight: 700; margin-top: 5px;">${bookingId}</div>
                <div style="margin-top: 5px; font-size: 11px; background: rgba(0,0,0,0.1); display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: 600;">PENDING CONFIRMATION</div>
              </div>

              <!-- Customer Details -->
              <div style="margin-bottom: 25px;">
                <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ffc107;">Customer Details</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr><td style="padding: 8px 0; color: #666;">Name:</td><td style="padding: 8px 0; color: #333; font-weight: 500;">${booking.customer_name}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;">Phone:</td><td style="padding: 8px 0; color: #333;">${booking.customer_phone}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;">Passengers:</td><td style="padding: 8px 0; color: #333;">${booking.passengers_count || 1}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;">Luggage:</td><td style="padding: 8px 0; color: #333;">${booking.luggage_count || 0}</td></tr>
                </table>
              </div>

              <!-- Trip Details -->
              <div style="margin-bottom: 25px;">
                <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ffc107;">Trip Details</h3>
                <div style="display: flex; margin-bottom: 15px;">
                  <div style="width: 30px;">
                    <div style="width: 12px; height: 12px; background: #4caf50; border-radius: 50%; margin: 3px auto;"></div>
                    <div style="width: 2px; height: 40px; background: #ddd; margin: 0 auto;"></div>
                    <div style="width: 12px; height: 12px; background: #f44336; border-radius: 50%; margin: 3px auto;"></div>
                  </div>
                  <div style="flex: 1;">
                    <div style="padding: 0 0 25px 10px;">
                      <div style="font-size: 12px; color: #999;">Pickup</div>
                      <div style="font-size: 14px; color: #333; font-weight: 500;">${booking.pickup_location}</div>
                      <div style="font-size: 12px; color: #666;">${dateStr}, ${timeStr}</div>
                    </div>
                    <div style="padding: 0 0 0 10px;">
                      <div style="font-size: 12px; color: #999;">Dropoff</div>
                      <div style="font-size: 14px; color: #333; font-weight: 500;">${booking.dropoff_location}</div>
                    </div>
                  </div>
                </div>
                
                ${booking.booking_type === 'round_trip' ? `
                <div style="background: #f8f9fa; padding: 10px; border-left: 3px solid #f59e0b; margin-top: 10px; font-size: 13px;">
                  <strong>🔄 Return Trip:</strong> Driver will wait for ${booking.return_after_hours || 0} hours before returning.
                </div>` : ''}
              </div>

              <!-- Vehicle Details -->
              <div style="margin-bottom: 25px;">
                <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ffc107;">Vehicle Information</h3>
                <table style="width: 100%; font-size: 14px;">
                  <tr><td style="padding: 8px 0; color: #666;">Vehicle:</td><td style="padding: 8px 0; color: #333; font-weight: 500;">${vehicleName}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;">Color:</td><td style="padding: 8px 0; color: #333;">${vehicleColor}</td></tr>
                </table>
              </div>

              ${booking.notes ? `
              <!-- Notes -->
              <div style="margin-bottom: 25px;">
                <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ffc107;">Special Instructions</h3>
                <p style="background: #fff8dc; padding: 15px; border-radius: 8px; font-size: 14px; color: #333; margin: 0; border-left: 4px solid #f59e0b;">${booking.notes}</p>
              </div>
              ` : ''}

              <!-- Fare -->
              <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                <span style="color: #999; font-size: 12px; text-transform: uppercase;">Total Fare</span>
                <div style="color: #ffc107; font-size: 28px; font-weight: 700; margin-top: 5px;">AED ${fare.toFixed(2)}</div>
                <div style="color: #ccc; font-size: 12px; margin-top: 5px;">${paymentStatus}</div>
              </div>

              <!-- CTA -->
              <a href="${process.env.API_BASE_URL || 'http://localhost:5000'}/api/bookings/status?id=${bookingId}" style="display: block; width: 220px; margin: 0 auto; padding: 14px 0; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; font-size: 15px;">Track My Booking</a>

              <!-- Support -->
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 25px; text-align: center;">
                <div style="font-size: 12px; color: #666; margin-bottom: 5px;">Need Help?</div>
                <div style="font-size: 16px; font-weight: 700; color: #1e3a8a;">📞 +971 56 8662710</div>
                <div style="font-size: 12px; color: #666; margin-top: 5px;">
                  <a href="mailto:support@starskylinelimousine.com" style="color: #2563eb; text-decoration: none;">support@starskylinelimousine.com</a>
                </div>
              </div>

              <!-- Footer -->
              <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #999; font-size: 11px; margin: 0;">Trusted by thousands across UAE • Available 24/7</p>
                <div style="margin-top: 10px; font-size: 11px;">
                  <a href="#" style="color: #2563eb; text-decoration: none; margin: 0 5px;">Terms</a> | 
                  <a href="#" style="color: #2563eb; text-decoration: none; margin: 0 5px;">Privacy</a>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  // WhatsApp message to customer
  whatsappTemplate: (booking, vehicle) => {
    const paymentStatus = booking.payment_method === 'cash'
      ? '💳 Payment in vehicle'
      : '✓ Paid by card';

    return `
🎉 *BOOKING CONFIRMED*

*Ref #:* ${booking.id.substring(0, 8).toUpperCase()}
*Type:* ${booking.booking_type === 'round_trip' ? '🔄 Round Trip' : booking.booking_type === 'multi_stop' ? '📍 Multi-Stop' : '🚗 Point-to-Point'}

👥 *Passengers:* ${booking.passengers_count || 1} | 🎒 *Luggage:* ${booking.luggage_count || 0}

📍 *From:* ${booking.pickup_location}
${booking.meeting_location && booking.booking_type === 'round_trip' ? `🎯 *Destination:* ${booking.meeting_location}` : ''}
🏁 *To:* ${booking.dropoff_location}

📏 *Distance:* ${booking.distance_km} km
${booking.return_after_hours ? `⏰ *Return After:* ${booking.return_after_hours} hours` : ''}

🚗 *Vehicle:* ${booking.vehicle_model || 'To be assigned'}
🎨 *Color:* ${booking.vehicle_color || 'TBA'}

💰 *Fare:* AED ${(typeof booking.fare_aed === 'string' ? parseFloat(booking.fare_aed) : booking.fare_aed).toFixed(2)}
${paymentStatus}

${booking.notes ? `📝 *Notes:* ${booking.notes}` : ''}

✅ Your driver will contact you shortly!
📞 Call: +971 56 8662710

Thank you for choosing Star Skyline Limousine! 🙏
    `.trim();
  },

  // Email to admin
  adminNotification: (booking, vehicle) => {
    const fareAmount = typeof booking.fare_aed === 'string' ? parseFloat(booking.fare_aed) : booking.fare_aed;
    const vendorCommission = fareAmount * 0.80;
    const companyProfit = fareAmount * 0.20;
    const bookingId = booking.id.substring(0, 8).toUpperCase();

    return {
      subject: `📊 New Booking Alert - ${booking.booking_type.toUpperCase()} - Ref #${bookingId}`,
      html: `
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
              <h1 style="color: #ffc107; margin: 0; font-size: 24px; font-weight: 600;">New Admin Booking Alert</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">Revenue: <strong style="color: #4caf50;">AED ${companyProfit.toFixed(2)}</strong></p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <!-- Booking Reference Box -->
              <div style="background: #ffc107; color: #1a1a2e; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</span>
                <div style="font-size: 18px; font-weight: 700; margin-top: 5px;">${bookingId}</div>
              </div>

              <!-- Customer Details -->
              <div style="margin-bottom: 25px;">
                <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ffc107;">Customer Info</h3>
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
                    <div style="width: 2px; height: 40px; background: #ddd; margin: 0 auto;"></div>
                    <div style="width: 12px; height: 12px; background: #f44336; border-radius: 50%; margin: 3px auto;"></div>
                  </div>
                  <div style="flex: 1;">
                    <div style="padding: 0 0 25px 10px;">
                      <div style="font-size: 12px; color: #999;">Pickup</div>
                      <div style="font-size: 14px; color: #333; font-weight: 500;">${booking.pickup_location}</div>
                    </div>
                    <div style="padding: 0 0 0 10px;">
                      <div style="font-size: 12px; color: #999;">Dropoff</div>
                      <div style="font-size: 14px; color: #333; font-weight: 500;">${booking.dropoff_location}</div>
                    </div>
                  </div>
                </div>
                <div style="font-size: 14px; color: #666; background: #f8f9fa; padding: 10px; border-radius: 4px;">
                  <strong>Type:</strong> ${booking.booking_type} | <strong>Distance:</strong> ${booking.distance_km} km
                </div>
              </div>

              <!-- Revenue Breakdown -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 15px 0; color: #166534; font-size: 14px;">💰 Financial Breakdown</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                  <span style="color: #666;">Total Fare:</span>
                  <span style="font-weight: 700; color: #333;">AED ${fareAmount.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                  <span style="color: #666;">Vendor (80%):</span>
                  <span style="font-weight: 600; color: #333;">AED ${vendorCommission.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 14px; padding-top: 8px; border-top: 1px solid rgba(0,0,0,0.1);">
                  <span style="color: #166534; font-weight: 600;">Using Company Profit (20%):</span>
                  <span style="font-weight: 700; color: #166534;">AED ${companyProfit.toFixed(2)}</span>
                </div>
              </div>

              <div style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
                Automated System Alert • Star Skyline Limousine
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  },

  // Ride Completion Email
  rideCompletion: (booking) => {
    const fareAmount = typeof booking.fare_aed === 'string' ? parseFloat(booking.fare_aed) : booking.fare_aed;
    const bookingId = booking.id.substring(0, 8).toUpperCase();

    return {
      subject: `✅ Ride Completed - Ref #${bookingId}`,
      html: `
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
              <h1 style="color: #ffc107; margin: 0; font-size: 24px; font-weight: 600;">Ride Completed</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 14px;">We hope you enjoyed your journey!</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <!-- Booking Reference Box -->
              <div style="background: #ffc107; color: #1a1a2e; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 25px;">
                <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Booking Reference</span>
                <div style="font-size: 18px; font-weight: 700; margin-top: 5px;">${bookingId}</div>
              </div>

              <!-- Trip Summary -->
              <div style="margin-bottom: 25px;">
                <h3 style="color: #1a1a2e; font-size: 16px; margin: 0 0 15px 0; padding-bottom: 10px; border-bottom: 2px solid #ffc107;">Trip Summary</h3>
                <div style="display: flex; margin-bottom: 15px;">
                  <div style="width: 30px;">
                    <div style="width: 12px; height: 12px; background: #4caf50; border-radius: 50%; margin: 3px auto;"></div>
                    <div style="width: 2px; height: 30px; background: #ddd; margin: 0 auto;"></div>
                    <div style="width: 12px; height: 12px; background: #f44336; border-radius: 50%; margin: 3px auto;"></div>
                  </div>
                  <div style="flex: 1;">
                    <div style="padding: 0 0 20px 10px; font-size: 14px; color: #333;">${booking.pickup_location}</div>
                    <div style="padding: 0 0 0 10px; font-size: 14px; color: #333;">${booking.dropoff_location}</div>
                  </div>
                </div>
              </div>

              <!-- Receipt -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                <h4 style="margin: 0 0 15px 0; color: #166534; font-size: 14px;">💰 Receipt</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
                  <span style="color: #666;">Total Fare:</span>
                  <span style="font-weight: 700; color: #333;">AED ${fareAmount.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.1);">
                  <span style="color: #666;">Payment Method:</span>
                  <span style="font-weight: 600; color: #333;">${booking.payment_method === 'cash' ? 'Cash' : 'Card'}</span>
                </div>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #666; font-size: 14px; margin-bottom: 20px;">How was your experience?</p>
                <a href="${process.env.API_BASE_URL || 'http://localhost:5000'}/api/bookings/rate?id=${bookingId}" style="display: inline-block; padding: 12px 25px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">Rate Your Driver</a>
              </div>

              <div style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
                Star Skyline Limousine Premium Ride Service
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
  }
};

module.exports = emailTemplates;
