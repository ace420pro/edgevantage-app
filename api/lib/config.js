// Environment configuration and validation

// Required environment variables
const REQUIRED_ENV_VARS = [
  'MONGODB_URI',
  'JWT_SECRET'
];

// Optional environment variables with defaults
const OPTIONAL_ENV_VARS = {
  NODE_ENV: 'development',
  PORT: '5000',
  FRONTEND_URL: 'https://edgevantagepro.com',
  JWT_EXPIRES_IN: '7d'
};

// Validate environment configuration
export function validateEnvironment() {
  const missing = [];
  const warnings = [];
  
  console.log('🔧 Validating environment configuration...');
  
  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    if (!process.env[varName]) {
      missing.push(varName);
    } else {
      console.log(`✅ ${varName}: configured`);
    }
  }
  
  // Check for missing required variables
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate specific configurations
  validateSpecificConfigs(warnings);
  
  // Set defaults for optional variables
  setDefaults();
  
  // Log warnings
  if (warnings.length > 0) {
    console.warn('⚠️ Configuration warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log('✅ Environment validation completed');
  
  return {
    valid: true,
    warnings: warnings.length,
    environment: process.env.NODE_ENV
  };
}

function validateSpecificConfigs(warnings) {
  // Validate JWT Secret strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret === 'your-secret-key-change-this-in-production') {
    warnings.push('JWT_SECRET is using default value - change in production');
  } else if (jwtSecret && jwtSecret.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters long');
  }
  
  // Validate MongoDB URI format
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri && !mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
    warnings.push('MONGODB_URI should start with mongodb:// or mongodb+srv://');
  }
  
  // Validate production settings
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.RESEND_API_KEY) {
      warnings.push('RESEND_API_KEY not configured - email features will not work');
    }
    
    if (process.env.FRONTEND_URL === 'http://localhost:3000') {
      warnings.push('FRONTEND_URL should not be localhost in production');
    }
  }
  
  // Validate email configuration
  if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith('re_')) {
    warnings.push('RESEND_API_KEY format appears incorrect (should start with re_)');
  }
}

function setDefaults() {
  for (const [varName, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[varName]) {
      process.env[varName] = defaultValue;
      console.log(`📝 ${varName}: using default (${defaultValue})`);
    } else {
      console.log(`✅ ${varName}: ${process.env[varName]}`);
    }
  }
}

// Get configuration object
export function getConfig() {
  return {
    // Database
    mongoUri: process.env.MONGODB_URI,
    
    // Authentication
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN,
    
    // Server
    port: parseInt(process.env.PORT) || 5000,
    nodeEnv: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    
    // Email
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.FROM_EMAIL || 'noreply@edgevantagepro.com',
    
    // External Services
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    
    // Admin
    adminEmail: process.env.ADMIN_EMAIL,
    adminPhone: process.env.ADMIN_PHONE,
    adminJwtSecret: process.env.ADMIN_JWT_SECRET,
    
    // Flags
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    
    // Features
    emailEnabled: !!process.env.RESEND_API_KEY,
    smsEnabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    paymentsEnabled: !!process.env.STRIPE_SECRET_KEY
  };
}

// Health check for configuration
export function getConfigHealth() {
  const config = getConfig();
  
  return {
    database: {
      configured: !!config.mongoUri,
      status: config.mongoUri ? 'configured' : 'missing'
    },
    authentication: {
      configured: !!config.jwtSecret,
      strong: config.jwtSecret && config.jwtSecret.length >= 32,
      status: !config.jwtSecret ? 'missing' : 
             config.jwtSecret.length < 32 ? 'weak' : 'strong'
    },
    email: {
      configured: config.emailEnabled,
      service: config.emailEnabled ? 'resend' : 'none'
    },
    sms: {
      configured: config.smsEnabled,
      service: config.smsEnabled ? 'twilio' : 'none'
    },
    payments: {
      configured: config.paymentsEnabled,
      service: config.paymentsEnabled ? 'stripe' : 'none'
    },
    environment: config.nodeEnv,
    lastChecked: new Date().toISOString()
  };
}

export default {
  validateEnvironment,
  getConfig,
  getConfigHealth
};