import { BskyAgent, AtpAgent } from "@atproto/api";
import { AtUri } from "@atproto/syntax";

export interface ATProtoConfig {
  service: string;
  identifier: string;
  password?: string;
  handle?: string;
}

export interface WhiteWindPost {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  record: {
    text: string;
    createdAt: string;
    title?: string;
    content?: string;
    visibility?: "public" | "unlisted" | "followers";
    tags?: string[];
  };
  indexedAt: string;
}

export interface ATProtoRecord {
  uri: string;
  cid: string;
  value: any;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  indexedAt: string;
}

export class ATProtoClient {
  private agent: BskyAgent;
  private config: ATProtoConfig;
  private authenticated = false;

  constructor(config: ATProtoConfig) {
    this.config = config;
    this.agent = new BskyAgent({
      service: config.service,
    });
  }

  async ensureAuthenticated(): Promise<void> {
    if (!this.authenticated && this.config.password) {
      console.log("🔐 Authenticating with AT Protocol...");
      await this.agent.login({
        identifier: this.config.identifier,
        password: this.config.password,
      });
      this.authenticated = true;
      console.log("✅ Authentication successful");
    }
  }

  async getProfile(handle?: string): Promise<any> {
    await this.ensureAuthenticated();
    const actor = handle || this.config.handle || this.config.identifier;
    console.log("👤 Fetching profile for:", actor);
    const response = await this.agent.getProfile({ actor });
    console.log("✅ Profile fetched:", response.data.handle);
    return response.data;
  }

  async getWhiteWindPosts(
    handle?: string,
    limit = 50,
  ): Promise<WhiteWindPost[]> {
    await this.ensureAuthenticated();
    const actor = handle || this.config.handle || this.config.identifier;

    try {
      console.log("📝 Fetching WhiteWind posts for:", actor);

      // Get the user's DID first (skip if we already have it)
      const profile = await this.getProfile(actor);
      const did = profile.did;

      // Query for WhiteWind posts (com.whtwnd.blog.entry)
      const response = await this.agent.api.com.atproto.repo.listRecords({
        repo: did,
        collection: "com.whtwnd.blog.entry",
        limit,
      });

      console.log(
        "📝 WhiteWind API response:",
        response.data.records.length,
        "records found",
      );

      return response.data.records.map((record: any) => ({
        uri: record.uri,
        cid: record.cid,
        author: {
          did: did,
          handle: profile.handle,
          displayName: profile.displayName,
          avatar: profile.avatar,
        },
        record: {
          text: record.value.content || "",
          createdAt: record.value.createdAt,
          title: record.value.title,
          content: record.value.content,
          visibility: record.value.visibility || "public",
          tags: record.value.tags || [],
        },
        indexedAt: record.value.createdAt,
      }));
    } catch (error) {
      console.error("❌ Error fetching WhiteWind posts:", error);
      return [];
    }
  }

  async getRepositoryRecords(
    collection: string,
    handle?: string,
    limit = 10,
  ): Promise<ATProtoRecord[]> {
    await this.ensureAuthenticated();
    const actor = handle || this.config.handle || this.config.identifier;

    try {
      // Skip verbose logging for performance
      const profile = await this.getProfile(actor);
      const did = profile.did;

      const response = await this.agent.api.com.atproto.repo.listRecords({
        repo: did,
        collection,
        limit,
      });

      // Reduced logging for performance
      if (response.data.records.length > 0) {
        console.log(
          `📂 ${collection}: ${response.data.records.length} records`,
        );
      }

      return response.data.records.map((record: any) => ({
        uri: record.uri,
        cid: record.cid,
        value: record.value,
        author: {
          did: did,
          handle: profile.handle,
          displayName: profile.displayName,
          avatar: profile.avatar,
        },
        indexedAt: record.value.createdAt || record.value.indexedAt || null,
      }));
    } catch (error) {
      console.error(`❌ Error fetching records from ${collection}:`, error);
      return [];
    }
  }

  async getRecentActivity(
    handle?: string,
    limit = 20,
  ): Promise<ATProtoRecord[]> {
    await this.ensureAuthenticated();
    const actor = handle || this.config.handle || this.config.identifier;

    try {
      console.log("🔄 Fetching recent activity for:", actor);

      const profile = await this.getProfile(actor);
      const did = profile.did;

      // Only fetch from the most common collections for performance
      // Exclude profile updates as they cause timestamp issues
      const priorityCollections = [
        "app.bsky.feed.post",
        "app.bsky.feed.like",
        "app.bsky.feed.repost",
        "app.bsky.graph.follow",
        "com.whtwnd.blog.entry",
      ];

      // Use concurrent requests for better performance
      const recordPromises = priorityCollections.map(async (collection) => {
        try {
          const records = await this.getRepositoryRecords(
            collection,
            actor,
            5, // Reduced limit per collection
          );
          return records;
        } catch (error) {
          console.warn(
            `⚠️ Could not fetch from collection ${collection}:`,
            error,
          );
          return [];
        }
      });

      // Wait for all requests to complete concurrently
      const recordArrays = await Promise.all(recordPromises);
      const allRecords: ATProtoRecord[] = recordArrays.flat();

      // Filter out records with invalid timestamps
      const validRecords = allRecords.filter((record) => {
        const timestamp = record.indexedAt;
        if (!timestamp || timestamp === new Date().toISOString()) {
          return false; // Skip records with missing or current timestamps
        }

        // Skip records older than 1 year (likely invalid)
        const recordDate = new Date(timestamp);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        return recordDate > oneYearAgo && recordDate < new Date();
      });

      console.log("🔄 Total activity records found:", validRecords.length);

      // Sort by creation date and return the most recent
      return validRecords
        .sort(
          (a, b) =>
            new Date(b.indexedAt).getTime() - new Date(a.indexedAt).getTime(),
        )
        .slice(0, limit);
    } catch (error) {
      console.error("❌ Error fetching recent activity:", error);
      return [];
    }
  }

  async getBlogPosts(handle?: string, limit = 10): Promise<WhiteWindPost[]> {
    return this.getWhiteWindPosts(handle, limit);
  }

  // Helper method to parse AT-URI
  parseAtUri(uri: string) {
    try {
      return new AtUri(uri);
    } catch (error) {
      console.error("Invalid AT-URI:", uri, error);
      return null;
    }
  }

  // Helper method to format dates
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Helper method to format relative time
  formatRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else if (diffInSeconds < 2592000) {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } else {
      return this.formatDate(dateString);
    }
  }
}

// Default client instance
export const createATProtoClient = (config: ATProtoConfig): ATProtoClient => {
  return new ATProtoClient(config);
};

// Common collections in the AT Protocol ecosystem
export const COLLECTIONS = {
  WHITEWIND_BLOG: "com.whtwnd.blog.entry",
  BLUESKY_POST: "app.bsky.feed.post",
  BLUESKY_LIKE: "app.bsky.feed.like",
  BLUESKY_REPOST: "app.bsky.feed.repost",
  BLUESKY_FOLLOW: "app.bsky.graph.follow",
  BLUESKY_PROFILE: "app.bsky.actor.profile",
} as const;

// Type for collection names
export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
