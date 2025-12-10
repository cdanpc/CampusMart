/**
 * Validation Utilities
 * Common validation functions for forms and inputs
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {{valid: boolean, error?: string}}
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {{valid: boolean, error?: string, strength?: string}}
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecialChar = false
  } = options;

  if (!password) {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain an uppercase letter' };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain a lowercase letter' };
  }

  if (requireNumber && !/\d/.test(password)) {
    return { valid: false, error: 'Password must contain a number' };
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { valid: false, error: 'Password must contain a special character' };
  }

  // Calculate strength
  let strength = 'weak';
  if (password.length >= 12 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password) && /[!@#$%^&*]/.test(password)) {
    strength = 'strong';
  } else if (password.length >= 10 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password)) {
    strength = 'medium';
  }

  return { valid: true, strength };
};

/**
 * Validate phone number (Philippine format)
 * @param {string} phone - Phone number to validate
 * @returns {{valid: boolean, error?: string}}
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) {
    return { valid: false, error: 'Phone number is required' };
  }

  const cleaned = phone.replace(/\D/g, '');

  // Philippine mobile: 09XXXXXXXXX (11 digits)
  if (cleaned.startsWith('09') && cleaned.length === 11) {
    return { valid: true };
  }

  // Alternative format: +639XXXXXXXXX
  if (cleaned.startsWith('639') && cleaned.length === 12) {
    return { valid: true };
  }

  return { valid: false, error: 'Invalid phone number format (use 09XXXXXXXXX)' };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {{valid: boolean, error?: string}}
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  return { valid: true };
};

/**
 * Validate number within range
 * @param {number} value - Number to validate
 * @param {Object} options - Validation options
 * @returns {{valid: boolean, error?: string}}
 */
export const validateNumber = (value, options = {}) => {
  const { min, max, fieldName = 'Value', allowDecimal = true } = options;

  if (value === null || value === undefined || value === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  if (!allowDecimal && !Number.isInteger(num)) {
    return { valid: false, error: `${fieldName} must be a whole number` };
  }

  if (min !== undefined && num < min) {
    return { valid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { valid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { valid: true };
};

/**
 * Validate price
 * @param {number|string} price - Price to validate
 * @returns {{valid: boolean, error?: string}}
 */
export const validatePrice = (price) => {
  return validateNumber(price, {
    min: 0,
    fieldName: 'Price',
    allowDecimal: true
  });
};

/**
 * Validate form with multiple fields
 * @param {Object} formData - Form data object
 * @param {Object} rules - Validation rules object
 * @returns {{valid: boolean, errors: Object}}
 */
export const validateForm = (formData, rules) => {
  const errors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = formData[field];

    if (rule.required) {
      const result = validateRequired(value, rule.label || field);
      if (!result.valid) {
        errors[field] = result.error;
        continue;
      }
    }

    if (rule.type === 'email') {
      const result = validateEmail(value);
      if (!result.valid) {
        errors[field] = result.error;
      }
    }

    if (rule.type === 'phone') {
      const result = validatePhoneNumber(value);
      if (!result.valid) {
        errors[field] = result.error;
      }
    }

    if (rule.type === 'number') {
      const result = validateNumber(value, {
        min: rule.min,
        max: rule.max,
        fieldName: rule.label || field,
        allowDecimal: rule.allowDecimal
      });
      if (!result.valid) {
        errors[field] = result.error;
      }
    }

    if (rule.type === 'password') {
      const result = validatePassword(value, rule.options);
      if (!result.valid) {
        errors[field] = result.error;
      }
    }

    if (rule.custom) {
      const result = rule.custom(value, formData);
      if (!result.valid) {
        errors[field] = result.error;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
