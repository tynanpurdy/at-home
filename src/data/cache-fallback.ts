/**
 * AT Protocol Cache Fallback Utilities
 *
 * This module provides fallback mechanisms when the cache is unavailable,
 * invalid, or needs to be refreshed on-demand.
 */

import { createATProtoClient } from "../lib/atproto";
import { getATProtoConfig } from "../config/atproto";
import { isCacheValid, getAllCachedData } from "./cache-utils";

// Import JSON files directly as a fallback if needed
import profileJson from "../data/cache/profile.json";
import activityJson from "../data/cache/activity.json";
import blogPostsJson from "../data/cache/blog-posts.json";
import repositoryStatsJson from "../data/cache/repository-stats.json";
import collectionsJson from "../data/cache/collections.json";

// Flag to track if we're currently refreshing the cache
let isRefreshingCache = false;

/**
 * Gets data with fallback to direct API if cache is invalid
 */
export async function getDataWithFallback() {
  // First try to use cache
  const cachedData = getAllCachedData();

  // If cache is valid, return it
  if (isCacheValid()) {
    return {
      ...cachedData,
      source: "cache",
    };
  }

  // Cache is invalid, need to fetch directly
  console.warn("⚠️ Cache invalid or missing, falling back to direct API fetch");

  try {
    // Get AT Protocol configuration
    const config = getATProtoConfig();

    // Initialize AT Protocol client
    const atClient = createATProtoClient(config);

    // Fetch data directly
    const freshData = await atClient.getActivityData({
      includeBlogPosts: true,
      includeRepositoryStats: true,
      activityLimit: 20,
      blogPostLimit: 10,
      collectionsLimit: 5,
    });

    return {
      ...freshData,
      source: "direct",
    };
  } catch (error) {
    console.error("❌ Failed to fetch data directly:", error);

    // If direct fetch fails but we have any cached data at all, use it as last resort
    if (cachedData.profile || cachedData.recentActivity.length > 0) {
      console.warn("⚠️ Using potentially stale cache as last resort");
      return {
        ...cachedData,
        source: "stale-cache",
      };
    }

    // Nothing worked, return empty data
    return {
      profile: null,
      recentActivity: [],
      blogPosts: [],
      repositoryStats: null,
      collections: [],
      source: "empty",
    };
  }
}

/**
 * Refreshes the cache on-demand (can be called from client components if needed)
 */
export async function refreshCache() {
  // Prevent multiple simultaneous refreshes
  if (isRefreshingCache) {
    return { success: false, message: "Cache refresh already in progress" };
  }

  isRefreshingCache = true;

  try {
    // In browser environments, we can't write to the filesystem
    // but we can at least fetch fresh data
    const config = getATProtoConfig();
    const atClient = createATProtoClient(config);

    // Fetch fresh data directly
    const freshData = await atClient.getActivityData({
      includeBlogPosts: true,
      includeRepositoryStats: true,
      activityLimit: 20,
      blogPostLimit: 10,
      collectionsLimit: 5,
    });

    // If in Node.js environment, we'd save to filesystem here
    // but in browser we just return the fresh data

    isRefreshingCache = false;
    return {
      success: true,
      message:
        "Data refreshed successfully (note: browser refresh does not update cache files)",
      data: freshData,
    };
  } catch (error) {
    isRefreshingCache = false;
    return {
      success: false,
      message: `Failed to refresh data: ${error.message}`,
    };
  }
}

/**
 * Function to use in components that need fresh data during client-side navigation
 * This creates a hybrid approach - build-time cache with client-side refresh capability
 */
export async function getHybridData() {
  // Always start with cached data for fast initial render
  const cachedData = {
    profile: profileJson,
    recentActivity: activityJson,
    blogPosts: blogPostsJson,
    repositoryStats: repositoryStatsJson,
    collections: collectionsJson,
    source: "direct-import",
  };

  // If we're in the browser, we can refresh the data client-side
  if (typeof window !== "undefined") {
    try {
      // Get AT Protocol configuration
      const config = getATProtoConfig();

      // Initialize AT Protocol client
      const atClient = createATProtoClient(config);

      // Fetch fresh data directly (can be used to update UI without full page refresh)
      const freshData = await atClient.getActivityData({
        includeBlogPosts: true,
        includeRepositoryStats: true,
        activityLimit: 10,
        blogPostLimit: 5,
        collectionsLimit: 3,
      });

      return {
        ...freshData,
        source: "hybrid",
      };
    } catch (error) {
      console.error("Failed to fetch hybrid data:", error);
      // Fall back to cache on error
    }
  }

  return cachedData;
}
