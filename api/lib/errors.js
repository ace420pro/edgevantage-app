// Standardized error handling for all API endpoints

export class APIError extends Error {
  constructor(message, statusCode = 500, code = null, details = null) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

// Common error types
export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR'
};

// Predefined error responses
export const CommonErrors = {
  INVALID_EMAIL: new APIError('Invalid email format', 400, ErrorTypes.VALIDATION_ERROR),
  INVALID_PASSWORD: new APIError('Password must be at least 6 characters', 400, ErrorTypes.VALIDATION_ERROR),
  MISSING_REQUIRED_FIELD: (field) => new APIError(`${field} is required`, 400, ErrorTypes.VALIDATION_ERROR),
  USER_NOT_FOUND: new APIError('User not found', 404, ErrorTypes.NOT_FOUND),
  EMAIL_ALREADY_EXISTS: new APIError('Email address is already registered', 409, ErrorTypes.CONFLICT),
  INVALID_CREDENTIALS: new APIError('Invalid email or password', 401, ErrorTypes.AUTHENTICATION_ERROR),
  TOKEN_EXPIRED: new APIError('Authentication token has expired', 401, ErrorTypes.AUTHENTICATION_ERROR),
  TOKEN_INVALID: new APIError('Invalid authentication token', 401, ErrorTypes.AUTHENTICATION_ERROR),
  UNAUTHORIZED: new APIError('Unauthorized access', 403, ErrorTypes.AUTHORIZATION_ERROR),
  DATABASE_CONNECTION: new APIError('Database connection failed', 500, ErrorTypes.DATABASE_ERROR),
  EMAIL_SERVICE_ERROR: new APIError('Email service temporarily unavailable', 503, ErrorTypes.EXTERNAL_SERVICE_ERROR)
};

// Error handler middleware function
export function handleError(error, req, res) {
  console.error('🚨 API Error:', {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode || 500,
    code: error.code,
    url: req.url,
    method: req.method,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  // Don't expose sensitive information in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let response = {
    error: error.message || 'Internal server error',
    code: error.code || ErrorTypes.INTERNAL_ERROR,
    timestamp: error.timestamp || new Date().toISOString()
  };

  // Add additional details in development
  if (isDevelopment) {
    response.stack = error.stack;
    response.details = error.details;
  }

  // Add request ID for tracking
  if (req.headers['x-request-id']) {
    response.requestId = req.headers['x-request-id'];
  }

  const statusCode = error.statusCode || 500;
  return res.status(statusCode).json(response);
}

// Wrapper for async route handlers to catch errors
export function asyncHandler(fn) {
  return async (req, res) => {
    try {
      return await fn(req, res);
    } catch (error) {
      return handleError(error, req, res);
    }
  };
}

// Validation helpers
export function validateRequired(data, requiredFields) {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    throw new APIError(
      `Missing required fields: ${missing.join(', ')}`,
      400,
      ErrorTypes.VALIDATION_ERROR,
      { missing }
    );
  }
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw CommonErrors.INVALID_EMAIL;
  }
  return email.toLowerCase().trim();
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    throw CommonErrors.INVALID_PASSWORD;
  }
  return password;
}

// Database error handler
export function handleDatabaseError(error) {
  console.error('Database error:', error);
  
  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    throw new APIError(
      `${field} already exists`,
      409,
      ErrorTypes.CONFLICT,
      { field, value: error.keyValue }
    );
  }
  
  // MongoDB validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(e => e.message);
    throw new APIError(
      messages.join(', '),
      400,
      ErrorTypes.VALIDATION_ERROR,
      { validationErrors: messages }
    );
  }
  
  // Generic database error
  throw CommonErrors.DATABASE_CONNECTION;
}

export default {
  APIError,
  ErrorTypes,
  CommonErrors,
  handleError,
  asyncHandler,
  validateRequired,
  validateEmail,
  validatePassword,
  handleDatabaseError
};