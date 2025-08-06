// Simple Graze Turbostream client for real-time, hydrated ATproto records
import { loadConfig } from '../config/site';

export interface TurbostreamRecord {
  at_uri: string;
  did: string;
  time_us: number;
  message: any; // Raw jetstream record
  hydrated_metadata: {
    user?: any; // profileViewDetailed
    mentions?: Record<string, any>; // Map of mentioned DIDs to profile objects
    parent_post?: any; // postViewBasic
    reply_post?: any; // postView
    quote_post?: any; // postView or null
  };
}

export class TurbostreamClient {
  private ws: WebSocket | null = null;
  private config: any;
  private targetDid: string | null = null;
  private listeners: {
    onRecord?: (record: TurbostreamRecord) => void;
    onError?: (error: Error) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
  } = {};

  constructor() {
    const siteConfig = loadConfig();
    this.config = {
      handle: siteConfig.atproto.handle,
      did: siteConfig.atproto.did,
    };
    this.targetDid = siteConfig.atproto.did || null;
    console.log('🔧 TurbostreamClient initialized with handle:', this.config.handle);
    console.log('🎯 Target DID for filtering:', this.targetDid);
  }

  // Connect to Turbostream WebSocket
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('⚠️ Already connected to Turbostream');
      return;
    }

    console.log('🔌 Connecting to Graze Turbostream...');
    console.log('📍 WebSocket URL: wss://api.graze.social/app/api/v1/turbostream/turbostream');
    
    const wsUrl = `wss://api.graze.social/app/api/v1/turbostream/turbostream`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('✅ Connected to Graze Turbostream');
      console.log('📡 WebSocket readyState:', this.ws?.readyState);
      this.listeners.onConnect?.();
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.processMessage(data);
      } catch (error) {
        console.error('❌ Error parsing Turbostream message:', error);
        this.listeners.onError?.(error as Error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('❌ Turbostream WebSocket error:', error);
      this.listeners.onError?.(new Error('WebSocket error'));
    };

    this.ws.onclose = (event) => {
      console.log('🔌 Turbostream WebSocket closed:', event.code, event.reason);
      this.listeners.onDisconnect?.();
    };
  }

  // Disconnect from Turbostream
  disconnect(): void {
    if (this.ws) {
      console.log('🔌 Disconnecting from Turbostream...');
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  // Process incoming messages from Turbostream
  private processMessage(data: any): void {
    if (Array.isArray(data)) {
      data.forEach((record: TurbostreamRecord) => {
        this.processRecord(record);
      });
    } else if (data && typeof data === 'object') {
      this.processRecord(data as TurbostreamRecord);
    }
  }

  // Process individual record
  private processRecord(record: TurbostreamRecord): void {
    // Filter records to only show those from our configured handle
    if (this.targetDid && record.did !== this.targetDid) {
      return;
    }

    console.log('📝 Processing record from target DID:', {
      uri: record.at_uri,
      did: record.did,
      time: new Date(record.time_us / 1000).toISOString(),
      hasUser: !!record.hydrated_metadata?.user,
      hasText: !!record.message?.text,
      textPreview: record.message?.text?.substring(0, 50) + '...'
    });
    
    this.listeners.onRecord?.(record);
  }

  // Event listeners
  onRecord(callback: (record: TurbostreamRecord) => void): void {
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

  // Get connection status
  getStatus(): 'connecting' | 'connected' | 'disconnected' {
    if (this.ws?.readyState === WebSocket.CONNECTING) return 'connecting';
    if (this.ws?.readyState === WebSocket.OPEN) return 'connected';
    return 'disconnected';
  }
} 