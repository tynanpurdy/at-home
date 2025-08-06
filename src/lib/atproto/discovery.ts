import { AtpAgent } from '@atproto/api';
import type { AtprotoRecord } from '../types/atproto';

export interface DiscoveredLexicon {
  $type: string;
  collection: string;
  service: string;
  sampleRecord: AtprotoRecord;
  properties: Record<string, any>;
  description: string;
}

export interface RepositoryAnalysis {
  did: string;
  collections: string[];
  lexicons: DiscoveredLexicon[];
  totalRecords: number;
  recordTypeCounts: Record<string, number>;
}

export class ATprotoDiscovery {
  private agent: AtpAgent;

  constructor(pdsUrl: string = 'https://bsky.social') {
    this.agent = new AtpAgent({ service: pdsUrl });
  }

  // Discover all collections in a repository
  async discoverCollections(did: string): Promise<string[]> {
    const collections = new Set<string>();
    
    // Try common collections that are likely to exist
    const commonCollections = [
      // Standard Bluesky collections
      'app.bsky.feed.post',
      'app.bsky.actor.profile',
      'app.bsky.feed.generator',
      'app.bsky.graph.follow',
      'app.bsky.graph.block',
      'app.bsky.feed.like',
      'app.bsky.feed.repost',
      // Grain.social collections (if they use different naming)
      'grain.social.feed.post',
      'grain.social.actor.profile',
      'grain.social.feed.gallery',
      'grain.social.feed.image',
      // Other potential collections
      'app.bsky.feed.image',
      'app.bsky.feed.gallery',
      'app.bsky.feed.media',
      // Generic collections that might contain custom content
      'app.bsky.feed.custom',
      'app.bsky.actor.custom'
    ];
    
    for (const collection of commonCollections) {
      try {
        const response = await this.agent.api.com.atproto.repo.listRecords({
          repo: did,
          collection,
          limit: 1, // Just check if the collection exists
        });
        
        if (response.data.records.length > 0) {
          collections.add(collection);
          console.log(`Found collection: ${collection}`);
        }
      } catch (error) {
        console.log(`Collection ${collection} not found or empty`);
      }
    }

    console.log('Discovered collections:', Array.from(collections));
    return Array.from(collections);
  }

  // Get all records from a specific collection
  async getRecordsFromCollection(did: string, collection: string, limit: number = 100): Promise<AtprotoRecord[]> {
    try {
      const response = await this.agent.api.com.atproto.repo.listRecords({
        repo: did,
        collection,
        limit,
      });

      return response.data.records.map((record: any) => ({
        uri: record.uri,
        cid: record.cid,
        value: record.value,
        indexedAt: record.indexedAt,
      }));
    } catch (error) {
      console.log(`No records found in collection: ${collection}`);
      return [];
    }
  }

