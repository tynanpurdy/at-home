/**
 * AT Protocol Data Fetching Script
 *
 * This script fetches data from the AT Protocol and caches it in JSON files
 * to be used by the website, reducing API calls and preventing rate limiting.
 */

// For Node.js environment only - these imports are not used in the browser
let fs;
let path;
let fileURLToPath;

// Dynamic imports for Node.js modules to avoid issues with browser bundling
async function importNodeModules() {
  if (
    typeof process !== "undefined" &&
    process.versions &&
    process.versions.node
  ) {
    fs = (await import("fs/promises")).default;
    path = (await import("path")).default;
    fileURLToPath = (await import("url")).fileURLToPath;
    return true;
  }
  return false;
}

import { createATProtoClient } from "../lib/atproto.ts";
import { getATProtoConfig } from "../config/atproto.ts";

// These paths will be set when running in Node.js environment
let CACHE_DIR;
let PROFILE_CACHE;
let ACTIVITY_CACHE;
let BLOG_POSTS_CACHE;
let REPOSITORY_STATS_CACHE;
let COLLECTIONS_CACHE;
let CACHE_META;

// Initialize cache paths
async function initializeCachePaths() {
  if (await importNodeModules()) {
    CACHE_DIR = path.join(process.cwd(), "src", "data", "cache");
    PROFILE_CACHE = path.join(CACHE_DIR, "profile.json");
    ACTIVITY_CACHE = path.join(CACHE_DIR, "activity.json");
    BLOG_POSTS_CACHE = path.join(CACHE_DIR, "blog-posts.json");
    REPOSITORY_STATS_CACHE = path.join(CACHE_DIR, "repository-stats.json");
    COLLECTIONS_CACHE = path.join(CACHE_DIR, "collections.json");
    CACHE_META = path.join(CACHE_DIR, "meta.json");
    return true;
  }
  return false;
}

/**
 * Ensures the cache directory exists
 */
async function ensureCacheDir() {
  if (!fs) return false;

  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    console.log(`✅ Cache directory ensured: ${CACHE_DIR}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to create cache directory:", error);
    throw error;
  }
}

/**
 * Saves data to a JSON file
 */
async function saveCache(filePath, data) {
  if (!fs) return false;

  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Data cached to: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to save cache to ${filePath}:`, error);
    throw error;
  }
}

/**
 * Fetches all data from AT Protocol and caches it
 */
async function fetchAndCacheAllData() {
  console.log("🔄 Starting AT Protocol data fetch...");

  try {
    // Initialize cache paths if running in Node.js
    const isNode = await initializeCachePaths();

    // Prepare metadata variable to be returned at the end
    let metaData = {
      lastUpdated: new Date().toISOString(),
      dataCount: {},
    };

    // Only try to ensure cache directory in Node.js environment
    if (isNode) {
      await ensureCacheDir();
    }

    // Get AT Protocol configuration
    const config = getATProtoConfig();
    console.log(`⚙️ Using AT Protocol service: ${config.service}`);

    // Initialize AT Protocol client
    const atClient = createATProtoClient(config);
    console.log("✅ AT Protocol client initialized");

    // Fetch all data in a single call to minimize API requests
    console.log("🔍 Fetching data from AT Protocol...");
    const { profile, recentActivity, blogPosts, repositoryStats, collections } =
      await atClient.getActivityData({
        includeBlogPosts: true,
        includeRepositoryStats: true,
        activityLimit: 50, // Increased limit to cache more data
        blogPostLimit: 50, // Increased limit to cache more data
        collectionsLimit: 10,
      });

    // Save each data type to its own cache file if in Node.js environment
    if (fs && path) {
      await saveCache(PROFILE_CACHE, profile);
      await saveCache(ACTIVITY_CACHE, recentActivity);
      await saveCache(BLOG_POSTS_CACHE, blogPosts);
      await saveCache(REPOSITORY_STATS_CACHE, repositoryStats);
      await saveCache(COLLECTIONS_CACHE, collections);

      // Save metadata about the cache
      const metaData = {
        lastUpdated: new Date().toISOString(),
        dataCount: {
          activities: recentActivity.length,
          blogPosts: blogPosts.length,
          collections: collections.length,
        },
      };
      await saveCache(CACHE_META, metaData);

      console.log("✨ All AT Protocol data fetched and cached successfully!");
      console.log(
        `📊 Cached ${recentActivity.length} activities, ${blogPosts.length} blog posts, and ${collections.length} collections`,
      );
      console.log(`⏱️ Cache last updated: ${metaData.lastUpdated}`);
    } else {
      console.log("⚠️ Not running in Node.js environment, skipping file cache");
      // Update metadata counts even if not saving to filesystem
      metaData.dataCount = {
        activities: recentActivity.length,
        blogPosts: blogPosts.length,
        collections: collections.length,
      };
    }

    return { success: true, meta: metaData };
  } catch (error) {
    console.error("❌ Failed to fetch and cache AT Protocol data:", error);

    // If there's an error but we have existing cache, we'll just continue
    console.log("⚠️ Using existing cache if available");

    return {
      success: false,
      error: error.message,
      useExistingCache: true,
    };
  }
}

// Execute the function when this file is run directly
// Execute the script only when run directly in Node.js
if (
  typeof process !== "undefined" &&
  process.versions &&
  process.versions.node
) {
  // Wait for dynamic imports and initialize paths
  initializeCachePaths()
    .then(async () => {
      try {
        // Check if this file is being executed directly
        if (process.argv[1] === fileURLToPath(import.meta.url)) {
          const result = await fetchAndCacheAllData();
          if (result.success) {
            process.exit(0); // Success
          } else {
            // Exit with a non-zero code if we fail and don't have existing cache
            process.exit(result.useExistingCache ? 0 : 1);
          }
        }
      } catch (error) {
        console.error("Unhandled error:", error);
        if (typeof process !== "undefined" && process.exit) {
          process.exit(1);
        }
      }
    })
    .catch((error) => {
      console.debug("Error initializing cache:", error);
    });
}

// Export the function for potential programmatic use
export { fetchAndCacheAllData };
