const rbacMiddleware = (requiredRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    if (requiredRoles.length === 0) {
      return next();
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: `Access denied. Required role(s): ${requiredRoles.join(', ')}` 
      });
    }

    next();
  };
};

module.exports = rbacMiddleware;
