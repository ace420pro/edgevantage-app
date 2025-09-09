// Comprehensive input validation utilities
import { APIError, ErrorTypes } from './errors.js';

// Validation patterns
const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]{10,15}$/,
  usPhone: /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  alphaNumeric: /^[a-zA-Z0-9]+$/,
  name: /^[a-zA-Z\s'-]{2,50}$/,
  city: /^[a-zA-Z\s'-]{2,50}$/,
  state: /^[a-zA-Z\s]{2,50}$/,
  mongoObjectId: /^[a-f\d]{24}$/i,
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

// Validation schemas for different endpoints
export const VALIDATION_SCHEMAS = {
  userRegistration: {
    name: { required: true, type: 'string', pattern: 'name', minLength: 2, maxLength: 50 },
    email: { required: true, type: 'string', pattern: 'email', maxLength: 100 },
    password: { required: true, type: 'string', minLength: 6, maxLength: 100 },
    phone: { required: false, type: 'string', pattern: 'phone', maxLength: 20 }
  },
  
  userLogin: {
    email: { required: true, type: 'string', pattern: 'email', maxLength: 100 },
    password: { required: true, type: 'string', minLength: 1, maxLength: 100 }
  },
  
  leadApplication: {
    name: { required: true, type: 'string', pattern: 'name', minLength: 2, maxLength: 50 },
    email: { required: true, type: 'string', pattern: 'email', maxLength: 100 },
    phone: { required: true, type: 'string', pattern: 'phone', maxLength: 20 },
    state: { required: true, type: 'string', pattern: 'state', maxLength: 50 },
    city: { required: true, type: 'string', pattern: 'city', maxLength: 50 },
    hasResidence: { required: true, type: 'string', enum: ['yes', 'no'] },
    hasInternet: { required: true, type: 'string', enum: ['yes', 'no'] },
    hasSpace: { required: true, type: 'string', enum: ['yes', 'no'] },
    agreeToTerms: { required: true, type: 'boolean', enum: [true] },
    referralCode: { required: false, type: 'string', maxLength: 50 },
    referralSource: { 
      required: true, 
      type: 'string', 
      enum: ['google', 'social-media', 'friend-referral', 'advertisement', 'other'],
      maxLength: 50 
    }
  },
  
  passwordReset: {
    email: { required: true, type: 'string', pattern: 'email', maxLength: 100 }
  },
  
  passwordResetConfirm: {
    token: { required: true, type: 'string', minLength: 10, maxLength: 500 },
    password: { required: true, type: 'string', minLength: 6, maxLength: 100 }
  },
  
  emailVerification: {
    token: { required: true, type: 'string', minLength: 10, maxLength: 500 }
  },
  
  affiliateApplication: {
    name: { required: true, type: 'string', pattern: 'name', minLength: 2, maxLength: 50 },
    email: { required: true, type: 'string', pattern: 'email', maxLength: 100 },
    phone: { required: false, type: 'string', pattern: 'phone', maxLength: 20 },
    experience: { required: false, type: 'string', maxLength: 500 },
    motivation: { required: false, type: 'string', maxLength: 500 }
  }
};

// Main validation function
export function validateInput(data, schema, options = {}) {
  const errors = [];
  const sanitized = {};
  const { strict = true, allowExtra = false } = options;
  
  // Check for required fields
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    // Check if required field is missing
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        message: `${field} is required`,
        code: 'REQUIRED_FIELD'
      });
      continue;
    }
    
    // Skip validation for optional missing fields
    if (!rules.required && (value === undefined || value === null || value === '')) {
      continue;
    }
    
    // Validate field
    const fieldErrors = validateField(field, value, rules);
    if (fieldErrors.length > 0) {
      errors.push(...fieldErrors);
    } else {
      // Sanitize and add to result
      sanitized[field] = sanitizeValue(value, rules);
    }
  }
  
  // Check for extra fields in strict mode
  if (strict && !allowExtra) {
    const extraFields = Object.keys(data).filter(key => !schema[key]);
    if (extraFields.length > 0) {
      errors.push({
        field: 'extra_fields',
        message: `Unexpected fields: ${extraFields.join(', ')}`,
        code: 'EXTRA_FIELDS',
        fields: extraFields
      });
    }
  }
  
  // Throw validation error if any errors found
  if (errors.length > 0) {
    throw new APIError(
      `Validation failed: ${errors.map(e => e.message).join(', ')}`,
      400,
      ErrorTypes.VALIDATION_ERROR,
      { validationErrors: errors }
    );
  }
  
  return sanitized;
}

