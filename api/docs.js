// API Documentation endpoint
import { 
  setCorsHeaders, 
  setSecurityHeaders, 
  handleOptions, 
  handleMethodNotAllowed 
} from './lib/middleware.js';
import { asyncHandler } from './lib/errors.js';

// API Documentation structure
const API_DOCS = {
  info: {
    title: 'EdgeVantage API',
    version: '2.0.0',
    description: 'Lead management and passive income application API',
    contact: {
      name: 'EdgeVantage Support',
      email: 'support@edgevantagepro.com',
      url: 'https://edgevantagepro.com'
    }
  },
  
  baseUrl: process.env.FRONTEND_URL || 'https://edgevantagepro.com',
  
  authentication: {
    type: 'Bearer Token (JWT)',
    header: 'Authorization: Bearer <token>',
    description: 'Most endpoints require JWT authentication. Obtain tokens via /api/auth login endpoint.'
  },
  
  rateLimit: {
    general: '100 requests per 15 minutes',
    authentication: '5 requests per 15 minutes',
    headers: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset']
  },
  
  security: {
    cors: 'Configured for specific domains in production',
    headers: [
      'X-Content-Type-Options: nosniff',
      'X-Frame-Options: DENY',
      'X-XSS-Protection: 1; mode=block',
      'Strict-Transport-Security (HTTPS only)',
      'Content-Security-Policy'
    ],
    validation: 'All inputs are validated and sanitized'
  },
  
  endpoints: {
    // Health and System
    'GET /api/health': {
      description: 'System health check and monitoring',
      authentication: false,
      rateLimit: 'general',
      responses: {
        200: 'System healthy',
        503: 'System unhealthy'
      },
      example: {
        request: 'GET /api/health',
        response: {
          status: 'healthy',
          database: { status: 'connected', responseTime: 45 },
          configuration: { database: { configured: true } },
          system: { uptime: 3600, memory: { used: 50 } },
          timestamp: '2024-01-01T12:00:00.000Z'
        }
      }
    },
    
    'GET /api/docs': {
      description: 'API documentation (this endpoint)',
      authentication: false,
      rateLimit: 'general'
    },
    
    // Authentication
    'POST /api/auth': {
      description: 'User authentication (login, register, password reset)',
      authentication: false,
      rateLimit: 'authentication',
      parameters: {
        action: { type: 'string', required: true, enum: ['login', 'register', 'forgot-password', 'reset-password'] },
        email: { type: 'string', required: true, format: 'email' },
        password: { type: 'string', required: 'varies by action' },
        name: { type: 'string', required: 'for registration' }
      },
      examples: {
        login: {
          request: { action: 'login', email: 'user@example.com', password: 'password123' },
          response: { success: true, token: 'jwt_token_here', user: { name: 'User Name' } }
        },
        register: {
          request: { action: 'register', name: 'New User', email: 'new@example.com', password: 'password123' },
          response: { success: true, message: 'Account created successfully' }
        }
      }
    },
    
    'POST /api/auth/verify-email': {
      description: 'Email verification via token',
      authentication: false,
      rateLimit: 'general',
      methods: ['GET', 'POST'],
      parameters: {
        token: { type: 'string', required: true, description: 'Email verification token' }
      },
      responses: {
        200: 'Email verified successfully (HTML page for GET, JSON for POST)',
        400: 'Invalid or expired token'
      }
    },
    
    'POST /api/auth/resend-verification': {
      description: 'Resend email verification',
      authentication: false,
      rateLimit: 'authentication',
      parameters: {
        email: { type: 'string', required: true, format: 'email' }
      }
    },
    
    // Leads Management
    'GET /api/leads': {
      description: 'Get all leads with filtering options',
      authentication: 'admin',
      rateLimit: 'general',
      parameters: {
        status: { type: 'string', optional: true, enum: ['pending', 'approved', 'contacted', 'rejected'] },
        qualified: { type: 'boolean', optional: true },
        limit: { type: 'number', optional: true, default: 50 },
        skip: { type: 'number', optional: true, default: 0 }
      }
    },
    
    'POST /api/leads': {
      description: 'Submit new lead application',
      authentication: false,
      rateLimit: 'general',
      parameters: {
        name: { type: 'string', required: true, maxLength: 50 },
        email: { type: 'string', required: true, format: 'email' },
        phone: { type: 'string', required: true, format: 'phone' },
        state: { type: 'string', required: true, maxLength: 50 },
        city: { type: 'string', required: true, maxLength: 50 },
        hasResidence: { type: 'string', required: true, enum: ['yes', 'no'] },
        hasInternet: { type: 'string', required: true, enum: ['yes', 'no'] },
        hasSpace: { type: 'string', required: true, enum: ['yes', 'no'] },
        agreeToTerms: { type: 'boolean', required: true, enum: [true] },
        referralCode: { type: 'string', optional: true },
        referralSource: { type: 'string', required: true, enum: ['google', 'social-media', 'friend-referral', 'advertisement', 'other'] }
      }
    },
    
    'PATCH /api/leads/:id': {
      description: 'Update lead status and information',
      authentication: 'admin',
      rateLimit: 'general',
      parameters: {
        id: { type: 'string', required: true, format: 'mongodb_objectid' },
        status: { type: 'string', optional: true, enum: ['pending', 'approved', 'contacted', 'rejected'] },
        monthlyEarnings: { type: 'number', optional: true },
        notes: { type: 'string', optional: true }
      }
    },
    
    'GET /api/leads/stats': {
      description: 'Get lead statistics and analytics',
      authentication: 'admin',
      rateLimit: 'general'
    },
    
    // User Dashboard
    'GET /api/user/dashboard': {
      description: 'Get user dashboard data',
      authentication: 'user',
      rateLimit: 'general',
      response: {
        user: 'User profile information',
        application: 'Application status and details',
        shipment: 'Equipment shipment tracking',
        earnings: 'Earnings history and totals',
        progress: 'Application progress steps'
      }
    },
    
    // Affiliates
    'GET /api/affiliates': {
      description: 'Get affiliate information',
      authentication: 'admin',
      rateLimit: 'general'
    },
    
    'POST /api/affiliates': {
      description: 'Register new affiliate',
      authentication: false,
      rateLimit: 'general'
    },
    
    'GET /api/referral/:code': {
      description: 'Validate referral code',
      authentication: false,
      rateLimit: 'general',
      parameters: {
        code: { type: 'string', required: true, description: 'Referral code to validate' }
      }
    }
  },
  
  errorCodes: {
    400: 'Bad Request - Invalid input or missing required fields',
    401: 'Unauthorized - Invalid or missing authentication token',
    403: 'Forbidden - Insufficient permissions',
    404: 'Not Found - Resource not found',
    405: 'Method Not Allowed - HTTP method not supported for this endpoint',
    409: 'Conflict - Resource already exists (e.g., duplicate email)',
    429: 'Too Many Requests - Rate limit exceeded',
    500: 'Internal Server Error - Unexpected server error',
    503: 'Service Unavailable - System temporarily unavailable'
  },
  
  responseFormat: {
    success: {
      description: 'All successful responses include relevant data and metadata',
      example: {
        success: true,
        data: '...',
        timestamp: '2024-01-01T12:00:00.000Z'
      }
    },
    error: {
      description: 'All error responses follow a consistent format',
      example: {
        error: 'Error message',
        code: 'ERROR_CODE',
        timestamp: '2024-01-01T12:00:00.000Z',
        requestId: 'optional-request-id'
      }
    }
  },
  
  bestPractices: {
    authentication: [
      'Include Bearer token in Authorization header for protected endpoints',
      'Tokens expire after 7 days - handle 401 responses by redirecting to login',
      'Store tokens securely (not in localStorage for sensitive apps)'
    ],
    rateLimit: [
      'Monitor X-RateLimit-* headers to track usage',
      'Implement exponential backoff for 429 responses',
      'Different endpoints have different rate limits'
    ],
    errors: [
      'Always check response status codes',
      'Error responses include detailed error codes and messages',
      'Log client-side errors for debugging'
    ],
    performance: [
      'Use appropriate query parameters for filtering and pagination',
      'Cache responses where appropriate',
      'Monitor response times via health endpoint'
    ]
  }
};

