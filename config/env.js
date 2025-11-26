module.exports = {
  DATABASE_URL: process.env.DATABASE_URL,
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_USER: process.env.ADMIN_USER || 'admin',
  ADMIN_PASS: process.env.ADMIN_PASS || 'admin123',
  OPERATOR_USER: process.env.OPERATOR_USER || 'operator',
  OPERATOR_PASS: process.env.OPERATOR_PASS || 'operator123',
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000'
};

