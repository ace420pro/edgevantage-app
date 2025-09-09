import { connectToDatabase, getCollection } from './lib/database.js';
import { 
  setCorsHeaders, 
  setSecurityHeaders, 
  handleOptions, 
  handleMethodNotAllowed 
} from './lib/middleware.js';
import { asyncHandler } from './lib/errors.js';
import { validateEnvironment, getConfig, getConfigHealth } from './lib/config.js';
import { getAllIndexes } from './lib/database-indexes.js';
import { analyzeDualSystem } from './lib/migration.js';

export default asyncHandler(async function handler(req, res) {
  // Set security headers
  setCorsHeaders(res);
  setSecurityHeaders(res);

  // Handle preflight
  if (handleOptions(req, res)) return;

  // Validate method
  if (handleMethodNotAllowed(req, res, ['GET'])) return;

  const startTime = Date.now();
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  };

  try {
    // Database health check
    const dbStartTime = Date.now();
    try {
      await connectToDatabase();
      const leadCount = await (await getCollection('leads')).countDocuments();
      const userCount = await (await getCollection('users')).countDocuments();
      
      healthData.database = {
        status: 'connected',
        responseTime: Date.now() - dbStartTime,
        collections: {
          leads: leadCount,
          users: userCount
        }
      };
    } catch (dbError) {
      healthData.database = {
        status: 'error',
        error: dbError.message,
        responseTime: Date.now() - dbStartTime
      };
      healthData.status = 'degraded';
    }

    // Configuration health
    try {
      healthData.configuration = getConfigHealth();
    } catch (configError) {
      healthData.configuration = {
        status: 'error',
        error: configError.message
      };
      healthData.status = 'degraded';
    }

    // System metrics
    healthData.system = {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform
    };

    // API endpoints status
    healthData.api = {
      endpoints: {
        auth: 'operational',
        leads: 'operational',
        users: 'operational',
        email: healthData.configuration.email.configured ? 'operational' : 'disabled'
      },
      rateLimit: 'active',
      security: 'enabled'
    };

    // Architecture analysis (only in development)
    if (process.env.NODE_ENV === 'development') {
      try {
        const dualSystemAnalysis = analyzeDualSystem();
        healthData.architecture = {
          dualSystem: dualSystemAnalysis.backend.exists && dualSystemAnalysis.api.exists,
          criticalIssues: dualSystemAnalysis.issues.filter(i => i.severity === 'critical').length,
          recommendations: dualSystemAnalysis.recommendations.length
        };
      } catch (archError) {
        healthData.architecture = {
          error: 'Could not analyze architecture'
        };
      }
    }

    // Response time
    healthData.responseTime = Date.now() - startTime;

    // Determine final status
    if (healthData.database.status === 'error') {
      healthData.status = 'unhealthy';
      return res.status(503).json(healthData);
    } else if (healthData.status === 'degraded') {
      return res.status(200).json(healthData);
    }

    return res.status(200).json(healthData);

  } catch (error) {
    console.error('Health check failed:', error);
    return res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    });
  }
});