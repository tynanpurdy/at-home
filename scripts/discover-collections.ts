#!/usr/bin/env node

import { CollectionDiscovery } from '../src/lib/build/collection-discovery';
import { loadConfig } from '../src/lib/config/site';
import path from 'path';

async function main() {
  console.log('🚀 Starting collection discovery...');
  
  try {
    const config = loadConfig();
    const discovery = new CollectionDiscovery();
    
    if (!config.atproto.handle || config.atproto.handle === 'your-handle-here') {
      console.error('❌ No ATProto handle configured. Please set ATPROTO_HANDLE in your environment.');
      process.exit(1);
    }

    console.log(`🔍 Discovering collections for: ${config.atproto.handle}`);
    
    // Discover collections
    const results = await discovery.discoverCollections(config.atproto.handle);
    
    // Save results
    const outputPath = path.join(process.cwd(), 'src/lib/generated/discovered-types.ts');
    await discovery.saveDiscoveryResults(results, outputPath);
    
    console.log('✅ Collection discovery complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Collections: ${results.totalCollections}`);
    console.log(`   - Records: ${results.totalRecords}`);
    console.log(`   - Repository: ${results.repository.handle}`);
    console.log(`   - Output: ${outputPath}`);
    
    // Log discovered collections
    console.log('\n📦 Discovered Collections:');
    for (const collection of results.collections) {
      console.log(`   - ${collection.name} (${collection.service})`);
      console.log(`     Types: ${collection.$types.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Collection discovery failed:', error);
    process.exit(1);
  }
}

// Run if called directly
// Run the main function
main(); 