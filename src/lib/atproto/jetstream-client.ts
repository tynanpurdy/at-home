// Jetstream-based repository streaming with DID filtering (based on atptools)
import { loadConfig } from '../config/site';

export interface JetstreamRecord {
  uri: string;
  cid: string;
  value: any;
  indexedAt: string;
  collection: string;
  $type: string;
  service: string;
  did: string;
  time_us: number;
  operation: 'create' | 'update' | 'delete';
}

export interface JetstreamConfig {
  handle: string;
  did?: string;
  endpoint?: string;
  wantedCollections?: string[];
  wantedDids?: string[];
  cursor?: number;
}

export class JetstreamClient {
  private ws: WebSocket | null = null;
  private config: JetstreamConfig;
  private targetDid: string | null = null;
  private isStreaming = false;
  private listeners: {
    onRecord?: (record: JetstreamRecord) => void;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  } = {};

  constructor(config?: Partial<JetstreamConfig>) {
    const siteConfig = loadConfig();
    this.config = {
      handle: config?.handle || siteConfig.atproto.handle,
      did: config?.did || siteConfig.atproto.did,
      endpoint: config?.endpoint || 'wss://jetstream1.us-east.bsky.network/subscribe',
      wantedCollections: config?.wantedCollections || [],
      wantedDids: config?.wantedDids || [],
      cursor: config?.cursor,
    };
    this.targetDid = this.config.did || null;
    
    console.log('🔧 JetstreamClient initialized with handle:', this.config.handle);
    console.log('🎯 Target DID for filtering:', this.targetDid);
    console.log('🌐 Endpoint:', this.config.endpoint);
  }

  // Start streaming all repository activity
  async startStreaming(): Promise<void> {
    if (this.isStreaming) {
      console.log('⚠️ Already streaming repository');
      return;
    }

    console.log('🚀 Starting jetstream repository streaming...');
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

      // Add target DID to wanted DIDs
      if (this.targetDid && !this.config.wantedDids!.includes(this.targetDid)) {
        this.config.wantedDids!.push(this.targetDid);
      }

      // Start WebSocket connection
      this.connect();
      
    } catch (error) {
      this.isStreaming = false;
      throw error;
    }
  }

  // Stop streaming
  stopStreaming(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isStreaming = false;
    console.log('🛑 Stopped jetstream streaming');
    this.listeners.onDisconnect?.();
  }

  // Connect to jetstream WebSocket
  private connect(): void {
    try {
      const url = new URL(this.config.endpoint!);
      
      // Add query parameters for filtering (using atptools' parameter names)
      this.config.wantedCollections!.forEach((collection) => {
        url.searchParams.append('wantedCollections', collection);
      });
      this.config.wantedDids!.forEach((did) => {
        url.searchParams.append('wantedDids', did);
      });
      if (this.config.cursor) {
        url.searchParams.set('cursor', this.config.cursor.toString());
      }

      console.log('🔌 Connecting to jetstream:', url.toString());
      
      this.ws = new WebSocket(url.toString());
      
      this.ws.onopen = () => {
        console.log('✅ Connected to jetstream');
        this.listeners.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing jetstream message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Jetstream WebSocket error:', error);
        this.listeners.onError?.(new Error('WebSocket error'));
      };

      this.ws.onclose = () => {
        console.log('🔌 Disconnected from jetstream');
        this.isStreaming = false;
        this.listeners.onDisconnect?.();
      };

    } catch (error) {
      console.error('Error connecting to jetstream:', error);
      this.listeners.onError?.(error as Error);
    }
  }

  // Handle incoming jetstream messages
  private handleMessage(data: any): void {
    try {
      // Handle different message types based on atptools' format
      if (data.kind === 'commit') {
        this.handleCommit(data);
      } else if (data.kind === 'account') {
        console.log('Account event:', data);
      } else if (data.kind === 'identity') {
        console.log('Identity event:', data);
      } else {
        console.log('Unknown message type:', data);
      }
    } catch (error) {
      console.error('Error handling jetstream message:', error);
    }
  }

  // Handle commit events (record changes)
  private handleCommit(data: any): void {
    try {
      const commit = data.commit;
      const event = data;

      // Filter by DID if specified
      if (this.targetDid && event.did !== this.targetDid) {
        return;
      }

      const jetstreamRecord: JetstreamRecord = {
        uri: `at://${event.did}/${commit.collection}/${commit.rkey}`,
        cid: commit.cid || '',
        value: commit.record || {},
        indexedAt: new Date(event.time_us / 1000).toISOString(),
        collection: commit.collection,
        $type: (commit.record?.$type as string) || 'unknown',
        service: this.inferService((commit.record?.$type as string) || '', commit.collection),
        did: event.did,
        time_us: event.time_us,
        operation: commit.operation,
      };

      console.log('📝 New record from jetstream:', {
        collection: jetstreamRecord.collection,
        $type: jetstreamRecord.$type,
        operation: jetstreamRecord.operation,
        uri: jetstreamRecord.uri,
        service: jetstreamRecord.service
      });
      
      this.listeners.onRecord?.(jetstreamRecord);
    } catch (error) {
      console.error('Error handling commit:', error);
    }
  }

  // Infer service from record type and collection
  private inferService($type: string, collection: string): string {
    if (collection.startsWith('grain.social')) return 'grain.social';
    if (collection.startsWith('app.bsky')) return 'bsky.app';
    if ($type.includes('grain')) return 'grain.social';
    return 'unknown';
  }

  // Resolve handle to DID
  private async resolveHandle(handle: string): Promise<string | null> {
    try {
      // For now, use the configured DID
      // In a real implementation, you'd call the ATProto API
      return this.config.did || null;
    } catch (error) {
      console.error('Error resolving handle:', error);
      return null;
    }
  }

  // Event listeners
  onRecord(callback: (record: JetstreamRecord) => void): void {
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

  // Get streaming status
  getStatus(): 'streaming' | 'stopped' {
    return this.isStreaming ? 'streaming' : 'stopped';
  }
} 