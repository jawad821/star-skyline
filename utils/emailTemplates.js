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

    // Format date
    const dateStr = bookingDate.toLocaleDateString('en-AE', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    const timeStr = bookingDate.toLocaleTimeString('en-AE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Build journey info based on booking type
    let journeyHtml = '';
    if (booking.booking_type === 'round_trip') {
      journeyHtml = `
        <div style="margin-top: 15px; padding: 12px; background: #f8f8f8; border-left: 4px solid #1e3a8a;">
          <div style="margin: 8px 0;">
            <div style="display: flex; align-items: center;">
              <span style="color: #1e3a8a; font-weight: bold; margin-right: 8px;">📍</span>
              <div>
                <div style="font-size: 12px; color: #666;">Pickup</div>
                <div style="font-weight: 600; color: #1d1d1f;">${booking.pickup_location}</div>
              </div>
            </div>
          </div>
          <div style="margin: 12px 0; text-align: center; color: #999; font-size: 12px;">
            ↓ ${booking.return_after_hours ? booking.return_after_hours + ' hours' : 'Duration'} ↓
          </div>
          <div style="margin: 8px 0;">
            <div style="display: flex; align-items: center;">
              <span style="color: #f59e0b; font-weight: bold; margin-right: 8px;">🎯</span>
              <div>
                <div style="font-size: 12px; color: #666;">Destination</div>
                <div style="font-weight: 600; color: #1d1d1f;">${booking.meeting_location || booking.dropoff_location}</div>
              </div>
            </div>
          </div>
          <div style="margin: 12px 0; text-align: center; color: #999; font-size: 12px;">
            ↓ Return ↓
          </div>
          <div style="margin: 8px 0;">
            <div style="display: flex; align-items: center;">
              <span style="color: #10b981; font-weight: bold; margin-right: 8px;">🏁</span>
              <div>
                <div style="font-size: 12px; color: #666;">Return To</div>
                <div style="font-weight: 600; color: #1d1d1f;">${booking.pickup_location}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (booking.booking_type === 'multi_stop') {
      journeyHtml = `
        <div style="margin-top: 15px; padding: 12px; background: #f8f8f8; border-left: 4px solid #1e3a8a;">
          <div style="margin: 8px 0;">
            <div style="display: flex; align-items: center;">
              <span style="color: #1e3a8a; font-weight: bold; margin-right: 8px;">📍</span>
              <div>
                <div style="font-size: 12px; color: #666;">Pickup</div>
                <div style="font-weight: 600; color: #1d1d1f;">${booking.pickup_location}</div>
              </div>
            </div>
          </div>
          <div style="margin: 12px 0; text-align: center; color: #999; font-size: 12px;">↓</div>
          <div style="margin: 8px 0;">
            <div style="display: flex; align-items: center;">
              <span style="color: #f59e0b; font-weight: bold; margin-right: 8px;">🎯</span>
              <div>
                <div style="font-size: 12px; color: #666;">Dropoff</div>
                <div style="font-weight: 600; color: #1d1d1f;">${booking.dropoff_location}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      journeyHtml = `
        <div style="margin-top: 15px; padding: 12px; background: #f8f8f8; border-left: 4px solid #1e3a8a;">
          <div style="margin: 8px 0;">
            <div style="display: flex; align-items: center;">
              <span style="color: #1e3a8a; font-weight: bold; margin-right: 8px;">📍</span>
              <div>
                <div style="font-size: 12px; color: #666;">Pickup</div>
                <div style="font-weight: 600; color: #1d1d1f;">${booking.pickup_location}</div>
              </div>
            </div>
          </div>
          <div style="margin: 12px 0; text-align: center; color: #999; font-size: 12px;">↓</div>
          <div style="margin: 8px 0;">
            <div style="display: flex; align-items: center;">
              <span style="color: #10b981; font-weight: bold; margin-right: 8px;">🏁</span>
              <div>
                <div style="font-size: 12px; color: #666;">Dropoff</div>
                <div style="font-weight: 600; color: #1d1d1f;">${booking.dropoff_location}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return {
      subject: `✅ Your Bareerrah Ride Confirmed - ${booking.booking_type === 'round_trip' ? '🔄 Round Trip' : booking.booking_type === 'multi_stop' ? '📍 Multi-Stop' : '🚗 Point-to-Point'} - Ref #${bookingId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
            .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 30px 20px; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 14px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
            .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
            .info-row:last-child { border-bottom: none; }
            .info-label { color: #666; font-weight: 500; }
            .info-value { color: #1d1d1f; font-weight: 600; }
            .highlight { color: #1e3a8a; font-weight: 700; }
            .badge { display: inline-block; background: #e8f0fe; color: #1e3a8a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
            .vehicle-card { background: linear-gradient(135deg, #f8f9fa 0%, #f0f3f7 100%); padding: 16px; border-radius: 8px; margin-top: 12px; border: 1px solid #e0e0e0; }
            .vehicle-detail { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; }
            .vehicle-detail-label { color: #666; }
            .vehicle-detail-value { color: #1d1d1f; font-weight: 600; }
            .fare-box { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .fare-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
            .fare-amount { font-size: 36px; font-weight: 700; color: #10b981; }
            .fare-method { font-size: 12px; color: #666; margin-top: 5px; }
            .cta-button { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 16px; text-align: center; border-radius: 8px; font-weight: 600; margin: 20px 0; text-decoration: none; display: block; font-size: 16px; letter-spacing: 0.5px; }
            .cta-button:hover { opacity: 0.9; }
            .notes-section { background: #fff8dc; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin: 15px 0; font-size: 13px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; }
            .footer-link { color: #2563eb; text-decoration: none; margin: 0 10px; }
            .support-box { background: #f0f3f7; padding: 15px; border-radius: 8px; margin: 15px 0; font-size: 13px; text-align: center; }
            .support-phone { font-size: 18px; font-weight: 700; color: #1e3a8a; margin: 10px 0; letter-spacing: 1px; }
            .status-badge { background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Your ride is ready. Ref: <strong>${bookingId}</strong></p>
            </div>

            <!-- Main Content -->
            <div class="content">
              <!-- Booking Reference & Status -->
              <div class="section">
                <div class="section-title">📋 Booking Reference</div>
                <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Booking ID</div>
                      <div style="font-size: 24px; font-weight: 700; color: #1e3a8a; letter-spacing: 2px;">${bookingId}</div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Status</div>
                      <span class="status-badge">PENDING CONFIRMATION</span>
                    </div>
                  </div>
                  <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 13px; color: #666;">
                    <strong>Booked on:</strong> ${dateStr} at ${timeStr}
                  </div>
                </div>
              </div>

              <!-- Passenger Details -->
              <div class="section">
                <div class="section-title">👥 Passenger Information</div>
                <div class="info-row">
                  <span class="info-label">Passengers</span>
                  <span class="info-value">${booking.passengers_count || 1} ${booking.passengers_count === 1 ? 'person' : 'people'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Luggage</span>
                  <span class="info-value">${booking.luggage_count || 0} ${booking.luggage_count === 1 ? 'bag' : 'bags'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Contact</span>
                  <span class="info-value">${booking.customer_phone}</span>
                </div>
              </div>

              <!-- Journey Details -->
              <div class="section">
                <div class="section-title">🛣️ Your Journey</div>
                <div style="background: white;">
                  ${journeyHtml}
                  <div style="margin-top: 12px; padding: 10px 0; border-top: 1px solid #f0f0f0; font-size: 13px;">
                    <strong>Distance:</strong> <span style="color: #1e3a8a; font-weight: 600;">${booking.distance_km} km</span>
                  </div>
                  ${booking.booking_type === 'round_trip' ? `
                    <div style="margin-top: 10px; padding: 8px 0; font-size: 13px;">
                      <strong>Return After:</strong> <span style="color: #f59e0b; font-weight: 600;">${booking.return_after_hours || 2} hours</span>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Vehicle Details -->
              <div class="section">
                <div class="section-title">🚗 Vehicle Details</div>
                <div class="vehicle-card">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                      <div style="font-size: 16px; font-weight: 700; color: #1d1d1f;">
                        ${booking.vehicle_model || 'Vehicle to be assigned'}
                      </div>
                      <div style="font-size: 12px; color: #666; margin-top: 2px;">
                        ${booking.vehicle_type ? booking.vehicle_type.replace('_', ' ').toUpperCase() : 'Standard'}
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <div style="font-size: 20px; margin-bottom: 4px;">🎨</div>
                      <div style="font-size: 12px; font-weight: 600; color: #1e3a8a;">
                        ${booking.vehicle_color || 'Color TBA'}
                      </div>
                    </div>
                  </div>
                  <div style="border-top: 1px solid #e0e0e0; padding-top: 12px;">
                    <div style="font-size: 12px; color: #666; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Capacity</div>
                    <div style="display: flex; gap: 15px;">
                      <div>
                        <div style="font-size: 11px; color: #999;">Seats</div>
                        <div style="font-size: 14px; font-weight: 600; color: #1e3a8a;">Up to 4</div>
                      </div>
                      <div>
                        <div style="font-size: 11px; color: #999;">Luggage</div>
                        <div style="font-size: 14px; font-weight: 600; color: #1e3a8a;">Large Trunk</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Fare & Payment -->
              <div class="section">
                <div class="section-title">💰 Fare & Payment</div>
                <div class="fare-box">
                  <div class="fare-label">Total Fare</div>
                  <div class="fare-amount">AED ${fare.toFixed(2)}</div>
                  <div class="fare-method">
                    <strong>${paymentStatus}</strong>
                  </div>
                </div>
              </div>

              <!-- Special Notes -->
              ${booking.notes ? `
                <div class="section">
                  <div class="section-title">📝 Special Instructions</div>
                  <div class="notes-section">
                    "${booking.notes}"
                  </div>
                </div>
              ` : ''}

              <!-- Support -->
              <div class="support-box">
                <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Need Help?</div>
                <div class="support-phone">📞 +971 4 XXXX XXXX</div>
                <div style="font-size: 12px; color: #666; margin-top: 8px;">
                  Available 24/7 | <a href="mailto:support@bareerah.com" style="color: #2563eb; text-decoration: none;">support@bareerah.com</a>
                </div>
              </div>

              <!-- CTA -->
              <a href="#" class="cta-button">✓ Confirm Booking</a>

              <!-- What's Next -->
              <div style="background: #f0f3f7; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <div style="font-weight: 600; color: #1e3a8a; margin-bottom: 10px; font-size: 14px;">What happens next?</div>
                <ol style="margin: 0; padding-left: 20px; font-size: 13px; color: #666; line-height: 1.8;">
                  <li>Your booking is pending confirmation</li>
                  <li>Driver will be assigned shortly</li>
                  <li>You'll receive driver details via SMS/WhatsApp</li>
                  <li>Driver will contact you 10 mins before pickup</li>
                  <li>Rate your experience after completion</li>
                </ol>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div style="margin-bottom: 12px;">
                <strong style="color: #1d1d1f;">🚗 Bareerrah Premium Ride Service</strong>
              </div>
              <div style="margin: 12px 0; font-size: 11px;">
                Trusted by thousands across UAE • Available 24/7
              </div>
              <div style="margin: 12px 0; font-size: 11px;">
                <a href="#" class="footer-link">Terms & Conditions</a> | 
                <a href="#" class="footer-link">Privacy Policy</a> | 
                <a href="#" class="footer-link">Help Center</a>
              </div>
              <div style="margin-top: 15px; padding-top: 12px; border-top: 1px solid #e0e0e0; font-size: 10px; color: #999;">
                This is an automated email. Please do not reply. For support, contact us at support@bareerah.com
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
📞 Call: +971 4 XXXX XXXX

Thank you for choosing Bareerrah! 🙏
    `.trim();
  },

  // Email to admin
  adminNotification: (booking, vehicle) => {
    const fareAmount = typeof booking.fare_aed === 'string' ? parseFloat(booking.fare_aed) : booking.fare_aed;
    const vendorCommission = fareAmount * 0.80;
    const companyProfit = fareAmount * 0.20;

    return {
      subject: `📊 New Booking Alert - ${booking.booking_type.toUpperCase()} - Ref #${booking.id.substring(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">📊 New Booking Received</h2>
          
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1d1d1f;">Customer Info</h3>
            <p><strong>Name:</strong> ${booking.customer_name}</p>
            <p><strong>Phone:</strong> ${booking.customer_phone}</p>
            <p><strong>Email:</strong> ${booking.customer_email}</p>
            <p><strong>Passengers:</strong> ${booking.passengers_count || 1} | <strong>Luggage:</strong> ${booking.luggage_count || 0}</p>
          </div>

          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Trip Details</h3>
            <p><strong>Booking #:</strong> ${booking.id}</p>
            <p><strong>Type:</strong> ${booking.booking_type}</p>
            <p><strong>From:</strong> ${booking.pickup_location}</p>
            <p><strong>To:</strong> ${booking.dropoff_location}</p>
            <p><strong>Distance:</strong> ${booking.distance_km} km</p>
            ${booking.meeting_location ? `<p><strong>Intermediate:</strong> ${booking.meeting_location}</p>` : ''}
            ${booking.return_after_hours ? `<p><strong>Return After:</strong> ${booking.return_after_hours} hours</p>` : ''}
          </div>

          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Vehicle & Driver</h3>
            <p><strong>Model:</strong> ${booking.vehicle_model || 'To be assigned'}</p>
            <p><strong>Color:</strong> ${booking.vehicle_color || 'TBA'}</p>
            <p><strong>Type:</strong> ${booking.vehicle_type || 'Standard'}</p>
            <p><strong>Driver:</strong> ${booking.driver_name || 'Unassigned'}</p>
          </div>

          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Revenue Breakdown</h3>
            <p><strong>Total Fare:</strong> AED ${fareAmount.toFixed(2)}</p>
            <p><strong>Vendor Commission (80%):</strong> AED ${vendorCommission.toFixed(2)}</p>
            <p style="color: #34C759;"><strong>Company Profit (20%):</strong> AED ${companyProfit.toFixed(2)}</p>
          </div>

          <p style="color: #86868b; font-size: 12px;">Status: ${booking.status} | Time: ${new Date().toLocaleString()}</p>
        </div>
      `
    };
  }
};

module.exports = emailTemplates;
