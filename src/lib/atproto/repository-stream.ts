// Comprehensive repository streaming system for ATProto repositories
import { AtpAgent } from '@atproto/api';
import { loadConfig } from '../config/site';

export interface RepositoryRecord {
  uri: string;
  cid: string;
  value: any;
  indexedAt: string;
  collection: string;
  $type: string;
  service: string;
}

export interface RepositoryStreamConfig {
  handle: string;
  did?: string;
  pdsUrl?: string;
  pollInterval?: number; // milliseconds
  maxRecordsPerCollection?: number;
}

export class RepositoryStream {
  private agent: AtpAgent;
  private config: RepositoryStreamConfig;
  private targetDid: string | null = null;
  private discoveredCollections: string[] = [];
  private isStreaming = false;
  private pollInterval: NodeJS.Timeout | null = null;
  private lastSeenRecords: Map<string, string> = new Map(); // collection -> last CID
  private listeners: {
    onRecord?: (record: RepositoryRecord) => void;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onCollectionDiscovered?: (collection: string) => void;
  } = {};

  constructor(config?: Partial<RepositoryStreamConfig>) {
    const siteConfig = loadConfig();
    this.config = {
      handle: config?.handle || siteConfig.atproto.handle,
      did: config?.did || siteConfig.atproto.did,
      pdsUrl: config?.pdsUrl || siteConfig.atproto.pdsUrl || 'https://bsky.social',
      pollInterval: config?.pollInterval || 5000, // 5 seconds
      maxRecordsPerCollection: config?.maxRecordsPerCollection || 50,
    };
    this.targetDid = this.config.did || null;
    this.agent = new AtpAgent({ service: this.config.pdsUrl || 'https://bsky.social' });
    
    console.log('🔧 RepositoryStream initialized with handle:', this.config.handle);
    console.log('🎯 Target DID for filtering:', this.targetDid);
  }

  // Start streaming all repository content
  async startStreaming(): Promise<void> {
    if (this.isStreaming) {
      console.log('⚠️ Already streaming repository');
      return;
    }

    console.log('🚀 Starting comprehensive repository streaming...');
    this.isStreaming = true;

    try {
      // Resolve handle to DID if needed
      if (!this.targetDid) {
        this.targetDid = await this.resolveHandle(this.config.handle);
        if (!this.targetDid) {
          throw new Error(`Could not resolve handle: ${this.config.handle}`);
        }
        console.log('✅ Resolved DID:', this.targetDid);
      }

      // Discover all collections
      await this.discoverCollections();
      
      // Start polling all collections
      this.startPolling();
      
      this.listeners.onConnect?.();
      
    } catch (error) {
      this.isStreaming = false;
      throw error;
    }
  }

  // Stop streaming
  stopStreaming(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isStreaming = false;
    console.log('🛑 Stopped repository streaming');
    this.listeners.onDisconnect?.();
  }

  // Discover all collections in the repository
  private async discoverCollections(): Promise<void> {
    console.log('🔍 Discovering collections using repository sync...');
    
    this.discoveredCollections = [];

    try {
      // Get all records from the repository using sync API
      const response = await this.agent.api.com.atproto.repo.listRecords({
        repo: this.targetDid!,
        collection: 'app.bsky.feed.post', // Start with posts
        limit: 1000, // Get a large sample
      });

      const collectionSet = new Set<string>();
      
      // Extract collections from URIs
      for (const record of response.data.records) {
        const uriParts = record.uri.split('/');
        if (uriParts.length >= 3) {
          const collection = uriParts[2];
          collectionSet.add(collection);
        }
      }

      // Convert to array and sort
      this.discoveredCollections = Array.from(collectionSet).sort();
      
      console.log(`📊 Discovered ${this.discoveredCollections.length} collections:`, this.discoveredCollections);
      
      // Notify listeners for each discovered collection
      for (const collection of this.discoveredCollections) {
        console.log(`✅ Found collection: ${collection}`);
        this.listeners.onCollectionDiscovered?.(collection);
      }

    } catch (error) {
      console.error('Error discovering collections:', error);
      // Fallback to basic collections if discovery fails
      this.discoveredCollections = ['app.bsky.feed.post', 'app.bsky.actor.profile'];
    }
  }

  // Start polling all discovered collections
  private startPolling(): void {
    console.log('⏰ Starting collection polling...');
    
    this.pollInterval = setInterval(async () => {
      if (!this.isStreaming) return;
      
      for (const collection of this.discoveredCollections) {
        try {
          await this.pollCollection(collection);
        } catch (error) {
          console.error(`❌ Error polling collection ${collection}:`, error);
        }
      }
    }, this.config.pollInterval);
  }

  // Poll a specific collection for new records
  private async pollCollection(collection: string): Promise<void> {
    try {
      const response = await this.agent.api.com.atproto.repo.listRecords({
        repo: this.targetDid!,
        collection,
        limit: this.config.maxRecordsPerCollection!,
      });

      if (response.data.records.length === 0) return;

      const lastSeenCid = this.lastSeenRecords.get(collection);
      const newRecords: RepositoryRecord[] = [];

      for (const record of response.data.records) {
        // Check if this is a new record
        if (!lastSeenCid || record.cid !== lastSeenCid) {
          const repositoryRecord: RepositoryRecord = {
            uri: record.uri,
            cid: record.cid,
            value: record.value,
            indexedAt: (record as any).indexedAt || new Date().toISOString(),
            collection,
            $type: (record.value?.$type as string) || 'unknown',
            service: this.inferService((record.value?.$type as string) || '', collection),
          };

          newRecords.push(repositoryRecord);
        } else {
          // We've reached records we've already seen
          break;
        }
      }

      // Update last seen CID
      if (response.data.records.length > 0) {
        this.lastSeenRecords.set(collection, response.data.records[0].cid);
      }

      // Process new records
      for (const record of newRecords.reverse()) { // Process oldest first
        console.log('📝 New record from collection:', {
          collection: record.collection,
          $type: record.$type,
          uri: record.uri,
          service: record.service
        });
        
        this.listeners.onRecord?.(record);
      }

    } catch (error) {
      console.error(`❌ Error polling collection ${collection}:`, error);
    }
  }

  // Infer service from record type and collection
  private inferService($type: string, collection: string): string {
    if (collection.startsWith('grain.social')) return 'grain.social';
    if (collection.startsWith('app.bsky')) return 'bsky.app';
    if ($type.includes('grain')) return 'grain.social';
    if (collection === 'grain.social.content') return 'grain.social';
    return 'unknown';
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

  // Event listeners
  onRecord(callback: (record: RepositoryRecord) => void): void {
    this.listeners.onRecord = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.listeners.onError = callback;
  }

  onConnect(callback: () => void): void {
    this.listeners.onConnect = callback;
  }

  onDisconnect(callback: () => void): void {
    this.listeners.onDisconnect = callback;
  }

  onCollectionDiscovered(callback: (collection: string) => void): void {
    this.listeners.onCollectionDiscovered = callback;
  }

  // Get streaming status
  getStatus(): 'streaming' | 'stopped' {
    return this.isStreaming ? 'streaming' : 'stopped';
  }

  // Get discovered collections
  getDiscoveredCollections(): string[] {
    return [...this.discoveredCollections];
  }
} 