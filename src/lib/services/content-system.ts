import { AtprotoBrowser } from '../atproto/atproto-browser';
import { JetstreamClient } from '../atproto/jetstream-client';
import { GrainGalleryService } from './grain-gallery-service';
import { loadConfig } from '../config/site';
import type { AtprotoRecord } from '../atproto/atproto-browser';

export interface ContentItem {
  uri: string;
  cid: string;
  $type: string;
  collection: string;
  createdAt: string;
  indexedAt: string;
  value: any;
  service: string;
  operation?: 'create' | 'update' | 'delete';
}

export interface ContentFeed {
  items: ContentItem[];
  lastUpdated: string;
  totalItems: number;
  collections: string[];
}

export interface ContentSystemConfig {
  enableStreaming?: boolean;
  buildTimeOnly?: boolean;
  collections?: string[];
  maxItems?: number;
}

export class ContentSystem {
  private browser: AtprotoBrowser;
  private jetstream: JetstreamClient;
  private grainGalleryService: GrainGalleryService;
  private config: any;
  private contentFeed: ContentFeed;
  private isStreaming = false;

  constructor() {
    this.config = loadConfig();
    this.browser = new AtprotoBrowser();
    this.jetstream = new JetstreamClient();
    this.grainGalleryService = new GrainGalleryService();
    
    this.contentFeed = {
      items: [],
      lastUpdated: new Date().toISOString(),
      totalItems: 0,
      collections: []
    };
  }

  // Initialize content system (build-time)
  async initialize(identifier: string, options: ContentSystemConfig = {}): Promise<ContentFeed> {
    console.log('🚀 Initializing content system for:', identifier);
    
    try {
      // Get repository info
      const repoInfo = await this.browser.getRepoInfo(identifier);
      if (!repoInfo) {
        throw new Error(`Could not get repository info for: ${identifier}`);
      }

      console.log('📊 Repository info:', {
        handle: repoInfo.handle,
        did: repoInfo.did,
        collections: repoInfo.collections.length,
        recordCount: repoInfo.recordCount
      });

      // Gather all content from collections
      const allItems: ContentItem[] = [];
      const collections = options.collections || repoInfo.collections;

      for (const collection of collections) {
        console.log(`📦 Fetching from collection: ${collection}`);
        const records = await this.browser.getCollectionRecords(identifier, collection, options.maxItems || 100);
        
        if (records && records.records) {
          for (const record of records.records) {
            const contentItem: ContentItem = {
              uri: record.uri,
              cid: record.cid,
              $type: record.$type,
              collection: record.collection,
              createdAt: record.value?.createdAt || record.indexedAt,
              indexedAt: record.indexedAt,
              value: record.value,
              service: this.inferService(record.$type, record.collection),
              operation: 'create' // Build-time items are existing
            };
            
            allItems.push(contentItem);
          }
        }
      }

      // Sort by creation date (newest first)
      allItems.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      this.contentFeed = {
        items: allItems,
        lastUpdated: new Date().toISOString(),
        totalItems: allItems.length,
        collections: collections
      };

      console.log(`✅ Content system initialized with ${allItems.length} items`);

      // Start streaming if enabled
      if (!options.buildTimeOnly && options.enableStreaming !== false) {
        await this.startStreaming(identifier);
      }

      return this.contentFeed;
    } catch (error) {
      console.error('Error initializing content system:', error);
      throw error;
    }
  }

  // Start real-time streaming
  async startStreaming(identifier: string): Promise<void> {
    if (this.isStreaming) {
      console.log('⚠️ Already streaming');
      return;
    }

    console.log('🌊 Starting real-time content streaming...');
    this.isStreaming = true;

    // Set up jetstream event handlers
    this.jetstream.onRecord((record) => {
      this.handleNewContent(record);
    });

    this.jetstream.onError((error) => {
      console.error('❌ Jetstream error:', error);
    });

    this.jetstream.onConnect(() => {
      console.log('✅ Connected to real-time stream');
    });

    this.jetstream.onDisconnect(() => {
      console.log('🔌 Disconnected from real-time stream');
      this.isStreaming = false;
    });

    // Start streaming
    await this.jetstream.startStreaming();
  }

