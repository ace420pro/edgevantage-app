// Backend migration utilities to resolve dual architecture issues
import fs from 'fs';
import path from 'path';

// Analyze the dual backend system
export function analyzeDualSystem() {
  console.log('🔍 Analyzing dual backend system...');
  
  const analysis = {
    backend: {
      path: './backend',
      exists: fs.existsSync('./backend'),
      files: [],
      size: 0
    },
    api: {
      path: './api',
      exists: fs.existsSync('./api'),
      files: [],
      size: 0
    },
    issues: [],
    recommendations: []
  };
  
  // Analyze backend directory
  if (analysis.backend.exists) {
    try {
      analysis.backend.files = getJavaScriptFiles('./backend');
      analysis.backend.size = analysis.backend.files.length;
      
      // Check for specific issues
      const serverJs = analysis.backend.files.find(f => f.includes('server.js'));
      if (serverJs) {
        analysis.issues.push({
          type: 'dual_server',
          severity: 'critical',
          message: 'Express.js server running alongside serverless functions',
          file: serverJs
        });
      }
      
      const models = analysis.backend.files.filter(f => f.includes('models/'));
      if (models.length > 0) {
        analysis.issues.push({
          type: 'mongoose_models',
          severity: 'high',
          message: 'Mongoose models exist but serverless functions use raw MongoDB',
          files: models
        });
      }
      
    } catch (error) {
      analysis.issues.push({
        type: 'backend_analysis_error',
        severity: 'medium',
        message: `Could not analyze backend directory: ${error.message}`
      });
    }
  }
  
  // Analyze API directory
  if (analysis.api.exists) {
    try {
      analysis.api.files = getJavaScriptFiles('./api');
      analysis.api.size = analysis.api.files.length;
    } catch (error) {
      analysis.issues.push({
        type: 'api_analysis_error',
        severity: 'medium',
        message: `Could not analyze API directory: ${error.message}`
      });
    }
  }
  
  // Generate recommendations
  if (analysis.backend.exists && analysis.api.exists) {
    analysis.recommendations.push({
      priority: 'critical',
      action: 'consolidate_architecture',
      description: 'Migrate all functionality to serverless API directory and remove backend directory',
      steps: [
        'Ensure all API endpoints are working in /api directory',
        'Update any missing functionality from /backend to /api',
        'Update deployment scripts to only use /api',
        'Archive or remove /backend directory'
      ]
    });
  }
  
  if (analysis.issues.some(i => i.type === 'mongoose_models')) {
    analysis.recommendations.push({
      priority: 'high',
      action: 'standardize_database_access',
      description: 'Convert all database access to use the new shared database utility',
      steps: [
        'Update all remaining endpoints to use /api/lib/database.js',
        'Remove duplicate database connection functions',
        'Consider creating database schemas in shared utility if needed'
      ]
    });
  }
  
  return analysis;
}

// Get all JavaScript files in a directory
function getJavaScriptFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          traverse(fullPath);
        } else if (stat.isFile() && item.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.warn(`Could not read directory ${currentDir}:`, error.message);
    }
  }
  
  traverse(dir);
  return files;
}

// Create migration plan
export function createMigrationPlan() {
  const analysis = analyzeDualSystem();
  
  const plan = {
    phase1: {
      name: 'API Endpoint Consolidation',
      duration: '1-2 days',
      tasks: [
        {
          task: 'Update remaining API endpoints to use new architecture',
          files: analysis.api.files.filter(f => 
            !f.includes('/lib/') && 
            f.endsWith('.js') && 
            !f.includes('verify-email.js') && 
            !f.includes('auth.js')
          ),
          status: 'in_progress'
        },
        {
          task: 'Apply security middleware to all endpoints',
          description: 'Ensure all endpoints use CORS, security headers, and rate limiting',
          status: 'pending'
        },
        {
          task: 'Standardize error handling across all endpoints',
          description: 'Update all endpoints to use asyncHandler and standardized errors',
          status: 'pending'
        }
      ]
    },
    
    phase2: {
      name: 'Database Optimization',
      duration: '1 day',
      tasks: [
        {
          task: 'Create database indexes',
          description: 'Run database indexing script for performance',
          status: 'pending'
        },
        {
          task: 'Implement database health monitoring',
          description: 'Add database performance monitoring',
          status: 'pending'
        }
      ]
    },
    
    phase3: {
      name: 'Backend Directory Cleanup',
      duration: '1 day',
      tasks: [
        {
          task: 'Verify all functionality migrated',
          description: 'Ensure no critical functionality remains in /backend',
          status: 'pending',
          critical: true
        },
        {
          task: 'Update deployment configuration',
          description: 'Remove references to /backend in deployment scripts',
          status: 'pending'
        },
        {
          task: 'Archive backend directory',
          description: 'Move /backend to /backend-archive or remove entirely',
          status: 'pending'
        }
      ]
    },
    
    phase4: {
      name: 'Documentation and Testing',
      duration: '1-2 days',
      tasks: [
        {
          task: 'Create API documentation',
          description: 'Document all API endpoints and their usage',
          status: 'pending'
        },
        {
          task: 'Performance testing',
          description: 'Test all endpoints for performance and reliability',
          status: 'pending'
        },
        {
          task: 'Security audit',
          description: 'Verify all security measures are properly implemented',
          status: 'pending'
        }
      ]
    }
  };
  
  return {
    analysis,
    plan,
    totalEstimatedTime: '4-6 days',
    criticalIssues: analysis.issues.filter(i => i.severity === 'critical').length,
    highPriorityIssues: analysis.issues.filter(i => i.severity === 'high').length
  };
}

// Execute migration step
export async function executeMigrationStep(phase, taskIndex) {
  const migrationPlan = createMigrationPlan();
  const task = migrationPlan.plan[phase]?.tasks[taskIndex];
  
  if (!task) {
    throw new Error(`Invalid migration step: ${phase}[${taskIndex}]`);
  }
  
  console.log(`🚀 Executing: ${task.task}`);
  
  try {
    switch (task.task) {
      case 'Create database indexes':
        const { createDatabaseIndexes } = await import('./database-indexes.js');
        await createDatabaseIndexes();
        break;
        
      case 'Archive backend directory':
        await archiveBackendDirectory();
        break;
        
      default:
        console.log(`⚠️ Manual task: ${task.task}`);
        console.log(`Description: ${task.description}`);
        return { status: 'manual', message: 'This task requires manual intervention' };
    }
    
    console.log(`✅ Completed: ${task.task}`);
    return { status: 'completed', task: task.task };
    
  } catch (error) {
    console.error(`❌ Failed: ${task.task}`, error);
    return { status: 'failed', task: task.task, error: error.message };
  }
}

// Archive backend directory
async function archiveBackendDirectory() {
  const backendPath = './backend';
  const archivePath = './backend-archive';
  
  if (!fs.existsSync(backendPath)) {
    console.log('⚠️ Backend directory does not exist');
    return;
  }
  
  // Create archive directory
  if (fs.existsSync(archivePath)) {
    fs.rmSync(archivePath, { recursive: true });
  }
  
  // Move backend to archive
  fs.renameSync(backendPath, archivePath);
  
  console.log(`📦 Backend directory archived to ${archivePath}`);
  console.log('⚠️ Remember to update any deployment scripts or references');
}

export default {
  analyzeDualSystem,
  createMigrationPlan,
  executeMigrationStep
};