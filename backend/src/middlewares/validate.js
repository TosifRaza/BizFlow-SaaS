const validate = (schema) => {
  return (req, res, next) => {
    const errors = {};
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body?.[field];
      if (rules.required && (!value && value !== 0 && value !== false)) {
        errors[field] = rules.message || `${field} is required`;
      } else if (value && rules.minLength && String(value).length < rules.minLength) {
        errors[field] = rules.message || `${field} must be at least ${rules.minLength} characters`;
      } else if (value && rules.maxLength && String(value).length > rules.maxLength) {
        errors[field] = rules.message || `${field} must be at most ${rules.maxLength} characters`;
      } else if (value && rules.pattern && !rules.pattern.test(value)) {
        errors[field] = rules.message || `${field} format is invalid`;
      } else if (value && rules.min !== undefined && Number(value) < rules.min) {
        errors[field] = rules.message || `${field} must be at least ${rules.min}`;
      } else if (value && rules.max !== undefined && Number(value) > rules.max) {
        errors[field] = rules.message || `${field} must be at most ${rules.max}`;
      } else if (value && rules.enum && !rules.enum.includes(value)) {
        errors[field] = rules.message || `${field} must be one of: ${rules.enum.join(', ')}`;
      }
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, message: 'Validation Error', errorCode: 'VALIDATION_ERROR', errors });
    }
    next();
  };
};
module.exports = validate;