export default asyncHandler(async function handler(req, res) {
  // Set security headers
  setCorsHeaders(res);
  setSecurityHeaders(res);

  // Handle preflight
  if (handleOptions(req, res)) return;

  // Validate method
  if (handleMethodNotAllowed(req, res, ['GET'])) return;

  // Check if requesting specific documentation
  const section = req.query.section;
  const format = req.query.format || 'json';

  let response = API_DOCS;

  // Filter to specific section if requested
  if (section && API_DOCS[section]) {
    response = {
      section: section,
      data: API_DOCS[section],
      info: API_DOCS.info
    };
  }

  // Return HTML documentation if requested
  if (format === 'html') {
    const html = generateHTMLDocs(response);
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  // Return JSON documentation
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({
    documentation: response,
    meta: {
      generated: new Date().toISOString(),
      version: API_DOCS.info.version,
      format: format,
      endpoints: Object.keys(API_DOCS.endpoints).length
    }
  });
});

function generateHTMLDocs(docs) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${docs.info?.title || 'API Documentation'}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        h2 { color: #667eea; margin-top: 30px; }
        h3 { color: #555; }
        .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        .method { background: #667eea; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
        .code { background: #f4f4f4; padding: 10px; border-radius: 3px; font-family: monospace; overflow-x: auto; }
        .parameter { background: #e9ecef; padding: 5px 10px; margin: 2px 0; border-radius: 3px; }
        ul { padding-left: 20px; }
        .info-box { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${docs.info?.title || 'API Documentation'}</h1>
        <p>${docs.info?.description || ''}</p>
        
        <div class="info-box">
            <strong>Base URL:</strong> ${docs.baseUrl}<br>
            <strong>Version:</strong> ${docs.info?.version}<br>
            <strong>Generated:</strong> ${new Date().toISOString()}
        </div>

        <h2>🔐 Authentication</h2>
        <p>${docs.authentication?.description || 'Authentication information not available'}</p>
        <div class="code">Authorization: ${docs.authentication?.header || 'Bearer <token>'}</div>

        <h2>⚡ Rate Limiting</h2>
        <ul>
            <li><strong>General:</strong> ${docs.rateLimit?.general || 'Not specified'}</li>
            <li><strong>Authentication:</strong> ${docs.rateLimit?.authentication || 'Not specified'}</li>
        </ul>

        <h2>📡 API Endpoints</h2>
        ${Object.entries(docs.endpoints || {}).map(([endpoint, details]) => `
            <div class="endpoint">
                <h3><span class="method">${endpoint.split(' ')[0]}</span> ${endpoint.split(' ')[1]}</h3>
                <p>${details.description || 'No description'}</p>
                
                ${details.parameters ? `
                    <h4>Parameters:</h4>
                    ${Object.entries(details.parameters).map(([param, info]) => `
                        <div class="parameter">
                            <strong>${param}</strong> (${info.type}) ${info.required ? '- Required' : '- Optional'}
                            ${info.description ? `<br><em>${info.description}</em>` : ''}
                        </div>
                    `).join('')}
                ` : ''}
                
                ${details.example ? `
                    <h4>Example:</h4>
                    <div class="code">${JSON.stringify(details.example, null, 2)}</div>
                ` : ''}
            </div>
        `).join('')}

        <h2>🚨 Error Codes</h2>
        ${Object.entries(docs.errorCodes || {}).map(([code, description]) => `
            <div class="parameter"><strong>${code}:</strong> ${description}</div>
        `).join('')}

        <div style="margin-top: 50px; text-align: center; color: #666; font-size: 14px;">
            <p>Generated by EdgeVantage API Documentation System</p>
        </div>
    </div>
</body>
</html>`;
}