const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token format'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch latest user details from DB to ensure we have the correct email
    try {
      const { query } = require('../config/db');
      if (decoded.id) {
        const userResult = await query('SELECT id, email, role, name FROM users WHERE id = $1', [decoded.id]);
        if (userResult.rows.length > 0) {
          req.user = userResult.rows[0];
          // Ensure username property exists for compatibility
          req.user.username = req.user.email;
        } else {
          req.user = decoded;
        }
      } else {
        req.user = decoded;
      }
    } catch (dbError) {
      console.error('Auth Middleware DB Error:', dbError);
      req.user = decoded;
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. Please login again.',
        code: 'TOKEN_INVALID'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'Authentication failed. Please login again.',
      code: 'AUTH_FAILED'
    });
  }
};

module.exports = authMiddleware;
