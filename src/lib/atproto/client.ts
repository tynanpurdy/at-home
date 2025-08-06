import { AtpAgent } from '@atproto/api';
import type { AtprotoRecord } from '../types/atproto';

// Simple in-memory cache with TTL
class AtprotoCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export class AtprotoClient {
  private agent: AtpAgent;
  private cache: AtprotoCache;

  constructor(pdsUrl: string = 'https://bsky.social') {
    this.agent = new AtpAgent({ service: pdsUrl });
    this.cache = new AtprotoCache();
  }

  async resolveHandle(handle: string): Promise<string | null> {
    const cacheKey = `handle:${handle}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.agent.api.com.atproto.identity.resolveHandle({
        handle: handle,
      });

      const did = response.data.did;
      this.cache.set(cacheKey, did);
      return did;
    } catch (error) {
      console.error('Error resolving handle:', error);
      return null;
    }
  }

  async getRecords(identifier: string, collection: string, limit: number = 50): Promise<AtprotoRecord[]> {
    // Check if identifier is a handle (contains @) or DID
    let did = identifier;
    if (identifier.includes('@')) {
      console.log('AtprotoClient: Resolving handle to DID:', identifier);
      const resolvedDid = await this.resolveHandle(identifier);
      if (!resolvedDid) {
        console.error('AtprotoClient: Failed to resolve handle:', identifier);
        return [];
      }
      did = resolvedDid;
      console.log('AtprotoClient: Resolved handle to DID:', did);
    }

    const cacheKey = `records:${did}:${collection}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    console.log('AtprotoClient: Fetching records for DID:', did);
    console.log('AtprotoClient: Collection:', collection);
    console.log('AtprotoClient: Limit:', limit);

    try {
      const response = await this.agent.api.com.atproto.repo.listRecords({
        repo: did,
        collection,
        limit,
      });

      console.log('AtprotoClient: API response received');
      console.log('AtprotoClient: Records count:', response.data.records.length);

      const records = response.data.records.map((record: any) => ({
        uri: record.uri,
        cid: record.cid,
        value: record.value,
        indexedAt: record.indexedAt,
      }));

      this.cache.set(cacheKey, records);
      return records;
    } catch (error) {
      console.error('AtprotoClient: Error fetching records:', error);
      console.error('AtprotoClient: Error details:', {
        did,
        collection,
        limit,
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  async getFeed(feedUri: string, limit: number = 20): Promise<AtprotoRecord[]> {
    const cacheKey = `feed:${feedUri}:${limit}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.agent.api.app.bsky.feed.getFeed({
        feed: feedUri,
        limit,
      });

      const records = response.data.feed.map((item: any) => ({
        uri: item.post.uri,
        cid: item.post.cid,
        value: item.post.record,
        indexedAt: item.post.indexedAt,
      }));

      this.cache.set(cacheKey, records);
      return records;
    } catch (error) {
      console.error('Error fetching feed:', error);
      return [];
    }
  }

  async getProfile(did: string): Promise<any> {
    const cacheKey = `profile:${did}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.agent.api.app.bsky.actor.getProfile({
        actor: did,
      });

      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  // Filter records by supported content types
  filterSupportedRecords(records: AtprotoRecord[]): AtprotoRecord[] {
    return records.filter(record => {
      const type = record.value?.$type;
      return type && (
        type === 'app.bsky.feed.post' ||
        type === 'app.bsky.actor.profile#whitewindBlogPost' ||
        type === 'app.bsky.actor.profile#leafletPublication' ||
        type === 'app.bsky.actor.profile#grainImageGallery'
      );
    });
  }

  // Clear cache (useful for development)
  clearCache(): void {
    this.cache.clear();
  }
} 