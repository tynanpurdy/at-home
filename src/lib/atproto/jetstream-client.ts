// Complete Jetstream implementation using documented @atcute/jetstream approach
import { JetstreamSubscription, type CommitEvent } from '@atcute/jetstream';
import { loadConfig } from '../config/site';

export interface JetstreamConfig {
  handle: string;
  did?: string;
  endpoint?: string;
  wantedCollections?: string[];
  wantedDids?: string[];
  cursor?: number;
}

export class JetstreamClient {
  private subscription: JetstreamSubscription | null = null;
  private config: JetstreamConfig;
  private isStreaming = false;
  private listeners: {
    onRecord?: (event: CommitEvent) => void;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  } = {};

  constructor(config?: Partial<JetstreamConfig>) {
    const siteConfig = loadConfig();
    this.config = {
      handle: config?.handle || siteConfig.atproto.handle,
      did: config?.did || siteConfig.atproto.did,
      endpoint: config?.endpoint || 'wss://jetstream2.us-east.bsky.network',
      wantedCollections: config?.wantedCollections || [],
      wantedDids: config?.wantedDids || [],
      cursor: config?.cursor,
    };
    
    console.log('🔧 JetstreamClient initialized');
  }

  async startStreaming(): Promise<void> {
    if (this.isStreaming) {
      console.log('⚠️ Already streaming');
      return;
    }

    console.log('🚀 Starting jetstream streaming...');
    this.isStreaming = true;

    try {
      // Add our DID to wanted DIDs if specified
      const wantedDids = [...(this.config.wantedDids || [])];
      if (this.config.did && !wantedDids.includes(this.config.did)) {
        wantedDids.push(this.config.did);
      }

      this.subscription = new JetstreamSubscription({
        url: this.config.endpoint!,
        wantedCollections: this.config.wantedCollections,
        wantedDids: wantedDids as any,
        cursor: this.config.cursor,
        onConnectionOpen: () => {
          console.log('✅ Connected to jetstream');
          this.listeners.onConnect?.();
        },
        onConnectionClose: () => {
          console.log('🔌 Disconnected from jetstream');
          this.isStreaming = false;
          this.listeners.onDisconnect?.();
        },
        onConnectionError: (error) => {
          console.error('❌ Jetstream connection error:', error);
          this.listeners.onError?.(new Error('Connection error'));
        },
      });

      // Process events using async iteration as documented
      this.processEvents();
      
    } catch (error) {
      this.isStreaming = false;
      throw error;
    }
  }

  private async processEvents(): Promise<void> {
    if (!this.subscription) return;

    try {
      // Use the documented async iteration approach
      for await (const event of this.subscription) {
        if (event.kind === 'commit') {
          console.log('📝 New commit:', {
            collection: event.commit.collection,
            operation: event.commit.operation,
            did: event.did,
          });
          
          this.listeners.onRecord?.(event);
        }
      }
    } catch (error) {
      console.error('Error processing jetstream events:', error);
      this.listeners.onError?.(error as Error);
    } finally {
      this.isStreaming = false;
      this.listeners.onDisconnect?.();
    }
  }

  stopStreaming(): void {
    this.subscription = null;
    this.isStreaming = false;
    console.log('🛑 Stopped jetstream streaming');
    this.listeners.onDisconnect?.();
  }

  // Event listeners
  onRecord(callback: (event: CommitEvent) => void): void {
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

  getStatus(): 'streaming' | 'stopped' {
    return this.isStreaming ? 'streaming' : 'stopped';
  }
}

// Shared Jetstream functionality
let sharedJetstream: JetstreamClient | null = null;
let connectionCount = 0;
const listeners: Map<string, Set<(event: CommitEvent) => void>> = new Map();

export function getSharedJetstream(): JetstreamClient {
  if (!sharedJetstream) {
    // Create a shared client with common collections
    sharedJetstream = new JetstreamClient({
      wantedCollections: [
        'app.bsky.feed.post',
        'a.status.update',
        'social.grain.gallery',
        'social.grain.gallery.item',
        'social.grain.photo',
        'com.whtwnd.blog.entry'
      ]
    });
    
    // Set up the main record handler that distributes to filtered listeners
    sharedJetstream.onRecord((event) => {
      // Distribute to all listeners that match the filter
      listeners.forEach((listenerSet, filterKey) => {
        if (matchesFilter(event, filterKey)) {
          listenerSet.forEach(callback => callback(event));
        }
      });
    });
  }
  return sharedJetstream;
}

// Start the shared stream (call once when first component needs it)
export async function startSharedStream(): Promise<void> {
  const jetstream = getSharedJetstream();
  if (connectionCount === 0) {
    await jetstream.startStreaming();
  }
  connectionCount++;
}

// Stop the shared stream (call when last component is done)
export function stopSharedStream(): void {
  connectionCount--;
  if (connectionCount <= 0 && sharedJetstream) {
    sharedJetstream.stopStreaming();
    connectionCount = 0;
  }
}

// Subscribe to filtered records
export function subscribeToRecords(
  filter: string | ((event: CommitEvent) => boolean),
  callback: (event: CommitEvent) => void
): () => void {
  const filterKey = typeof filter === 'string' ? filter : filter.toString();
  
  if (!listeners.has(filterKey)) {
    listeners.set(filterKey, new Set());
  }
  
  const listenerSet = listeners.get(filterKey)!;
  listenerSet.add(callback);
  
  // Return unsubscribe function
  return () => {
    const set = listeners.get(filterKey);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        listeners.delete(filterKey);
      }
    }
  };
}

// Helper to check if a record matches a filter
function matchesFilter(event: CommitEvent, filterKey: string): boolean {
  // Handle delete operations (no record property)
  if (event.commit.operation === 'delete') {
    // For delete operations, only support collection and operation matching
    if (filterKey.startsWith('collection:')) {
      const expectedCollection = filterKey.substring(11);
      return event.commit.collection === expectedCollection;
    }
    if (filterKey.startsWith('operation:')) {
      const expectedOperation = filterKey.substring(10);
      return event.commit.operation === expectedOperation;
    }
    return false;
  }
  
  // For create/update operations, we have record data
  const record = event.commit.record;
  const $type = record?.$type as string;
  
  // Support simple $type matching
  if (filterKey.startsWith('$type:')) {
    const expectedType = filterKey.substring(6);
    return $type === expectedType;
  }
  
  // Support collection matching
  if (filterKey.startsWith('collection:')) {
    const expectedCollection = filterKey.substring(11);
    return event.commit.collection === expectedCollection;
  }
  
  // Support operation matching
  if (filterKey.startsWith('operation:')) {
    const expectedOperation = filterKey.substring(10);
    return event.commit.operation === expectedOperation;
  }
  
  // Default to exact match
  return $type === filterKey;
}

// Convenience functions for common filters
export function subscribeToStatusUpdates(callback: (event: CommitEvent) => void): () => void {
  return subscribeToRecords('$type:a.status.update', callback);
}

export function subscribeToPosts(callback: (event: CommitEvent) => void): () => void {
  return subscribeToRecords('$type:app.bsky.feed.post', callback);
}

export function subscribeToGalleryUpdates(callback: (event: CommitEvent) => void): () => void {
  return subscribeToRecords('collection:social.grain.gallery', callback);
} 