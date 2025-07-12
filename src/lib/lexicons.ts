import type { ATProtoRecord, WhiteWindPost } from "./atproto";

export interface LexiconRenderer {
  // Metadata
  name: string;
  collection: string;
  icon: string;
  color: string;

  // Content extraction
  getTitle: (record: ATProtoRecord) => string;
  getContent: (record: ATProtoRecord) => string;
  getAuthor: (record: ATProtoRecord) => {
    name: string;
    handle: string;
    avatar?: string;
  };
  getTags: (record: ATProtoRecord) => string[];
  getTimestamp: (record: ATProtoRecord) => string;
  getLink: (record: ATProtoRecord) => string;
  getLinkText: (record: ATProtoRecord) => string;

  // Rendering helpers
  getDescription: (record: ATProtoRecord) => string;
  getMetadata: (record: ATProtoRecord) => Record<string, any>;

  // Validation
  canRender: (record: ATProtoRecord) => boolean;

  // Display preferences
  showInActivity: boolean;
  showInBlog: boolean;
  supportedViews: ("compact" | "expanded" | "full")[];
}

// Registry of all supported lexicons
const lexiconRegistry = new Map<string, LexiconRenderer>();

// Helper function to truncate text
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Helper function to extract handle from DID
const extractHandleFromDid = (did: string): string => {
  if (did.startsWith("did:")) {
    return did.split(":")[2]?.substring(0, 8) + "..." || "unknown";
  }
  return did;
};

// Bluesky Post Lexicon
const bskyPostLexicon: LexiconRenderer = {
  name: "Post",
  collection: "app.bsky.feed.post",
  icon: "📝",
  color: "blue",

  getTitle: (record) => "Post",
  getContent: (record) => record.value.text || "No content",
  getAuthor: (record) => ({
    name: record.author.displayName || record.author.handle,
    handle: record.author.handle,
    avatar: record.author.avatar,
  }),
  getTags: (record) => record.value.tags || [],
  getTimestamp: (record) => record.indexedAt || record.value.createdAt,
  getLink: (record) =>
    `https://bsky.app/profile/${record.author.handle}/post/${record.uri.split("/").pop()}`,
  getLinkText: () => "View Post on Bluesky →",

  getDescription: () => "",
  getMetadata: (record) => ({
    replyCount: record.value.replyCount || 0,
    repostCount: record.value.repostCount || 0,
    likeCount: record.value.likeCount || 0,
  }),

  canRender: (record) => record.uri.includes("app.bsky.feed.post"),
  showInActivity: true,
  showInBlog: false,
  supportedViews: ["compact", "expanded", "full"],
};

// Bluesky Like Lexicon
const bskyLikeLexicon: LexiconRenderer = {
  name: "Like",
  collection: "app.bsky.feed.like",
  icon: "❤️",
  color: "red",

  getTitle: () => "Like",
  getContent: (record) => {
    if (record.resolvedSubject?.text) {
      return record.resolvedSubject.text;
    }
    return "Liked a post";
  },
  getAuthor: (record) => ({
    name: record.author.displayName || record.author.handle,
    handle: record.author.handle,
    avatar: record.author.avatar,
  }),
  getTags: () => [],
  getTimestamp: (record) => record.indexedAt || record.value.createdAt,
  getLink: (record) => {
    if (record.resolvedSubject?.uri) {
      const parts = record.resolvedSubject.uri.split("/");
      if (parts.length >= 5) {
        const repo = parts[2];
        const rkey = parts[4];
        return `https://bsky.app/profile/${repo}/post/${rkey}`;
      }
    }
    return `https://bsky.app/profile/${record.author.handle}`;
  },
  getLinkText: (record) =>
    record.resolvedSubject?.uri
      ? "View Original Post on Bluesky →"
      : "View Profile on Bluesky →",

  getDescription: (record) => {
    if (record.resolvedSubject?.author) {
      return `❤️ Liked a post by ${record.resolvedSubject.author.displayName || record.resolvedSubject.author.handle}`;
    }
    return "❤️ Liked a post";
  },
  getMetadata: (record) => ({
    subjectUri: record.value.subject || null,
    subjectAuthor: record.resolvedSubject?.author?.handle || null,
  }),

  canRender: (record) => record.uri.includes("app.bsky.feed.like"),
  showInActivity: true,
  showInBlog: false,
  supportedViews: ["compact", "expanded"],
};

