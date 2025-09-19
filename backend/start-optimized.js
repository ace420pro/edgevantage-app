#!/usr/bin/env node

// Optimized Startup Script for EdgeVantage Backend
// This script ensures the database is optimized before starting the server

const { spawn } = require('child_process');
const { DatabaseOptimizer } = require('./optimize-database');

console.log('🚀 EdgeVantage Backend - Optimized Startup\n');

async function startOptimizedServer() {
  try {
    // Step 1: Run database optimization
    console.log('📊 Step 1: Database optimization...');
    const optimizer = new DatabaseOptimizer();
    const results = await optimizer.runOptimization();

    if (results.errors.length > 0) {
      console.log('⚠️  Database optimization completed with warnings, but continuing...');
    } else {
      console.log('✅ Database optimization successful!');
    }

    console.log('\n🔄 Step 2: Starting server...');

    // Step 2: Start the main server
    const server = spawn('node', ['server.js'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'development'
      }
    });

    // Handle server process events
    server.on('error', (error) => {
      console.error('❌ Failed to start server:', error.message);
      process.exit(1);
    });

    server.on('close', (code) => {
      console.log(`\n📡 Server process exited with code ${code}`);
      process.exit(code);
    });

    // Handle shutdown signals
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT, shutting down gracefully...');
      server.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
      server.kill('SIGTERM');
    });

    console.log('✅ Server startup initiated successfully!');
    console.log('📊 Monitor health: npm run health');
    console.log('🔍 Run tests: npm run test\n');

  } catch (error) {
    console.error('💥 Startup failed:', error.message);
    process.exit(1);
  }
}

// Run the optimized startup
startOptimizedServer();