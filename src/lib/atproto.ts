import { AtpAgent } from "@atproto/api";
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
    visibility?: string;
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
  resolvedSubject?: {
    uri: string;
    text?: string;
    title?: string;
    author?: {
      handle: string;
      displayName?: string;
    };
  };
}

export interface RepositoryStats {
  totalRecords: number;
  recordsToday: number;
  recordsThisWeek: number;
  activeCollections: number;
  collectionCounts: Record<string, number>;
  lastUpdated: string;
}

export interface ActivityData {
  profile: any;
  recentActivity: ATProtoRecord[];
  repositoryStats?: RepositoryStats;
  blogPosts: WhiteWindPost[];
  collections: Array<{ name: string; records: ATProtoRecord[] }>;
}

export class ATProtoClient {
  private agent: AtpAgent;
  private config: ATProtoConfig;
  private authenticated = false;
  private delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  constructor(config: ATProtoConfig) {
    this.config = config;
    this.agent = new AtpAgent({
      service: config.service,
    });
  }

  async ensureAuthenticated(): Promise<void> {
    if (!this.authenticated && this.config.password) {
      console.log(
        `🔐 Authenticating with AT Protocol for identifier: ${this.config.identifier}...`,
      );
      try {
        await this.delay(100); // Add a small delay before login
        await this.agent.login({
          identifier: this.config.identifier,
          password: this.config.password,
        });
        this.authenticated = true;
        console.log("✅ Authentication successful");
      } catch (error) {
        console.error("❌ Authentication failed:", error);
        this.authenticated = false; // Ensure authenticated flag is false on failure
        throw error; // Re-throw to propagate the error
      }
    }
  }