// Bluesky Repost Lexicon
const bskyRepostLexicon: LexiconRenderer = {
  name: "Repost",
  collection: "app.bsky.feed.repost",
  icon: "🔄",
  color: "green",

  getTitle: () => "Repost",
  getContent: (record) => {
    if (record.resolvedSubject?.text) {
      return record.resolvedSubject.text;
    }
    return "Reposted a post";
  },
  getAuthor: (record) => ({
    name: record.author.displayName || record.author.handle,
    handle: record.author.handle,
    avatar: record.author.avatar,
  }),
  getTags: () => [],
  getTimestamp: (record) => record.indexedAt || record.value.createdAt,
  getLink: (record) => {
    if (record.resolvedSubject?.uri) {
      const parts = record.resolvedSubject.uri.split("/");
      if (parts.length >= 5) {
        const repo = parts[2];
        const rkey = parts[4];
        return `https://bsky.app/profile/${repo}/post/${rkey}`;
      }
    }
    return `https://bsky.app/profile/${record.author.handle}`;
  },
  getLinkText: (record) =>
    record.resolvedSubject?.uri
      ? "View Original Post on Bluesky →"
      : "View Profile on Bluesky →",

  getDescription: (record) => {
    if (record.resolvedSubject?.author) {
      return `🔄 Reposted a post by ${record.resolvedSubject.author.displayName || record.resolvedSubject.author.handle}`;
    }
    return "🔄 Reposted a post";
  },
  getMetadata: (record) => ({
    subjectUri: record.value.subject || null,
    subjectAuthor: record.resolvedSubject?.author?.handle || null,
  }),

  canRender: (record) => record.uri.includes("app.bsky.feed.repost"),
  showInActivity: true,
  showInBlog: false,
  supportedViews: ["compact", "expanded"],
};

// Bluesky Follow Lexicon
const bskyFollowLexicon: LexiconRenderer = {
  name: "Follow",
  collection: "app.bsky.graph.follow",
  icon: "👥",
  color: "purple",

  getTitle: () => "Follow",
  getContent: (record) => {
    if (record.value.subject) {
      const did = record.value.subject;
      if (typeof did === "string") {
        return `Followed user (${extractHandleFromDid(did)})`;
      }
    }
    return "Followed someone";
  },
  getAuthor: (record) => ({
    name: record.author.displayName || record.author.handle,
    handle: record.author.handle,
    avatar: record.author.avatar,
  }),
  getTags: () => [],
  getTimestamp: (record) => record.indexedAt || record.value.createdAt,
  getLink: (record) => `https://bsky.app/profile/${record.author.handle}`,
  getLinkText: () => "View Profile on Bluesky →",

  getDescription: () => "",
  getMetadata: (record) => ({
    followedDid: record.value.subject || null,
  }),

  canRender: (record) => record.uri.includes("app.bsky.graph.follow"),
  showInActivity: true,
  showInBlog: false,
  supportedViews: ["compact", "expanded"],
};

// WhiteWind Blog Post Lexicon
const whitewindBlogLexicon: LexiconRenderer = {
  name: "Blog Post",
  collection: "com.whtwnd.blog.entry",
  icon: "📰",
  color: "orange",

  getTitle: (record) => record.value.title || "Untitled Post",
  getContent: (record) =>
    record.value.content || record.value.text || "No content",
  getAuthor: (record) => ({
    name: record.author.displayName || record.author.handle,
    handle: record.author.handle,
    avatar: record.author.avatar,
  }),
  getTags: (record) => record.value.tags || [],
  getTimestamp: (record) => record.indexedAt || record.value.createdAt,
  getLink: (record) =>
    `https://whtwnd.com/${record.author.handle}/${record.uri.split("/").pop()}`,
  getLinkText: () => "Read on WhiteWind →",

  getDescription: () => "",
  getMetadata: (record) => ({
    visibility: record.value.visibility || "public",
    wordCount: record.value.content?.length || 0,
  }),

  canRender: (record) => record.uri.includes("com.whtwnd.blog.entry"),
  showInActivity: true,
  showInBlog: true,
  supportedViews: ["compact", "expanded", "full"],
};

// Profile Update Lexicon
const bskyProfileLexicon: LexiconRenderer = {
  name: "Profile Update",
  collection: "app.bsky.actor.profile",
  icon: "👤",
  color: "gray",

  getTitle: () => "Profile Update",
  getContent: (record) => {
    if (record.value.displayName) {
      return `Updated profile: ${record.value.displayName}`;
    }
    return "Updated profile";
  },
  getAuthor: (record) => ({
    name: record.author.displayName || record.author.handle,
    handle: record.author.handle,
    avatar: record.author.avatar,
  }),
  getTags: () => [],
  getTimestamp: (record) => record.indexedAt || record.value.createdAt,
  getLink: (record) => `https://bsky.app/profile/${record.author.handle}`,
  getLinkText: () => "View Profile on Bluesky →",

  getDescription: () => "",
  getMetadata: (record) => ({
    displayName: record.value.displayName || null,
    description: record.value.description || null,
  }),

  canRender: (record) => record.uri.includes("app.bsky.actor.profile"),
  showInActivity: false, // Usually filtered out due to timestamp issues
  showInBlog: false,
  supportedViews: ["compact", "expanded"],
};

