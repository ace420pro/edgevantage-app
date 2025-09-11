import { createDatabaseIndexes, analyzeIndexUsage, getAllIndexes } from './lib/database-indexes.js';

async function setupDatabaseIndexes() {
  console.log('🚀 Starting database index setup...');
  
  try {
    // Create all indexes
    const results = await createDatabaseIndexes();
    
    console.log('\n📊 Index Creation Summary:');
    for (const [collection, indexes] of Object.entries(results)) {
      const created = indexes.filter(i => i.status === 'created').length;
      const existing = indexes.filter(i => i.status === 'exists').length;
      const failed = indexes.filter(i => i.status === 'failed').length;
      
      console.log(`  ${collection}: ${created} created, ${existing} existing, ${failed} failed`);
    }
    
    // Get all current indexes
    console.log('\n📋 Current Database Indexes:');
    const allIndexes = await getAllIndexes();
    
    for (const [collection, indexes] of Object.entries(allIndexes)) {
      if (indexes.error) {
        console.log(`  ${collection}: Error - ${indexes.error}`);
      } else {
        console.log(`  ${collection}: ${indexes.length} indexes`);
        indexes.forEach(index => {
          const flags = [];
          if (index.unique) flags.push('unique');
          if (index.sparse) flags.push('sparse');
          const flagStr = flags.length > 0 ? ` (${flags.join(', ')})` : '';
          console.log(`    - ${index.name}: ${JSON.stringify(index.key)}${flagStr}`);
        });
      }
    }
    
    console.log('\n✅ Database index setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database index setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabaseIndexes()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

export default setupDatabaseIndexes;