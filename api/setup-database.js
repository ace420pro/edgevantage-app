import { createDatabaseIndexes, getAllIndexes } from './lib/database-indexes.js';
import { requireAdmin } from './lib/auth-middleware.js';
import { 
  setCorsHeaders, 
  setSecurityHeaders, 
  handleOptions 
} from './lib/middleware.js';
import { asyncHandler } from './lib/errors.js';

export default asyncHandler(async function handler(req, res) {
  // Set security headers
  setCorsHeaders(res, req);
  setSecurityHeaders(res, { adminEndpoint: true, noCache: true });

  // Handle preflight
  if (handleOptions(req, res)) return;

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['POST']
    });
  }

  try {
    // Require admin authentication
    await new Promise((resolve, reject) => {
      requireAdmin(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log(`🔧 Admin ${req.user.email} initiated database setup`);

    // Create all indexes
    const startTime = Date.now();
    const results = await createDatabaseIndexes();
    const setupTime = Date.now() - startTime;

    // Get summary statistics
    let totalCreated = 0;
    let totalExisting = 0;
    let totalFailed = 0;

    const summary = {};
    for (const [collection, indexes] of Object.entries(results)) {
      const created = indexes.filter(i => i.status === 'created').length;
      const existing = indexes.filter(i => i.status === 'exists').length;
      const failed = indexes.filter(i => i.status === 'failed').length;
      
      totalCreated += created;
      totalExisting += existing;
      totalFailed += failed;
      
      summary[collection] = {
        created,
        existing,
        failed,
        total: indexes.length
      };
    }

    // Get current index status
    const allIndexes = await getAllIndexes();

    console.log(`✅ Database setup completed in ${setupTime}ms - Created: ${totalCreated}, Existing: ${totalExisting}, Failed: ${totalFailed}`);

    return res.status(200).json({
      success: true,
      message: 'Database indexes setup completed',
      timing: {
        setupTimeMs: setupTime,
        timestamp: new Date().toISOString()
      },
      summary: {
        totalCreated,
        totalExisting,
        totalFailed,
        collections: Object.keys(summary).length
      },
      details: {
        collections: summary,
        currentIndexes: allIndexes
      },
      performedBy: {
        userId: req.user.userId,
        email: req.user.email
      }
    });

  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({ 
      error: 'Database setup failed',
      details: error.message,
      code: 'DATABASE_SETUP_ERROR'
    });
  }
});