// Validate individual field
function validateField(fieldName, value, rules) {
  const errors = [];
  
  // Type validation
  if (rules.type && typeof value !== rules.type) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be of type ${rules.type}`,
      code: 'INVALID_TYPE'
    });
    return errors;
  }
  
  // String validations
  if (rules.type === 'string' && typeof value === 'string') {
    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at least ${rules.minLength} characters`,
        code: 'MIN_LENGTH'
      });
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must not exceed ${rules.maxLength} characters`,
        code: 'MAX_LENGTH'
      });
    }
    
    // Pattern validation
    if (rules.pattern && PATTERNS[rules.pattern] && !PATTERNS[rules.pattern].test(value)) {
      errors.push({
        field: fieldName,
        message: getPatternErrorMessage(fieldName, rules.pattern),
        code: 'INVALID_PATTERN'
      });
    }
  }
  
  // Enum validation
  if (rules.enum && !rules.enum.includes(value)) {
    errors.push({
      field: fieldName,
      message: `${fieldName} must be one of: ${rules.enum.join(', ')}`,
      code: 'INVALID_ENUM'
    });
  }
  
  // Number validations
  if (rules.type === 'number' && typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must be at least ${rules.min}`,
        code: 'MIN_VALUE'
      });
    }
    
    if (rules.max !== undefined && value > rules.max) {
      errors.push({
        field: fieldName,
        message: `${fieldName} must not exceed ${rules.max}`,
        code: 'MAX_VALUE'
      });
    }
  }
  
  return errors;
}

// Sanitize values
function sanitizeValue(value, rules) {
  if (rules.type === 'string' && typeof value === 'string') {
    // Trim whitespace
    value = value.trim();
    
    // Convert email to lowercase
    if (rules.pattern === 'email') {
      value = value.toLowerCase();
    }
    
    // Clean phone numbers
    if (rules.pattern === 'phone' || rules.pattern === 'usPhone') {
      value = value.replace(/\D/g, ''); // Remove non-digits
      if (value.length === 10) {
        value = `+1${value}`; // Add country code for US numbers
      }
    }
  }
  
  return value;
}

// Get user-friendly error messages for patterns
function getPatternErrorMessage(fieldName, pattern) {
  const messages = {
    email: `${fieldName} must be a valid email address`,
    phone: `${fieldName} must be a valid phone number`,
    usPhone: `${fieldName} must be a valid US phone number`,
    strongPassword: `${fieldName} must contain at least 8 characters with uppercase, lowercase, number, and special character`,
    name: `${fieldName} must contain only letters, spaces, hyphens, and apostrophes`,
    city: `${fieldName} must contain only letters, spaces, hyphens, and apostrophes`,
    state: `${fieldName} must contain only letters and spaces`,
    alphaNumeric: `${fieldName} must contain only letters and numbers`,
    mongoObjectId: `${fieldName} must be a valid MongoDB ObjectId`,
    jwt: `${fieldName} must be a valid JWT token`,
    url: `${fieldName} must be a valid URL`,
    zipCode: `${fieldName} must be a valid ZIP code`
  };
  
  return messages[pattern] || `${fieldName} format is invalid`;
}

// Quick validation helpers
export const validate = {
  email: (email) => {
    if (!email || !PATTERNS.email.test(email)) {
      throw new APIError('Invalid email address', 400, ErrorTypes.VALIDATION_ERROR);
    }
    return email.toLowerCase().trim();
  },
  
  password: (password, strong = false) => {
    if (!password || password.length < 6) {
      throw new APIError('Password must be at least 6 characters', 400, ErrorTypes.VALIDATION_ERROR);
    }
    if (strong && !PATTERNS.strongPassword.test(password)) {
      throw new APIError(
        'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
        400,
        ErrorTypes.VALIDATION_ERROR
      );
    }
    return password;
  },
  
  phone: (phone) => {
    if (phone && !PATTERNS.phone.test(phone)) {
      throw new APIError('Invalid phone number format', 400, ErrorTypes.VALIDATION_ERROR);
    }
    return phone ? phone.replace(/\D/g, '') : phone;
  },
  
  name: (name) => {
    if (!name || !PATTERNS.name.test(name)) {
      throw new APIError('Invalid name format', 400, ErrorTypes.VALIDATION_ERROR);
    }
    return name.trim();
  },
  
  objectId: (id) => {
    if (!id || !PATTERNS.mongoObjectId.test(id)) {
      throw new APIError('Invalid ID format', 400, ErrorTypes.VALIDATION_ERROR);
    }
    return id;
  },
  
  required: (value, fieldName) => {
    if (value === undefined || value === null || value === '') {
      throw new APIError(`${fieldName} is required`, 400, ErrorTypes.VALIDATION_ERROR);
    }
    return value;
  }
};

// Sanitization helpers
export const sanitize = {
  html: (str) => {
    if (!str) return str;
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },
  
  sql: (str) => {
    if (!str) return str;
    return str.replace(/'/g, "''");
  },
  
  filename: (str) => {
    if (!str) return str;
    return str.replace(/[^a-zA-Z0-9._-]/g, '');
  }
};

export default {
  validateInput,
  validate,
  sanitize,
  VALIDATION_SCHEMAS,
  PATTERNS
};