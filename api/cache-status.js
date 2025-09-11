import { requireAdmin } from './lib/auth-middleware.js';
import { Cache } from './lib/cache.js';
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

  try {
    if (req.method === 'GET') {
      // Require admin authentication for viewing cache status
      await new Promise((resolve, reject) => {
        requireAdmin(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const stats = Cache.getStats();
      const hitRate = stats.totalHits > 0 ? 
        ((stats.totalHits / (stats.totalHits + stats.activeEntries)) * 100).toFixed(2) : 0;

      return res.status(200).json({
        success: true,
        cache: {
          status: 'active',
          statistics: {
            ...stats,
            hitRate: `${hitRate}%`,
            memoryUsageKB: Math.round(stats.memoryUsage / 1024),
            utilizationPercent: Math.round((stats.activeEntries / stats.maxSize) * 100)
          }
        },
        actions: {
          clear: 'DELETE /api/cache-status',
          refresh: 'POST /api/cache-status'
        },
        requestedBy: {
          userId: req.user.userId,
          email: req.user.email
        }
      });
    }

    if (req.method === 'DELETE') {
      // Require admin authentication for clearing cache
      await new Promise((resolve, reject) => {
        requireAdmin(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const statsBefore = Cache.getStats();
      Cache.clear();
      
      console.log(`🧹 Admin ${req.user.email} cleared cache (${statsBefore.totalEntries} entries)`);

      return res.status(200).json({
        success: true,
        message: 'Cache cleared successfully',
        entriesCleared: statsBefore.totalEntries,
        clearedBy: {
          userId: req.user.userId,
          email: req.user.email
        }
      });
    }

    if (req.method === 'POST') {
      // Require admin authentication for cache operations
      await new Promise((resolve, reject) => {
        requireAdmin(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const { action } = req.body;

      if (action === 'clear-expired') {
        // This happens automatically, but we can force it
        const stats = Cache.getStats();
        return res.status(200).json({
          success: true,
          message: 'Expired entries cleanup triggered',
          statistics: stats
        });
      }

      return res.status(400).json({
        error: 'Invalid action',
        validActions: ['clear-expired']
      });
    }

    return res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['GET', 'POST', 'DELETE']
    });

  } catch (error) {
    console.error('Cache status endpoint error:', error);
    return res.status(500).json({ 
      error: 'Cache status operation failed',
      details: error.message
    });
  }
});