const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const config = require('../config');
const { errorResponse } = require('../utils/response');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', 401, 'NO_TOKEN');
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 'Invalid token. User not found.', 401, 'INVALID_TOKEN');
    }
    if (user.status === 'suspended') {
      return errorResponse(res, 'Account has been suspended. Contact support.', 403, 'ACCOUNT_SUSPENDED');
    }
    if (user.status === 'inactive') {
      return errorResponse(res, 'Account is inactive.', 403, 'ACCOUNT_INACTIVE');
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', 401, 'INVALID_TOKEN');
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please login again.', 401, 'TOKEN_EXPIRED');
    }
    next(error);
  }
};

const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return errorResponse(res, 'Refresh token is required.', 401, 'NO_REFRESH_TOKEN');
    }
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return errorResponse(res, 'Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN');
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid refresh token.', 401, 'INVALID_REFRESH_TOKEN');
    }
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Refresh token expired. Please login again.', 401, 'REFRESH_TOKEN_EXPIRED');
    }
    next(error);
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401, 'NOT_AUTHENTICATED');
    }
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'You do not have permission to perform this action.', 403, 'INSUFFICIENT_ROLE');
    }
    next();
  };
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return errorResponse(res, 'Authentication required.', 401, 'NOT_AUTHENTICATED');
      }
      if (req.user.role === 'super_admin') {
        return next();
      }
      if (req.user.role === 'owner') {
        return next();
      }
      const userRole = await Role.findOne({ businessId: req.user.businessId, name: req.user.role });
      if (!userRole || !userRole.permissions.includes(permission)) {
        return errorResponse(res, `Permission denied. Required: ${permission}`, 403, 'INSUFFICIENT_PERMISSION');
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { verifyToken, verifyRefreshToken, requireRole, requirePermission };
