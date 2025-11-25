const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