// Register all lexicons
lexiconRegistry.set(bskyPostLexicon.collection, bskyPostLexicon);
lexiconRegistry.set(bskyLikeLexicon.collection, bskyLikeLexicon);
lexiconRegistry.set(bskyRepostLexicon.collection, bskyRepostLexicon);
lexiconRegistry.set(bskyFollowLexicon.collection, bskyFollowLexicon);
lexiconRegistry.set(whitewindBlogLexicon.collection, whitewindBlogLexicon);
lexiconRegistry.set(bskyProfileLexicon.collection, bskyProfileLexicon);

// Registry management functions
export const registerLexicon = (lexicon: LexiconRenderer): void => {
  lexiconRegistry.set(lexicon.collection, lexicon);
};

export const getLexicon = (collection: string): LexiconRenderer | undefined => {
  return lexiconRegistry.get(collection);
};

export const getLexiconForRecord = (
  record: ATProtoRecord,
): LexiconRenderer | undefined => {
  for (const lexicon of lexiconRegistry.values()) {
    if (lexicon.canRender(record)) {
      return lexicon;
    }
  }
  return undefined;
};

export const getAllLexicons = (): LexiconRenderer[] => {
  return Array.from(lexiconRegistry.values());
};

export const getLexiconsByView = (
  view: "compact" | "expanded" | "full",
): LexiconRenderer[] => {
  return Array.from(lexiconRegistry.values()).filter((lexicon) =>
    lexicon.supportedViews.includes(view),
  );
};

export const getActivityLexicons = (): LexiconRenderer[] => {
  return Array.from(lexiconRegistry.values()).filter(
    (lexicon) => lexicon.showInActivity,
  );
};

export const getBlogLexicons = (): LexiconRenderer[] => {
  return Array.from(lexiconRegistry.values()).filter(
    (lexicon) => lexicon.showInBlog,
  );
};

// Utility functions for rendering
export const getRecordIcon = (record: ATProtoRecord): string => {
  const lexicon = getLexiconForRecord(record);
  return lexicon?.icon || "📋";
};

export const getRecordType = (record: ATProtoRecord): string => {
  const lexicon = getLexiconForRecord(record);
  return lexicon?.name || "Unknown Activity";
};

export const getRecordContent = (
  record: ATProtoRecord,
  maxLength?: number,
): string => {
  const lexicon = getLexiconForRecord(record);
  if (!lexicon) return "No content available";

  const content = lexicon.getContent(record);
  return maxLength ? truncateText(content, maxLength) : content;
};

export const getRecordLink = (record: ATProtoRecord): string => {
  const lexicon = getLexiconForRecord(record);
  return (
    lexicon?.getLink(record) ||
    `https://bsky.app/profile/${record.author.handle}`
  );
};

export const getRecordLinkText = (record: ATProtoRecord): string => {
  const lexicon = getLexiconForRecord(record);
  return lexicon?.getLinkText(record) || "View Profile →";
};

export const getRecordDescription = (record: ATProtoRecord): string => {
  const lexicon = getLexiconForRecord(record);
  return lexicon?.getDescription(record) || "";
};

export const getRecordInternalLink = (record: ATProtoRecord): string | null => {
  const lexicon = getLexiconForRecord(record);
  if (!lexicon || !lexicon.supportedViews.includes("full")) {
    return null;
  }

  const rkey = record.uri.split("/").pop();
  return `/record/${rkey}`;
};

export const canViewRecordInternally = (record: ATProtoRecord): boolean => {
  const lexicon = getLexiconForRecord(record);
  return lexicon ? lexicon.supportedViews.includes("full") : false;
};

// Helper function to convert WhiteWindPost to ATProtoRecord format for consistency
export const whiteWindPostToRecord = (post: any): ATProtoRecord => {
  return {
    uri: post.uri,
    cid: post.cid,
    value: post.record,
    author: post.author,
    indexedAt: post.indexedAt,
  };
};

// Export the registry for advanced usage
export { lexiconRegistry };
