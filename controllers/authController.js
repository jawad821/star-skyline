const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { JWT_SECRET, ADMIN_USER, ADMIN_PASS } = require('../config/env');

const authController = {
  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
      }
      
      // First try to find user by email in database
      const result = await query('SELECT id, email, role, password_hash FROM users WHERE email = $1 OR (role = $2 AND $3 = $4)', 
        [username, 'admin', username, ADMIN_USER]);
      
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            error: 'Invalid credentials'
          });
        }
        
        const token = jwt.sign(
          { username: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.json({
          success: true,
          token,
          user: { username: user.email, role: user.role }
        });
        return;
      }
      
      // Fallback to hardcoded admin credentials
      if (username !== ADMIN_USER) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      const isValidPassword = password === ADMIN_PASS;
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      const token = jwt.sign(
        { username, role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        token,
        user: { username, role: 'admin' }
      });
    } catch (error) {
      next(error);
    }
  },

  async verify(req, res, next) {
    try {
      res.json({
        success: true,
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = authController;