  async getProfile(handle?: string): Promise<any> {
    await this.ensureAuthenticated();
    const actor = handle || this.config.handle || this.config.identifier;
    console.log("👤 Fetching profile for:", actor);
    await this.delay(100); // Add a small delay before fetching profile
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

      // Resolve subjects for likes and reposts (limited to most recent to avoid performance issues)
      const recordsToResolve = allRecords
        .filter(
          (record) =>
            record.value.subject &&
            (record.uri.includes("app.bsky.feed.like") ||
              record.uri.includes("app.bsky.feed.repost")),
        )
        .slice(0, 5); // Only resolve first 5 to maintain performance

      const recordsWithSubjectInfo = await Promise.all(
        allRecords.map(async (record) => {
          if (recordsToResolve.includes(record)) {
            const resolvedSubject = await this.resolveSubject(
              record.value.subject,
            );
            return {
              ...record,
              resolvedSubject,
            };
          }
          return record;
        }),
      );

      // Filter out records with invalid timestamps
      const validRecords = recordsWithSubjectInfo.filter((record) => {
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

  async resolveSubject(subjectRef: any): Promise<any> {
    if (!subjectRef) return null;

    try {
      const uri = typeof subjectRef === "string" ? subjectRef : subjectRef.uri;
      if (!uri) return null;

      // Parse the AT-URI to get repo and rkey
      const parts = uri.split("/");
      if (parts.length < 5) return null;

      const repo = parts[2];
      const collection = parts[3];
      const rkey = parts[4];

      // Only resolve posts for now
      if (collection !== "app.bsky.feed.post") {
        return null;
      }

      // Fetch the record
      const response = await this.agent.api.com.atproto.repo.getRecord({
        repo,
        collection,
        rkey,
      });

      if (!response.data) return null;

      // Get author info - try to resolve handle from repo
      let authorInfo = null;
      try {
        if (repo.includes(".")) {
          // It's already a handle
          authorInfo = {
            handle: repo,
            displayName: repo.split(".")[0],
          };
        } else {
          // It's a DID, try to resolve it
          const profile = await this.agent.getProfile({ actor: repo });
          authorInfo = {
            handle: profile.data.handle,
            displayName: profile.data.displayName || profile.data.handle,
          };
        }
      } catch (error) {
        console.warn("Could not resolve author for subject:", error);
        authorInfo = {
          handle: "unknown",
          displayName: "Unknown User",
        };
      }

      return {
        uri,
        text: response.data.value.text || "No content",
        title: response.data.value.title,
        content: response.data.value.content,
        author: authorInfo,
      };
    } catch (error) {
      console.warn("Could not resolve subject:", error);
      return null;
    }
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

  // Get comprehensive repository statistics
  async getRepositoryStats(handle?: string): Promise<RepositoryStats> {
    await this.ensureAuthenticated();
    const actor = handle || this.config.handle || this.config.identifier;

    try {
      console.log("📊 Fetching repository statistics for:", actor);

      const profile = await this.getProfile(actor);
      const did = profile.did;

      // Discover all collections in the repository
      const collectionsResponse =
        await this.agent.api.com.atproto.repo.describeRepo({
          repo: did,
        });
      const collections = collectionsResponse.data.collections;

      console.log("📚 Discovered collections:", collections.length);

      // Get all records from each collection (without limit)
      const collectionPromises = collections.map(async (collection) => {
        try {
          const records = await this.getAllRecordsFromCollection(
            collection,
            actor,
          );
          return { collection, records };
        } catch (error) {
          console.warn(
            `⚠️ Could not fetch all records from ${collection}:`,
            error,
          );
          return { collection, records: [] };
        }
      });

      const collectionResults = await Promise.all(collectionPromises);

      // Calculate statistics
      const allRecords: ATProtoRecord[] = [];
      const collectionCounts: Record<string, number> = {};

      for (const { collection, records } of collectionResults) {
        collectionCounts[collection] = records.length;
        allRecords.push(...records);
      }

      // Filter records with valid timestamps
      const validRecords = allRecords.filter((record) => {
        const timestamp = record.indexedAt;
        if (!timestamp) return false;

        const recordDate = new Date(timestamp);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        return recordDate > oneYearAgo && recordDate <= new Date();
      });

      // Calculate time-based statistics
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const recordsToday = validRecords.filter((record) => {
        const recordDate = new Date(record.indexedAt);
        return recordDate >= today;
      }).length;

      const recordsThisWeek = validRecords.filter((record) => {
        const recordDate = new Date(record.indexedAt);
        return recordDate >= weekAgo;
      }).length;

      const activeCollections = Object.values(collectionCounts).filter(
        (count) => count > 0,
      ).length;

      console.log("📊 Repository stats calculated:", {
        total: validRecords.length,
        today: recordsToday,
        week: recordsThisWeek,
        collections: activeCollections,
      });

      return {
        totalRecords: validRecords.length,
        recordsToday,
        recordsThisWeek,
        activeCollections,
        collectionCounts,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error fetching repository statistics:", error);
      return {
        totalRecords: 0,
        recordsToday: 0,
        recordsThisWeek: 0,
        activeCollections: 0,
        collectionCounts: {},
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  // Helper method to get all records from a collection
  async getAllRecordsFromCollection(
    collection: string,
    handle?: string,
    cursor?: string,
  ): Promise<ATProtoRecord[]> {
    const actor = handle || this.config.handle || this.config.identifier;
    const profile = await this.getProfile(actor);
    const did = profile.did;

    const allRecords: ATProtoRecord[] = [];
    let currentCursor = cursor;

    try {
      do {
        const response = await this.agent.api.com.atproto.repo.listRecords({
          repo: did,
          collection,
          limit: 100, // Max limit per request
          cursor: currentCursor,
        });

        const records = response.data.records.map((record: any) => ({
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

        allRecords.push(...records);
        currentCursor = response.data.cursor;

        // Safety check to avoid infinite loops
        if (allRecords.length > 10000) {
          console.warn(
            `⚠️ Stopping collection fetch at 10k records for ${collection}`,
          );
          break;
        }
      } while (currentCursor);

      return allRecords;
    } catch (error) {
      console.error(`❌ Error fetching all records from ${collection}:`, error);
      return [];
    }
  }

  // Get repository description with all collections
  async getRepositoryDescription(handle?: string): Promise<any> {
    await this.ensureAuthenticated();
    const actor = handle || this.config.handle || this.config.identifier;

    try {
      const profile = await this.getProfile(actor);
      const did = profile.did;

      const response = await this.agent.api.com.atproto.repo.describeRepo({
        repo: did,
      });

      return response.data;
    } catch (error) {
      console.error("❌ Error fetching repository description:", error);
      return { collections: [], handleIsCorrect: false };
    }
  }

  // Unified data fetching method for pages
  async getActivityData(
    options: {
      includeBlogPosts?: boolean;
      includeRepositoryStats?: boolean;
      activityLimit?: number;
      blogPostLimit?: number;
      collectionsLimit?: number;
    } = {},
  ): Promise<ActivityData> {
    const {
      includeBlogPosts = false,
      includeRepositoryStats = false,
      activityLimit = 20,
      blogPostLimit = 5,
      collectionsLimit = 5,
    } = options;

    console.log("🚀 Starting unified activity data fetch...");

    const requests = [this.getProfile()];

    // Only add recent activity if activityLimit > 0
    if (activityLimit > 0) {
      requests.push(this.getRecentActivity(undefined, activityLimit));
    }

    if (includeBlogPosts) {
      requests.push(this.getWhiteWindPosts(undefined, blogPostLimit));
    }

    if (includeRepositoryStats) {
      requests.push(this.getRepositoryStats());
    }

    // Add collection requests only if collectionsLimit > 0
    if (collectionsLimit > 0) {
      const collectionRequests = [
        this.getRepositoryRecords(
          COLLECTIONS.BLUESKY_POST,
          undefined,
          collectionsLimit,
        ),
        this.getRepositoryRecords(
          COLLECTIONS.BLUESKY_LIKE,
          undefined,
          collectionsLimit,
        ),
        this.getRepositoryRecords(
          COLLECTIONS.BLUESKY_REPOST,
          undefined,
          collectionsLimit,
        ),
        this.getRepositoryRecords(
          COLLECTIONS.BLUESKY_FOLLOW,
          undefined,
          collectionsLimit,
        ),
        this.getRepositoryRecords(
          COLLECTIONS.WHITEWIND_BLOG,
          undefined,
          collectionsLimit,
        ),
      ];

      requests.push(...collectionRequests);
    }

    try {
      // Add a general delay before initiating all requests to reduce initial burst
      await this.delay(100);

      const results = await Promise.allSettled(requests);

      results.forEach((result, i) => {
        if (result.status === "rejected") {
          console.error(`❌ AT Protocol request ${i} failed:`, result.reason);
        }
      });

      let resultIndex = 0;

      let profile: any = null;
      let recentActivity: any[] = [];
      let blogPosts: any[] = [];
      let repositoryStats: RepositoryStats | undefined;
      const collections: { name: string; records: any[] }[] = [];

      let currentIndex = 0;

      // Profile
      if (results[currentIndex]?.status === "fulfilled") {
        profile = results[currentIndex].value;
      }
      currentIndex++;

      // Recent Activity
      if (activityLimit > 0) {
        if (results[currentIndex]?.status === "fulfilled") {
          recentActivity = results[currentIndex].value as any[];
        }
        currentIndex++;
      }

      // Blog Posts
      if (includeBlogPosts) {
        if (results[currentIndex]?.status === "fulfilled") {
          blogPosts = results[currentIndex].value as any[];
        }
        currentIndex++;
      }

      // Repository Stats
      if (includeRepositoryStats) {
        if (results[currentIndex]?.status === "fulfilled") {
          repositoryStats = results[currentIndex].value as RepositoryStats;
        }
        currentIndex++;
      }

      // Collections
      if (collectionsLimit > 0) {
        const collectionNames = [
          "Posts",
          "Likes",
          "Reposts",
          "Follows",
          "Blog Posts",
        ];
        for (let i = 0; i < collectionNames.length; i++) {
          if (results[currentIndex + i]?.status === "fulfilled") {
            collections.push({
              name: collectionNames[i],
              records: results[currentIndex + i].value as any[],
            });
          }
        }
      }

      console.log("🎉 Unified activity data fetch completed");

      return {
        profile,
        recentActivity,
        repositoryStats,
        blogPosts,
        collections,
      };
    } catch (error) {
      console.error("❌ Error in unified activity data fetch:", error);
      return {
        profile: null,
        recentActivity: [],
        repositoryStats: undefined,
        blogPosts: [],
        collections: [],
      };
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

// Alias for backward compatibility
export const ATPROTO_COLLECTIONS = COLLECTIONS;

// Type for collection names
export type CollectionName = (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
