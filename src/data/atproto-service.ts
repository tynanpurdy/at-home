/**
 * AT Protocol Data Service
 *
 * This module provides functions for fetching data from the AT Protocol,
 * with a built-in in-memory cache to improve performance and reduce API load.
 * It uses the centralized `AtpAgent` for all API communications.
 */

import { getAtpAgent } from "../lib/atp-agent";
import { AppBskyActorDefs, AppBskyFeedDefs } from "@atproto/api";
import type { WhiteWindPost, ATProtoRecord } from "../lib/atproto";

// --- Cache Configuration ---

// Time-to-Live for cache entries in milliseconds.
// Data will be considered "stale" after this duration and re-fetched on the next request.
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Define the structure for a cache entry.
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// The in-memory cache instance, using a Map for efficient key-value storage.
const cache = new Map<string, CacheEntry<any>>();

/**
 * Checks if a cache entry is valid and not expired.
 * @param entry The cache entry to validate.
 * @returns `true` if the entry exists and is not stale, otherwise `false`.
 */
function isCacheValid<T>(entry: CacheEntry<T> | undefined): boolean {
  if (!entry) {
    return false;
  }
  const isExpired = Date.now() - entry.timestamp > CACHE_TTL_MS;
  return !isExpired;
}

// --- Data Fetching Functions ---

/**
 * Fetches the detailed profile view for the authenticated user.
 * It leverages an in-memory cache to avoid redundant API calls. If an API call
 * fails, it will serve stale data from the cache if available.
 *
 * @returns A promise that resolves to the user's detailed profile, or null if it cannot be fetched.
 */
export async function getProfile(): Promise<AppBskyActorDefs.ProfileViewDetailed | null> {
  const cacheKey = "profile";
  const cachedEntry = cache.get(cacheKey);

  if (cachedEntry && isCacheValid(cachedEntry)) {
    console.log(`[Cache] HIT for key: ${cacheKey}`);
    return cachedEntry.data;
  }

  console.log(
    `[Cache] MISS for key: ${cacheKey}. Fetching from AT Protocol API...`,
  );

  try {
    const agent = await getAtpAgent();
    if (!agent.session) {
      throw new Error("AT Protocol agent session is not available.");
    }

    const response = await agent.api.app.bsky.actor.getProfile({
      actor: agent.session.did,
    });

    if (!response.success) {
      // Throw an error to be caught by the catch block
      throw new Error(
        "Failed to fetch profile: API request was not successful.",
      );
    }

    const profileData = response.data;

    // Store the fresh data in the cache
    cache.set(cacheKey, {
      data: profileData,
      timestamp: Date.now(),
    });
    console.log(`[Cache] SET for key: ${cacheKey}`);

    return profileData;
  } catch (error) {
    console.error("An error occurred while fetching the profile:", error);

    // In case of an API error, it's better to serve stale data than nothing.
    if (cachedEntry) {
      console.warn(
        `[Cache] API ERROR. Serving stale data for key: ${cacheKey}`,
      );
      return cachedEntry.data;
    }

    return null;
  }
}

/**
 * Fetches all blog posts (records from the com.whtwnd.blog.entry collection).
 * It leverages an in-memory cache and attaches author profile information to each post.
 *
 * @returns A promise that resolves to an array of blog posts.
 */
export async function getBlogPosts(): Promise<WhiteWindPost[]> {
  const cacheKey = "blogPosts";
  const cachedEntry = cache.get(cacheKey);

  if (cachedEntry && isCacheValid(cachedEntry)) {
    console.log(`[Cache] HIT for key: ${cacheKey}`);
    return cachedEntry.data;
  }

  console.log(
    `[Cache] MISS for key: ${cacheKey}. Fetching from AT Protocol API...`,
  );

  try {
    const agent = await getAtpAgent();
    if (!agent.session) {
      throw new Error("AT Protocol agent session is not available.");
    }

    // We need the author's profile to attach to each post.
    const authorProfile = await getProfile();
    if (!authorProfile) {
      throw new Error("Could not fetch author profile for blog posts.");
    }

    const response = await agent.api.com.atproto.repo.listRecords({
      repo: agent.session.did,
      collection: "com.whtwnd.blog.entry",
      limit: 100, // Fetch up to 100 posts
    });

    if (!response.success) {
      throw new Error("Failed to fetch blog posts from repository.");
    }

    console.log(
      `[API] Found ${response.data.records.length} records for collection 'com.whtwnd.blog.entry'.`,
    );

    // Map the raw records to our more usable WhiteWindPost structure.
    const posts: WhiteWindPost[] = response.data.records.map((item) => ({
      uri: item.uri,
      cid: item.cid,
      // Attach the author's profile information to each post.
      author: {
        did: authorProfile.did,
        handle: authorProfile.handle,
        displayName: authorProfile.displayName,
        avatar: authorProfile.avatar,
      },
      // The 'value' property holds the actual content of the record.
      record: item.value as WhiteWindPost["record"],
      // listRecords doesn't include these, so we set them to undefined/0.
      embed: undefined,
      replyCount: 0,
      repostCount: 0,
      likeCount: 0,
      indexedAt: (item.value as any).createdAt, // Use the post's createdAt as indexedAt
      labels: [],
    }));

    cache.set(cacheKey, { data: posts, timestamp: Date.now() });
    console.log(`[Cache] SET for key: ${cacheKey}`);

    return posts;
  } catch (error) {
    console.error("An error occurred while fetching blog posts:", error);
    if (cachedEntry) {
      console.warn(
        `[Cache] API ERROR. Serving stale data for key: ${cacheKey}`,
      );
      return cachedEntry.data;
    }
    return []; // Return an empty array on failure
  }
}