  // Analyze a repository completely
  async analyzeRepository(handle: string): Promise<RepositoryAnalysis> {
    console.log('Starting repository analysis for:', handle);
    
    // Resolve handle to DID
    const did = await this.resolveHandle(handle);
    if (!did) {
      throw new Error(`Failed to resolve handle: ${handle}`);
    }

    console.log('Resolved DID:', did);

    // Discover all collections
    const collections = await this.discoverCollections(did);
    console.log('Found collections:', collections);

    const lexicons: DiscoveredLexicon[] = [];
    const recordTypeCounts: Record<string, number> = {};
    let totalRecords = 0;

    // Analyze each collection
    for (const collection of collections) {
      console.log(`Analyzing collection: ${collection}`);
      try {
        const records = await this.getRecordsFromCollection(did, collection, 100); // Increased limit
        console.log(`Got ${records.length} records from ${collection}`);
        
        if (records.length > 0) {
          totalRecords += records.length;
          
          // Group records by type
          const typeGroups = new Map<string, AtprotoRecord[]>();
          records.forEach(record => {
            const $type = record.value?.$type || 'unknown';
            if (!typeGroups.has($type)) {
              typeGroups.set($type, []);
            }
            typeGroups.get($type)!.push(record);
            
            // Count record types
            recordTypeCounts[$type] = (recordTypeCounts[$type] || 0) + 1;
          });

          console.log(`Found ${typeGroups.size} different types in ${collection}`);

          // Create lexicon definitions for each type
          typeGroups.forEach((sampleRecords, $type) => {
            const sampleRecord = sampleRecords[0];
            const properties = this.extractProperties(sampleRecord.value);
            const service = this.inferService($type, collection);
            
            lexicons.push({
              $type,
              collection,
              service,
              sampleRecord,
              properties,
              description: `Discovered in collection ${collection}`
            });
          });
        }
      } catch (error) {
        console.error(`Error analyzing collection ${collection}:`, error);
      }
    }

    // Also search for grain-related content in existing posts
    console.log('Searching for grain-related content in existing posts...');
    const grainContent = await this.findGrainContent(did, collections);
    if (grainContent.length > 0) {
      console.log(`Found ${grainContent.length} grain-related records`);
      grainContent.forEach(record => {
        const $type = record.value?.$type || 'unknown';
        if (!recordTypeCounts[$type]) {
          recordTypeCounts[$type] = 0;
        }
        recordTypeCounts[$type]++;
        
        // Add to lexicons if not already present
        const existingLexicon = lexicons.find(l => l.$type === $type);
        if (!existingLexicon) {
          const properties = this.extractProperties(record.value);
          lexicons.push({
            $type,
            collection: record.uri.split('/')[2] || 'unknown',
            service: 'grain.social',
            sampleRecord: record,
            properties,
            description: 'Grain-related content found in posts'
          });
        }
      });
    }

    console.log('Analysis complete. Found:', {
      collections: collections.length,
      lexicons: lexicons.length,
      totalRecords
    });

    return {
      did,
      collections,
      lexicons,
      totalRecords,
      recordTypeCounts
    };
  }

  // Find grain-related content in existing posts
  private async findGrainContent(did: string, collections: string[]): Promise<AtprotoRecord[]> {
    const grainRecords: AtprotoRecord[] = [];
    
    // Look in posts collection for grain-related content
    if (collections.includes('app.bsky.feed.post')) {
      try {
        const posts = await this.getRecordsFromCollection(did, 'app.bsky.feed.post', 200);
        console.log(`Searching ${posts.length} posts for grain content`);
        
        posts.forEach(post => {
          const text = post.value?.text || '';
          const $type = post.value?.$type || '';
          
          // Check if post contains grain-related content
          if (text.includes('grain.social') || 
              text.includes('gallery') || 
              text.includes('grain') ||
              $type.includes('grain') ||
              post.uri.includes('grain')) {
            grainRecords.push(post);
            console.log('Found grain-related post:', {
              text: text.substring(0, 100),
              type: $type,
              uri: post.uri
            });
          }
        });
      } catch (error) {
        console.error('Error searching for grain content:', error);
      }
    }
    
    return grainRecords;
  }

  // Resolve handle to DID
  private async resolveHandle(handle: string): Promise<string | null> {
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

  // Extract properties from a record value
  private extractProperties(value: any): Record<string, any> {
    const properties: Record<string, any> = {};
    
    if (value && typeof value === 'object') {
      for (const [key, val] of Object.entries(value)) {
        if (key === '$type') continue;
        properties[key] = this.inferType(val);
      }
    }
    
    return properties;
  }

  // Infer TypeScript type from value
  private inferType(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    const type = typeof value;
    
    switch (type) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'object':
        if (Array.isArray(value)) {
          if (value.length === 0) return 'any[]';
          const itemType = this.inferType(value[0]);
          return `${itemType}[]`;
        }
        return 'Record<string, any>';
      default:
        return 'any';
    }
  }

  // Infer service from type and collection
  private inferService($type: string, collection: string): string {
    if ($type.includes('grain')) return 'grain.social';
    if ($type.includes('tangled')) return 'sh.tangled';
    if ($type.includes('bsky')) return 'bsky.app';
    if ($type.includes('atproto')) return 'atproto';
    
    // Try to extract service from collection
    if (collection.includes('grain')) return 'grain.social';
    if (collection.includes('tangled')) return 'sh.tangled';
    
    return 'unknown';
  }
} 