  // Handle new content from streaming
  private handleNewContent(jetstreamRecord: any): void {
    const contentItem: ContentItem = {
      uri: jetstreamRecord.uri,
      cid: jetstreamRecord.cid,
      $type: jetstreamRecord.$type,
      collection: jetstreamRecord.collection,
      createdAt: jetstreamRecord.value?.createdAt || jetstreamRecord.indexedAt,
      indexedAt: jetstreamRecord.indexedAt,
      value: jetstreamRecord.value,
      service: jetstreamRecord.service,
      operation: jetstreamRecord.operation
    };

    // Add to beginning of feed (newest first)
    this.contentFeed.items.unshift(contentItem);
    this.contentFeed.totalItems++;
    this.contentFeed.lastUpdated = new Date().toISOString();

    console.log('📝 New content added:', {
      $type: contentItem.$type,
      collection: contentItem.collection,
      operation: contentItem.operation
    });

    // Emit event for UI updates
    this.emitContentUpdate(contentItem);
  }

  // Get current content feed
  getContentFeed(): ContentFeed {
    return this.contentFeed;
  }

  // Get content by type
  getContentByType($type: string): ContentItem[] {
    return this.contentFeed.items.filter(item => item.$type === $type);
  }

  // Get content by collection
  getContentByCollection(collection: string): ContentItem[] {
    return this.contentFeed.items.filter(item => item.collection === collection);
  }

  // Get galleries (using specialized service)
  async getGalleries(identifier: string): Promise<any[]> {
    return await this.grainGalleryService.getGalleries(identifier);
  }

  // Filter content by function
  filterContent(filterFn: (item: ContentItem) => boolean): ContentItem[] {
    return this.contentFeed.items.filter(filterFn);
  }

  // Search content
  searchContent(query: string): ContentItem[] {
    const lowerQuery = query.toLowerCase();
    return this.contentFeed.items.filter(item => {
      const text = JSON.stringify(item.value).toLowerCase();
      return text.includes(lowerQuery);
    });
  }

  // Stop streaming
  stopStreaming(): void {
    if (this.isStreaming) {
      this.jetstream.stopStreaming();
      this.isStreaming = false;
    }
  }

  // Infer service from record type and collection
  private inferService($type: string, collection: string): string {
    if (collection.startsWith('grain.social') || $type.includes('grain')) return 'grain.social';
    if (collection.startsWith('app.bsky')) return 'bsky.app';
    if (collection.startsWith('sh.tangled')) return 'sh.tangled';
    return 'unknown';
  }

  // Event system for UI updates
  private listeners: {
    onContentUpdate?: (item: ContentItem) => void;
    onContentAdd?: (item: ContentItem) => void;
    onContentRemove?: (item: ContentItem) => void;
  } = {};

  onContentUpdate(callback: (item: ContentItem) => void): void {
    this.listeners.onContentUpdate = callback;
  }

  onContentAdd(callback: (item: ContentItem) => void): void {
    this.listeners.onContentAdd = callback;
  }

  onContentRemove(callback: (item: ContentItem) => void): void {
    this.listeners.onContentRemove = callback;
  }

  private emitContentUpdate(item: ContentItem): void {
    this.listeners.onContentUpdate?.(item);
    if (item.operation === 'create') {
      this.listeners.onContentAdd?.(item);
    } else if (item.operation === 'delete') {
      this.listeners.onContentRemove?.(item);
    }
  }

  // Get streaming status
  getStreamingStatus(): 'streaming' | 'stopped' {
    return this.isStreaming ? 'streaming' : 'stopped';
  }
} 