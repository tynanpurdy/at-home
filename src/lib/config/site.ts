import dotenv from 'dotenv';

// Load environment variables from .env file (server-side only)
if (typeof process !== 'undefined') {
  dotenv.config();
}

export interface SiteConfig {
  // ATproto configuration
  atproto: {
    handle: string;
    did?: string; // Keep for backward compatibility
    pdsUrl?: string;
  };
  
  // Site metadata
  site: {
    title: string;
    description: string;
    author: string;
    url: string;
  };
  
  // Theme configuration
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  
  // Content configuration
  content: {
    defaultFeedLimit: number;
    cacheTTL: number; // in milliseconds
    collections: string[];
    maxRecords: number;
  };
  lexiconSources: Record<string, string>; // NSID -> local schema file path
}

// Default configuration with static handle
export const defaultConfig: SiteConfig = {
  atproto: {
    handle: 'tynanpurdy.com', // Static handle - not confidential
    did: 'did:plc:6ayddqghxhciedbaofoxkcbs',
    pdsUrl: 'https://bsky.social',
  },
  site: {
    title: 'Tynanverse',
    description: 'A personal website powered by ATproto, made by Tynan',
    author: 'Tynan',
    url: 'https://your-domain.com',
  },
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  content: {
    defaultFeedLimit: 20,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    collections: ['app.bsky.feed.post', 'com.whtwnd.blog.entry'],
    maxRecords: 500,
  },
  lexiconSources: {
    'com.whtwnd.blog.entry': './src/lexicons/com.whtwnd.blog.entry.json',
    // Add more NSIDs -> schema file mappings here
  },
};

// Load configuration from environment variables (server-side only)
export function loadConfig(): SiteConfig {
  // In browser environment, return default config with static handle
  if (typeof process === 'undefined') {
    return defaultConfig;
  }

  return {
    atproto: {
      handle: process.env.ATPROTO_HANDLE || defaultConfig.atproto.handle,
      did: process.env.ATPROTO_DID || defaultConfig.atproto.did,
      pdsUrl: process.env.ATPROTO_PDS_URL || defaultConfig.atproto.pdsUrl,
    },
    site: {
      title: process.env.SITE_TITLE || defaultConfig.site.title,
      description: process.env.SITE_DESCRIPTION || defaultConfig.site.description,
      author: process.env.SITE_AUTHOR || defaultConfig.site.author,
      url: process.env.SITE_URL || defaultConfig.site.url,
    },
    theme: {
      primaryColor: process.env.THEME_PRIMARY_COLOR || defaultConfig.theme.primaryColor,
      secondaryColor: process.env.THEME_SECONDARY_COLOR || defaultConfig.theme.secondaryColor,
      accentColor: process.env.THEME_ACCENT_COLOR || defaultConfig.theme.accentColor,
      fontFamily: process.env.THEME_FONT_FAMILY || defaultConfig.theme.fontFamily,
    },
    content: {
      defaultFeedLimit: parseInt(process.env.CONTENT_DEFAULT_FEED_LIMIT || '20'),
      cacheTTL: parseInt(process.env.CONTENT_CACHE_TTL || '300000'),
      collections: defaultConfig.content.collections, // Keep default collections
      maxRecords: parseInt(process.env.CONTENT_MAX_RECORDS || '500'),
    },
    lexiconSources: defaultConfig.lexiconSources, // Keep default lexicon sources
  };
} 