/**
 * AT Protocol Cache Utilities
 *
 * This module provides utilities for reading cached AT Protocol data
 * to avoid rate limiting and improve performance.
 */

// Default empty data structures for fallbacks
const DEFAULT_PROFILE = null;
const DEFAULT_ACTIVITY = [];
const DEFAULT_BLOG_POSTS = [];
const DEFAULT_REPOSITORY_STATS = null;
const DEFAULT_COLLECTIONS = [];
const DEFAULT_CACHE_META = { lastUpdated: null, dataCount: {} };

// Import JSON files directly - these are handled by our Vite plugin
// The imports are resolved at build time
import profileJson from "../data/cache/profile.json";
import activityJson from "../data/cache/activity.json";
import blogPostsJson from "../data/cache/blog-posts.json";
import repositoryStatsJson from "../data/cache/repository-stats.json";
import collectionsJson from "../data/cache/collections.json";
import metaJson from "../data/cache/meta.json";

/**
 * Gets cached profile data
 */
export function getCachedProfile() {
  return profileJson || DEFAULT_PROFILE;
}

/**
 * Gets cached activity data
 */
export function getCachedActivity() {
  return activityJson || DEFAULT_ACTIVITY;
}

/**
 * Gets cached blog posts
 */
export function getCachedBlogPosts() {
  return blogPostsJson || DEFAULT_BLOG_POSTS;
}

/**
 * Gets cached repository stats
 */
export function getCachedRepositoryStats() {
  return repositoryStatsJson || DEFAULT_REPOSITORY_STATS;
}

/**
 * Gets cached collections
 */
export function getCachedCollections() {
  return collectionsJson || DEFAULT_COLLECTIONS;
}

/**
 * Gets cache metadata
 */
export function getCacheMeta() {
  return metaJson || DEFAULT_CACHE_META;
}

/**
 * Gets all cached data in a single object
 *
 * This mirrors the structure of atClient.getActivityData() for easier migration
 */
export function getAllCachedData() {
  return {
    profile: getCachedProfile(),
    recentActivity: getCachedActivity(),
    blogPosts: getCachedBlogPosts(),
    repositoryStats: getCachedRepositoryStats(),
    collections: getCachedCollections(),
    cacheMeta: getCacheMeta(),
  };
}

/**
 * Checks if the cache is valid (exists and has data)
 */
export function isCacheValid(): boolean {
  const meta = getCacheMeta();
  const profile = getCachedProfile();

  // Cache is valid if we have at least a profile and a lastUpdated timestamp
  return !!meta?.lastUpdated && !!profile;
}

/**
 * Gets a subset of activity data, limited to a specific count
 */
export function getLimitedActivity(limit: number = 10) {
  const activity = getCachedActivity();
  return activity.slice(0, limit);
}

/**
 * Gets a subset of blog posts, limited to a specific count
 */
export function getLimitedBlogPosts(limit: number = 10) {
  const posts = getCachedBlogPosts();
  return posts.slice(0, limit);
}
