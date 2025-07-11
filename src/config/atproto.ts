export interface ATProtoConfig {
  service: string;
  identifier: string;
  password?: string;
  handle?: string;
}

// Default configuration - update these values with your actual AT Protocol credentials
export const DEFAULT_CONFIG: ATProtoConfig = {
  service: 'https://bsky.social',
  identifier: 'tynanpurdy.com', // Replace with your actual handle
  password: 'qqpp-qmvj-gttr-ak7a', // Uncomment and add your app password for authenticated requests
  handle: 'tynanpurdy.com', // Replace with your actual handle
};

// Environment-based configuration
export const getATProtoConfig = (): ATProtoConfig => {
  return {
    service: process.env.ATPROTO_SERVICE || DEFAULT_CONFIG.service,
    identifier: process.env.ATPROTO_IDENTIFIER || DEFAULT_CONFIG.identifier,
    password: process.env.ATPROTO_PASSWORD || DEFAULT_CONFIG.password,
    handle: process.env.ATPROTO_HANDLE || DEFAULT_CONFIG.handle,
  };
};

// Common AT Protocol collections
export const ATPROTO_COLLECTIONS = {
  // WhiteWind blog posts
  WHITEWIND_BLOG: 'com.whtwnd.blog.entry',

  // Bluesky collections
  BLUESKY_POST: 'app.bsky.feed.post',
  BLUESKY_LIKE: 'app.bsky.feed.like',
  BLUESKY_REPOST: 'app.bsky.feed.repost',
  BLUESKY_FOLLOW: 'app.bsky.graph.follow',
  BLUESKY_PROFILE: 'app.bsky.actor.profile',

  // Other potential collections
  CUSTOM_COLLECTION: 'com.example.custom.record',
} as const;

// Configuration for different types of content display
export const DISPLAY_CONFIG = {
  // How many items to show by default
  DEFAULT_ITEMS: {
    BLOG_POSTS: 10,
    ACTIVITY_FEED: 20,
    RECENT_POSTS: 5,
  },

  // Refresh intervals (in milliseconds)
  REFRESH_INTERVALS: {
    BLOG_POSTS: 5 * 60 * 1000, // 5 minutes
    ACTIVITY_FEED: 2 * 60 * 1000, // 2 minutes
    PROFILE: 10 * 60 * 1000, // 10 minutes
  },

  // Content limits
  CONTENT_LIMITS: {
    BLOG_POST_PREVIEW: 200, // characters
    ACTIVITY_PREVIEW: 150, // characters
    MAX_TAGS_DISPLAY: 5,
  },
} as const;

// Utility function to validate configuration
export const validateATProtoConfig = (config: ATProtoConfig): boolean => {
  if (!config.service || !config.identifier) {
    console.error('AT Protocol configuration is missing required fields');
    return false;
  }

  try {
    new URL(config.service);
  } catch {
    console.error('Invalid AT Protocol service URL');
    return false;
  }

  return true;
};

// Helper function to get collection display name
export const getCollectionDisplayName = (collection: string): string => {
  const displayNames: Record<string, string> = {
    'com.whtwnd.blog.entry': 'Blog Post',
    'app.bsky.feed.post': 'Post',
    'app.bsky.feed.like': 'Like',
    'app.bsky.feed.repost': 'Repost',
    'app.bsky.graph.follow': 'Follow',
    'app.bsky.actor.profile': 'Profile Update',
  };

  return displayNames[collection] || 'Unknown Activity';
};