/**
 * Fetches a single post by its rkey.
 *
 * @param rkey The rkey of the post to fetch.
 * @returns A promise that resolves to a single post, or null if not found.
 */
export async function getPost(rkey: string): Promise<WhiteWindPost | null> {
  const cacheKey = `post_${rkey}`;
  const cachedEntry = cache.get(cacheKey);

  if (cachedEntry && isCacheValid(cachedEntry)) {
    console.log(`[Cache] HIT for key: ${cacheKey}`);
    return cachedEntry.data;
  }

  console.log(
    `[Cache] MISS for key: ${cacheKey}. Fetching from AT Protocol API...`,
  );

  try {
    const agent = await getAtpAgent();
    if (!agent.session) {
      throw new Error("AT Protocol agent session is not available.");
    }

    const response = await agent.api.com.atproto.repo.getRecord({
      repo: agent.session.did,
      collection: "com.whtwnd.blog.entry",
      rkey,
    });

    if (!response.success) {
      // This could be a 404 Not Found, which is a valid case.
      // We'll log it for debugging but return null without throwing an error.
      console.log(`Could not fetch post with rkey ${rkey}. It may not exist.`);
      return null;
    }

    const authorProfile = await getProfile();
    if (!authorProfile) {
      throw new Error("Could not fetch author profile for the post.");
    }

    const post: WhiteWindPost = {
      uri: response.data.uri,
      cid: response.data.cid,
      author: {
        did: authorProfile.did,
        handle: authorProfile.handle,
        displayName: authorProfile.displayName,
        avatar: authorProfile.avatar,
      },
      record: response.data.value as WhiteWindPost["record"],
      embed: undefined,
      replyCount: 0,
      repostCount: 0,
      likeCount: 0,
      indexedAt: (response.data.value as any).createdAt,
      labels: [],
    };

    cache.set(cacheKey, { data: post, timestamp: Date.now() });
    console.log(`[Cache] SET for key: ${cacheKey}`);

    return post;
  } catch (error) {
    console.error(`An error occurred while fetching post ${rkey}:`, error);
    if (cachedEntry) {
      console.warn(
        `[Cache] API ERROR. Serving stale data for key: ${cacheKey}`,
      );
      return cachedEntry.data;
    }
    return null;
  }
}

/**
 * Fetches the author's feed, which includes posts, reposts, and replies.
 *
 * @param limit The maximum number of feed items to return.
 * @returns A promise that resolves to an array of AT Protocol records.
 */
export async function getAuthorFeed(
  limit: number = 50,
): Promise<ATProtoRecord[]> {
  const cacheKey = `authorFeed_${limit}`;
  const cachedEntry = cache.get(cacheKey);

  if (cachedEntry && isCacheValid(cachedEntry)) {
    console.log(`[Cache] HIT for key: ${cacheKey}`);
    return cachedEntry.data;
  }

  console.log(
    `[Cache] MISS for key: ${cacheKey}. Fetching from AT Protocol API...`,
  );

  try {
    const agent = await getAtpAgent();
    if (!agent.session || !agent.session.handle) {
      throw new Error(
        "AT Protocol agent session handle is not available. Cannot fetch author feed.",
      );
    }
    const response = await agent.api.app.bsky.feed.getAuthorFeed({
      actor: agent.session.handle,
      limit,
    });

    if (!response.success) {
      throw new Error("Failed to fetch author feed from repository.");
    }

    console.log(
      `[API] Found ${response.data.feed.length} items in author feed.`,
    );

    // Filter out items that are not standard posts with a record,
    // and map the rest to our internal ATProtoRecord structure.
    const activity = response.data.feed.reduce(
      (acc: ATProtoRecord[], feedItem) => {
        const post = feedItem.post;
        if (post && post.record) {
          acc.push({
            uri: post.uri,
            cid: post.cid,
            author: {
              did: post.author.did,
              handle: post.author.handle,
              displayName: post.author.displayName,
              avatar: post.author.avatar,
            },
            record: post.record,
            indexedAt: post.indexedAt,
          });
        }
        return acc;
      },
      [],
    );

    cache.set(cacheKey, { data: activity, timestamp: Date.now() });
    console.log(`[Cache] SET for key: ${cacheKey}`);

    return activity;
  } catch (error) {
    console.error("An error occurred while fetching the author feed:", error);
    if (cachedEntry) {
      console.warn(
        `[Cache] API ERROR. Serving stale data for key: ${cacheKey}`,
      );
      return cachedEntry.data;
    }
    return [];
  }
}
