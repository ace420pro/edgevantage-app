import validator from 'validator';
import { ObjectId } from 'mongodb';

// Input sanitization utilities
export class InputSanitizer {
  // Sanitize string input
  static sanitizeString(input, options = {}) {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    let sanitized = input.trim();
    
    if (options.escape) {
      sanitized = validator.escape(sanitized);
    }
    
    if (options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }
    
    if (options.minLength && sanitized.length < options.minLength) {
      throw new Error(`Input must be at least ${options.minLength} characters`);
    }
    
    return sanitized;
  }

  // Sanitize email
  static sanitizeEmail(email) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required and must be a string');
    }

    const sanitized = validator.normalizeEmail(email.trim().toLowerCase(), {
      gmail_remove_dots: false,
      gmail_remove_subaddress: false
    });

    if (!sanitized || !validator.isEmail(sanitized)) {
      throw new Error('Invalid email format');
    }

    return sanitized;
  }

  // Sanitize phone number
  static sanitizePhone(phone) {
    if (!phone || typeof phone !== 'string') {
      throw new Error('Phone number is required and must be a string');
    }

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Check for valid US phone number format
    if (!/^1?[2-9]\d{2}[2-9]\d{2}\d{4}$/.test(cleaned)) {
      throw new Error('Invalid US phone number format');
    }

    // Format as (XXX) XXX-XXXX
    const formatted = cleaned.length === 11 && cleaned[0] === '1' 
      ? cleaned.substring(1) 
      : cleaned;
    
    return `(${formatted.substring(0, 3)}) ${formatted.substring(3, 6)}-${formatted.substring(6)}`;
  }

  // Sanitize MongoDB ObjectId
  static sanitizeObjectId(id) {
    if (!id) {
      throw new Error('ID is required');
    }

    if (typeof id !== 'string') {
      throw new Error('ID must be a string');
    }

    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid ID format');
    }

    return new ObjectId(id);
  }

  // Sanitize US state code
  static sanitizeStateCode(state) {
    if (!state || typeof state !== 'string') {
      throw new Error('State is required and must be a string');
    }

    const cleaned = state.trim().toUpperCase();
    
    // List of valid US state codes
    const validStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
      'DC'
    ];

    if (!validStates.includes(cleaned)) {
      throw new Error('Invalid US state code');
    }

    return cleaned;
  }

  // Sanitize general text field
  static sanitizeText(text, options = {}) {
    if (!text || typeof text !== 'string') {
      if (options.required) {
        throw new Error('Text field is required');
      }
      return null;
    }

    let sanitized = text.trim();
    
    // Remove HTML tags
    sanitized = validator.stripLow(sanitized);
    
    // Escape HTML entities if requested
    if (options.escape) {
      sanitized = validator.escape(sanitized);
    }

    // Check length limits
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }
    
    if (options.minLength && sanitized.length < options.minLength) {
      throw new Error(`Text must be at least ${options.minLength} characters`);
    }

    return sanitized;
  }

  // Sanitize boolean field
  static sanitizeBoolean(value, fieldName = 'field') {
    if (value === null || value === undefined) {
      throw new Error(`${fieldName} is required`);
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'true' || lower === 'yes' || lower === '1') {
        return true;
      }
      if (lower === 'false' || lower === 'no' || lower === '0') {
        return false;
      }
    }

    throw new Error(`${fieldName} must be a boolean value`);
  }

  // Sanitize URL
  static sanitizeUrl(url, options = {}) {
    if (!url || typeof url !== 'string') {
      if (options.required) {
        throw new Error('URL is required');
      }
      return null;
    }

    const trimmed = url.trim();
    
    if (!validator.isURL(trimmed, {
      protocols: options.protocols || ['http', 'https'],
      require_protocol: options.requireProtocol !== false
    })) {
      throw new Error('Invalid URL format');
    }

    return trimmed;
  }

  // Sanitize numeric input
  static sanitizeNumber(value, options = {}) {
    if (value === null || value === undefined) {
      if (options.required) {
        throw new Error('Number is required');
      }
      return null;
    }

    const num = Number(value);
    
    if (isNaN(num)) {
      throw new Error('Invalid number format');
    }

    if (options.min !== undefined && num < options.min) {
      throw new Error(`Number must be at least ${options.min}`);
    }

    if (options.max !== undefined && num > options.max) {
      throw new Error(`Number must be no more than ${options.max}`);
    }

    if (options.integer && !Number.isInteger(num)) {
      throw new Error('Number must be an integer');
    }

    return num;
  }
}

// Lead-specific validation
export class LeadValidator {
  static validateLeadInput(data) {
    const errors = [];
    const sanitized = {};

    try {
      // Required fields
      sanitized.name = InputSanitizer.sanitizeText(data.name, { 
        required: true, 
        minLength: 2, 
        maxLength: 100,
        escape: true 
      });
    } catch (error) {
      errors.push(`Name: ${error.message}`);
    }

    try {
      sanitized.email = InputSanitizer.sanitizeEmail(data.email);
    } catch (error) {
      errors.push(`Email: ${error.message}`);
    }

    try {
      sanitized.phone = InputSanitizer.sanitizePhone(data.phone);
    } catch (error) {
      errors.push(`Phone: ${error.message}`);
    }

    try {
      sanitized.state = InputSanitizer.sanitizeStateCode(data.state);
    } catch (error) {
      errors.push(`State: ${error.message}`);
    }

    try {
      sanitized.city = InputSanitizer.sanitizeText(data.city, { 
        required: true, 
        minLength: 2, 
        maxLength: 50,
        escape: true 
      });
    } catch (error) {
      errors.push(`City: ${error.message}`);
    }

    // Qualification questions
    try {
      sanitized.hasResidence = data.hasResidence === 'yes';
      sanitized.hasInternet = data.hasInternet === 'yes';
      sanitized.hasSpace = data.hasSpace === 'yes';
    } catch (error) {
      errors.push(`Qualification: ${error.message}`);
    }

    // Optional fields
    if (data.referralCode) {
      try {
        sanitized.referralCode = InputSanitizer.sanitizeText(data.referralCode, { 
          maxLength: 50,
          escape: true 
        });
      } catch (error) {
        errors.push(`Referral Code: ${error.message}`);
      }
    }

    if (data.referralSource) {
      try {
        sanitized.referralSource = InputSanitizer.sanitizeText(data.referralSource, { 
          maxLength: 100,
          escape: true 
        });
      } catch (error) {
        errors.push(`Referral Source: ${error.message}`);
      }
    }

    // Analytics fields (optional)
    ['sessionId', 'ipAddress', 'utmSource', 'utmMedium', 'utmCampaign'].forEach(field => {
      if (data[field]) {
        try {
          sanitized[field] = InputSanitizer.sanitizeText(data[field], { 
            maxLength: 255,
            escape: true 
          });
        } catch (error) {
          errors.push(`${field}: ${error.message}`);
        }
      }
    });

    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }

    return sanitized;
  }
}

export default {
  InputSanitizer,
  LeadValidator
};