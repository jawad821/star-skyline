const Notification = require('../models/Notification');

// WhatsApp Notification Functions
const sendWhatsAppToCustomer = async (phone, bookingData) => {
  const message = `
🚖 Booking Confirmed!
Booking ID: #${bookingData.id}
Pickup: ${bookingData.pickup_location}
Dropoff: ${bookingData.dropoff_location}
Fare: AED ${bookingData.fare_aed}
Driver: ${bookingData.driver_name}
Driver Phone: ${bookingData.driver_phone}

Track your ride: [Link coming soon]
  `.trim();

  console.log(`📱 WhatsApp → ${phone}: ${message}`);
  
  await Notification.logNotification({
    recipient_type: 'customer',
    recipient_phone: phone,
    channel: 'whatsapp',
    template_id: 'booking_confirmation',
    content: message,
    status: 'sent',
    metadata: { booking_id: bookingData.id }
  });
};

const sendWhatsAppToDriver = async (phone, bookingData) => {
  const message = `
🎯 New Booking Assigned!
Booking ID: #${bookingData.id}
Customer: ${bookingData.customer_name}
Customer Phone: ${bookingData.customer_phone}
Pickup: ${bookingData.pickup_location}
Dropoff: ${bookingData.dropoff_location}
Distance: ${bookingData.distance_km} km
Estimated Fare: AED ${bookingData.fare_aed}
Car: ${bookingData.vehicle_type.toUpperCase()}
  `.trim();

  console.log(`📱 WhatsApp → ${phone}: ${message}`);
  
  await Notification.logNotification({
    recipient_type: 'driver',
    recipient_phone: phone,
    channel: 'whatsapp',
    template_id: 'booking_assigned',
    content: message,
    status: 'sent',
    metadata: { booking_id: bookingData.id }
  });
};

const sendWhatsAppToAdmin = async (bookingData) => {
  const message = `
📊 New Booking Alert!
Booking ID: #${bookingData.id}
Customer: ${bookingData.customer_name}
Driver: ${bookingData.driver_name}
Vehicle: ${bookingData.vehicle_type.toUpperCase()}
Fare: AED ${bookingData.fare_aed}
Status: ${bookingData.status}
  `.trim();

  console.log(`📱 WhatsApp → Admin: ${message}`);
  
  await Notification.logNotification({
    recipient_type: 'admin',
    channel: 'whatsapp',
    template_id: 'booking_alert',
    content: message,
    status: 'sent',
    metadata: { booking_id: bookingData.id }
  });
};

// Email Notification Functions
const sendEmailToCustomer = async (email, bookingData) => {
  const subject = `Booking Confirmation #${bookingData.id}`;
  const content = `
Dear ${bookingData.customer_name},

Your booking has been confirmed!

Booking Details:
- Booking ID: #${bookingData.id}
- Pickup: ${bookingData.pickup_location}
- Dropoff: ${bookingData.dropoff_location}
- Distance: ${bookingData.distance_km} km
- Vehicle: ${bookingData.vehicle_type.toUpperCase()}
- Total Fare: AED ${bookingData.fare_aed}
- Driver: ${bookingData.driver_name}
- Driver Phone: ${bookingData.driver_phone}

Your ride is on its way!

Best regards,
Bareerah Limo Service
  `.trim();

  console.log(`📧 Email → ${email}: ${subject}`);
  
  await Notification.logNotification({
    recipient_type: 'customer',
    recipient_email: email,
    channel: 'email',
    template_id: 'booking_confirmation_email',
    content: content,
    status: 'sent',
    metadata: { booking_id: bookingData.id }
  });
};

const sendEmailToDriver = async (email, bookingData) => {
  const subject = `New Booking Assigned #${bookingData.id}`;
  const content = `
Dear ${bookingData.driver_name},

You have been assigned a new booking!

Booking Details:
- Booking ID: #${bookingData.id}
- Customer: ${bookingData.customer_name}
- Customer Phone: ${bookingData.customer_phone}
- Pickup: ${bookingData.pickup_location}
- Dropoff: ${bookingData.dropoff_location}
- Distance: ${bookingData.distance_km} km
- Estimated Fare: AED ${bookingData.fare_aed}

Please confirm your acceptance in the driver app.

Best regards,
Bareerah Admin
  `.trim();

  console.log(`📧 Email → ${email}: ${subject}`);
  
  await Notification.logNotification({
    recipient_type: 'driver',
    recipient_email: email,
    channel: 'email',
    template_id: 'booking_assigned_email',
    content: content,
    status: 'sent',
    metadata: { booking_id: bookingData.id }
  });
};

const sendEmailToAdmin = async (email, bookingData) => {
  const subject = `New Booking: #${bookingData.id} - ${bookingData.customer_name}`;
  const content = `
New booking created in the system.

Booking Details:
- Booking ID: #${bookingData.id}
- Customer: ${bookingData.customer_name} (${bookingData.customer_phone})
- Driver: ${bookingData.driver_name}
- Vehicle: ${bookingData.vehicle_type.toUpperCase()}
- Pickup: ${bookingData.pickup_location}
- Dropoff: ${bookingData.dropoff_location}
- Distance: ${bookingData.distance_km} km
- Fare: AED ${bookingData.fare_aed}
- Payment: ${bookingData.payment_method}
- Status: ${bookingData.status}

Manage from dashboard: [Dashboard Link]
  `.trim();

  console.log(`📧 Email → ${email}: ${subject}`);
  
  await Notification.logNotification({
    recipient_type: 'admin',
    recipient_email: email,
    channel: 'email',
    template_id: 'booking_alert_email',
    content: content,
    status: 'sent',
    metadata: { booking_id: bookingData.id }
  });
};

module.exports = {
  sendWhatsAppToCustomer,
  sendWhatsAppToDriver,
  sendWhatsAppToAdmin,
  sendEmailToCustomer,
  sendEmailToDriver,
  sendEmailToAdmin
};
