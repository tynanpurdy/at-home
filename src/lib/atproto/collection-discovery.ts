// Comprehensive collection discovery for ATproto repositories
import { AtpAgent } from '@atproto/api';
import { collectionManager, type CollectionConfig } from '../config/collections';

export interface CollectionTest {
  collection: string;
  exists: boolean;
  recordCount: number;
  sampleRecords: any[];
  config?: CollectionConfig;
}

export class CollectionDiscovery {
  private agent: AtpAgent;

  constructor(pdsUrl: string = 'https://bsky.social') {
    this.agent = new AtpAgent({ service: pdsUrl });
  }

  // Get collection patterns from configuration
  private getCollectionPatterns(): string[] {
    return collectionManager.getCollectionNames();
  }

  // Test a single collection
  async testCollection(did: string, collection: string): Promise<CollectionTest> {
    const config = collectionManager.getCollectionInfo(collection);
    
    try {
      const response = await this.agent.api.com.atproto.repo.listRecords({
        repo: did,
        collection,
        limit: 10, // Just get a few records to test
      });

      return {
        collection,
        exists: true,
        recordCount: response.data.records.length,
        sampleRecords: response.data.records.slice(0, 3),
        config
      };
    } catch (error) {
      return {
        collection,
        exists: false,
        recordCount: 0,
        sampleRecords: [],
        config
      };
    }
  }

  // Discover all collections by testing all patterns
  async discoverAllCollections(did: string): Promise<CollectionTest[]> {
    console.log('Starting comprehensive collection discovery...');
    
    const patterns = this.getCollectionPatterns();
    console.log(`Testing ${patterns.length} collection patterns from configuration`);
    
    const results: CollectionTest[] = [];
    
    // Test collections in parallel batches to speed up discovery
    const batchSize = 10;
    for (let i = 0; i < patterns.length; i += batchSize) {
      const batch = patterns.slice(i, i + batchSize);
      console.log(`Testing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(patterns.length / batchSize)}`);
      
      const batchPromises = batch.map(collection => this.testCollection(did, collection));
      const batchResults = await Promise.all(batchPromises);
      
      results.push(...batchResults);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const existingCollections = results.filter(r => r.exists);
    console.log(`Found ${existingCollections.length} existing collections out of ${patterns.length} tested`);
    
    return results;
  }

  // Resolve handle to DID
  async resolveHandle(handle: string): Promise<string | null> {
    try {
      const response = await this.agent.api.com.atproto.identity.resolveHandle({
        handle: handle,
      });
      return response.data.did;
    } catch (error) {
      console.error('Error resolving handle:', error);
      return null;
    }
  }

  // Get all records from all discovered collections
  async getAllRecordsFromAllCollections(did: string): Promise<any[]> {
    const collectionTests = await this.discoverAllCollections(did);
    const existingCollections = collectionTests.filter(ct => ct.exists);
    
    const allRecords: any[] = [];
    
    for (const collectionTest of existingCollections) {
      try {
        console.log(`Getting all records from ${collectionTest.collection}...`);
        const response = await this.agent.api.com.atproto.repo.listRecords({
          repo: did,
          collection: collectionTest.collection,
          limit: 100, // Get up to 100 records (API limit)
        });
        
        const records = response.data.records.map((record: any) => ({
          uri: record.uri,
          cid: record.cid,
          value: record.value,
          indexedAt: record.indexedAt,
          collection: collectionTest.collection
        }));
        
        allRecords.push(...records);
        console.log(`Got ${records.length} records from ${collectionTest.collection}`);
      } catch (error) {
        console.error(`Error getting records from ${collectionTest.collection}:`, error);
      }
    }
    
    return allRecords;
  }
} 