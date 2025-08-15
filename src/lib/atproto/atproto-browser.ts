// ATProto browser implementation based on atptools
import { AtpAgent } from '@atproto/api';
import { loadConfig } from '../config/site';

export interface AtprotoRecord {
  uri: string;
  cid: string;
  value: any;
  indexedAt: string;
  collection: string;
  $type: string;
}

export interface RepoInfo {
  did: string;
  handle: string;
  collections: string[];
  recordCount: number;
  profile?: any;
}

export interface CollectionInfo {
  collection: string;
  recordCount: number;
  records: AtprotoRecord[];
  cursor?: string;
}

export class AtprotoBrowser {
  private agent: AtpAgent;
  private config: any;

  constructor() {
    const siteConfig = loadConfig();
    this.config = {
      pdsUrl: siteConfig.atproto.pdsUrl || 'https://bsky.social',
    };
    this.agent = new AtpAgent({ service: this.config.pdsUrl });
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

  // Get repository information
  async getRepoInfo(identifier: string): Promise<RepoInfo | null> {
    try {
      // Resolve handle to DID if needed
      let did = identifier;
      if (identifier.includes('@') || !identifier.startsWith('did:')) {
        const resolvedDid = await this.resolveHandle(identifier);
        if (!resolvedDid) {
          throw new Error(`Could not resolve handle: ${identifier}`);
        }
        did = resolvedDid;
      }

      // Get repository description
      const repoResponse = await this.agent.api.com.atproto.repo.describeRepo({
        repo: did,
      });

      // Get profile if available
      let profile = null;
      try {
        const profileResponse = await this.agent.api.app.bsky.actor.getProfile({
          actor: did,
        });
        profile = profileResponse.data;
      } catch (error) {
        // Profile not available, continue without it
      }

      return {
        did: did,
        handle: repoResponse.data.handle || identifier,
        collections: repoResponse.data.collections || [],
        recordCount: repoResponse.data.recordCount || 0,
        profile: profile,
      };
    } catch (error) {
      console.error('Error getting repo info:', error);
      return null;
    }
  }

  // Get records from a specific collection
  async getCollectionRecords(
    identifier: string,
    collection: string,
    limit: number = 100,
    cursor?: string
  ): Promise<CollectionInfo | null> {
    try {
      // Resolve handle to DID if needed
      let did = identifier;
      if (identifier.includes('@') || !identifier.startsWith('did:')) {
        const resolvedDid = await this.resolveHandle(identifier);
        if (!resolvedDid) {
          throw new Error(`Could not resolve handle: ${identifier}`);
        }
        did = resolvedDid;
      }

      // Get records from collection
      const response = await this.agent.api.com.atproto.repo.listRecords({
        repo: did,
        collection: collection,
        limit: limit,
        cursor: cursor,
      });

      const records: AtprotoRecord[] = response.data.records.map((record: any) => ({
        uri: record.uri,
        cid: record.cid,
        value: record.value,
        indexedAt: record.indexedAt,
        collection: collection,
        $type: (record.value?.$type as string) || 'unknown',
      }));

      return {
        collection: collection,
        recordCount: records.length,
        records: records,
        cursor: response.data.cursor,
      };
    } catch (error) {
      console.error('Error getting collection records:', error);
      return null;
    }
  }

  // Get all records from a collection using pagination
  async getAllCollectionRecords(
    identifier: string,
    collection: string,
    maxTotal: number = 1000
  ): Promise<AtprotoRecord[]> {
    const results: AtprotoRecord[] = [];
    let cursor: string | undefined = undefined;

    try {
      while (true) {
        const page = await this.getCollectionRecords(identifier, collection, 100, cursor);
        if (!page) break;

        results.push(...page.records);

        if (!page.cursor) break;
        if (results.length >= maxTotal) break;
        cursor = page.cursor;
      }
    } catch (error) {
      console.error(`Error paginating collection ${collection}:`, error);
    }

    return results.slice(0, maxTotal);
  }

  // Get all collections for a repository
  async getAllCollections(identifier: string): Promise<string[]> {
    try {
      const repoInfo = await this.getRepoInfo(identifier);
      if (!repoInfo) {
        return [];
      }
      return repoInfo.collections;
    } catch (error) {
      console.error('Error getting collections:', error);
      return [];
    }
  }

  // Get a specific record
  async getRecord(uri: string): Promise<AtprotoRecord | null> {
    try {
      // Parse at://did:.../collection/rkey
      if (!uri.startsWith('at://')) throw new Error('Invalid at:// URI');
      const parts = uri.replace('at://', '').split('/');
      const repo = parts[0];
      const collection = parts[1];
      const rkey = parts[2];

      const response = await this.agent.api.com.atproto.repo.getRecord({
        repo,
        collection,
        rkey,
      });

      const record = response.data as any;
      return {
        uri: `at://${repo}/${collection}/${rkey}`,
        cid: record.cid,
        value: record.value,
        indexedAt: record.indexedAt,
        collection: collection || 'unknown',
        $type: (record.value?.$type as string) || 'unknown',
      };
    } catch (error) {
      console.error('Error getting record:', error);
      return null;
    }
  }

  // Search for records by type
  async searchRecordsByType(
    identifier: string,
    $type: string,
    limit: number = 100
  ): Promise<AtprotoRecord[]> {
    try {
      const collections = await this.getAllCollections(identifier);
      const results: AtprotoRecord[] = [];

      for (const collection of collections) {
        const collectionInfo = await this.getCollectionRecords(identifier, collection, limit);
        if (collectionInfo) {
          const matchingRecords = collectionInfo.records.filter(
            record => record.$type === $type
          );
          results.push(...matchingRecords);
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching records by type:', error);
      return [];
    }
  }

  // Get posts from an appview feed URI
  async getFeed(feedUri: string, limit: number = 20): Promise<AtprotoRecord[]> {
    try {
      const response = await this.agent.api.app.bsky.feed.getFeed({
        feed: feedUri,
        limit,
      });

      const records: AtprotoRecord[] = response.data.feed.map((item: any) => ({
        uri: item.post.uri,
        cid: item.post.cid,
        value: item.post.record,
        indexedAt: item.post.indexedAt,
        collection: item.post.uri.split('/')[2] || 'unknown',
        $type: (item.post.record?.$type as string) || 'unknown',
      }));

      return records;
    } catch (error) {
      console.error('Error fetching feed:', error);
      return [];
    }
  }
} 