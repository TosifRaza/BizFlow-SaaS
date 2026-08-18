const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    successResponse(res, result, 'Registration successful. Welcome to BizFlow!', 201);
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });
    successResponse(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      const err = new Error('Refresh token required');
      err.statusCode = 401;
      throw err;
    }
    const data = await authService.refreshToken(refreshToken);
    res.json(data);
  } catch (error) {
    if (!error.statusCode) error.statusCode = 401;
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    successResponse(res, result, 'Password reset email sent');
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    successResponse(res, result, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const result = await authService.changePassword(req.user._id, req.body.currentPassword, req.body.newPassword);
    successResponse(res, result, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    successResponse(res, user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user._id, req.body);
    successResponse(res, user, 'Profile updated');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, forgotPassword, resetPassword, changePassword, getProfile, updateProfile };
