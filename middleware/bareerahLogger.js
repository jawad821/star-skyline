const logger = require('../utils/logger');

// Comprehensive Bareerah logging middleware
const bareerahLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming request details
  console.log('\n' + '='.repeat(80));
  console.log('🔔 BAREERAH INCOMING REQUEST');
  console.log('='.repeat(80));
  console.log('⏰ Time:', new Date().toISOString());
  console.log('📍 Method:', req.method);
  console.log('🔗 Path:', req.path);
  console.log('👥 Remote IP:', req.ip);
  
  // Log headers
  console.log('\n📋 Headers:');
  Object.entries(req.headers).forEach(([key, value]) => {
    if (key.toLowerCase() !== 'authorization') {
      console.log(`   ${key}: ${value}`);
    } else {
      console.log(`   ${key}: [REDACTED]`);
    }
  });
  
  // Log body (request data)
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    console.log('\n📦 Request Body:');
    console.log(JSON.stringify(req.body, null, 2));
  }
  
  // Intercept response to log what's being sent back
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    console.log('\n' + '─'.repeat(80));
    console.log('✅ BAREERAH RESPONSE SENT');
    console.log('─'.repeat(80));
    console.log('⏱️  Duration:', duration + 'ms');
    console.log('📊 Status Code:', res.statusCode);
    console.log('\n📤 Response Data:');
    console.log(JSON.stringify(data, null, 2));
    console.log('='.repeat(80) + '\n');
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Error logging middleware
const bareerahErrorLogger = (err, req, res, next) => {
  console.log('\n' + '❌'.repeat(40));
  console.log('🚨 BAREERAH ERROR ENCOUNTERED');
  console.log('❌'.repeat(40));
  console.log('⏰ Time:', new Date().toISOString());
  console.log('📍 Endpoint:', req.method, req.path);
  console.log('❌ Error Message:', err.message);
  console.log('🔍 Error Code:', err.code);
  console.log('\n📝 Error Details:');
  console.log(JSON.stringify(err, null, 2));
  console.log('❌'.repeat(40) + '\n');
  
  next(err);
};

module.exports = { bareerahLogger, bareerahErrorLogger };
