module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_USER: process.env.ADMIN_USER || 'admin',
  ADMIN_PASS: process.env.ADMIN_PASS || 'admin123',
  OPERATOR_USER: process.env.OPERATOR_USER || 'operator',
  OPERATOR_PASS: process.env.OPERATOR_PASS || 'operator123',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
  // Email Configuration (Resend)
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'aizaz.dmp@gmail.com',
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || 'noreply@bareerah.com',
  // WhatsApp Configuration
  WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN,
  WHATSAPP_PHONE_ID: process.env.WHATSAPP_PHONE_ID
};

