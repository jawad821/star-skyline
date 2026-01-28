const ratingEmailTemplate = {
  requestRating: (booking) => {
    const ratingLink = `${process.env.API_BASE_URL || 'http://localhost:8000'}/api/ratings/form?booking_id=${booking.id}`;

    return {
      subject: `Please rate your Star Skyline Limousine ride - Ref #${booking.id.substring(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007AFF;">How was your ride? 🚕</h2>
          
          <p>Thank you for choosing Star Skyline Limousine! We'd love to hear about your experience.</p>
          
          <div style="background: #f5f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Trip Summary</h3>
            <p><strong>From:</strong> ${booking.pickup_location}</p>
            <p><strong>To:</strong> ${booking.dropoff_location}</p>
            <p><strong>Driver:</strong> ${booking.driver_name || 'Your driver'}</p>
            <p><strong>Fare:</strong> AED ${booking.fare_aed.toFixed(2)}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${ratingLink}" style="background: #007AFF; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Rate This Trip</a>
          </div>
          
          <p style="color: #86868b; font-size: 12px; margin-top: 30px;">
            Your feedback helps us improve our service and reward great drivers. Thank you!
          </p>
        </div>
      `
    };
  }
};

module.exports = ratingEmailTemplate;
