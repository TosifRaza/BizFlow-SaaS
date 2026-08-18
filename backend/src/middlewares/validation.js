class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
        errorCode: 'VALIDATION_ERROR',
      });
    }
    req.body = schema.validate(req.body, { stripUnknown: true }).value;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
        errorCode: 'VALIDATION_ERROR',
      });
    }
    next();
  };
};

module.exports = { AppError, validateBody, validateQuery };
