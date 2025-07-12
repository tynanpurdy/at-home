import type { ATProtoRecord, WhiteWindPost } from "./atproto";

// Base properties for any lexicon we handle, conforming to ATProto specs
export interface BaseLexicon {
  id: string; // The NSID of the lexicon, e.g., "app.bsky.feed.post"
  type: "record" | "query" | "procedure";
  description: string; // A short description of the lexicon
}

// Extends the base lexicon for record types, adding our UI rendering helpers
export interface LexiconRenderer extends BaseLexicon {
  type: "record";

  // UI Presentation
  name: string; // User-friendly name, e.g., "Post"
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
  id: "app.bsky.feed.post",
  type: "record",
  description: "A standard post on the Bluesky social network.",
  name: "Post",
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
  id: "app.bsky.feed.like",
  type: "record",
  description: "A user's 'like' of another record.",
  name: "Like",
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
  id: "app.bsky.feed.repost",
  type: "record",
  description: "A user's 'repost' of another record.",
  name: "Repost",
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
  id: "app.bsky.graph.follow",
  type: "record",
  description: "A record of a user following another user.",
  name: "Follow",
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
  id: "com.whtwnd.blog.entry",
  type: "record",
  description: "A long-form blog post using the WhiteWind lexicon.",
  name: "Blog Post",
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
  id: "app.bsky.actor.profile",
  type: "record",
  description: "A user's profile information.",
  name: "Profile Update",
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
lexiconRegistry.set(bskyPostLexicon.id, bskyPostLexicon);
lexiconRegistry.set(bskyLikeLexicon.id, bskyLikeLexicon);
lexiconRegistry.set(bskyRepostLexicon.id, bskyRepostLexicon);
lexiconRegistry.set(bskyFollowLexicon.id, bskyFollowLexicon);
lexiconRegistry.set(whitewindBlogLexicon.id, whitewindBlogLexicon);
lexiconRegistry.set(bskyProfileLexicon.id, bskyProfileLexicon);

// Registry management functions
export const registerLexicon = (lexicon: LexiconRenderer): void => {
  lexiconRegistry.set(lexicon.id, lexicon);
};

export const getLexicon = (id: string): LexiconRenderer | undefined => {
  return lexiconRegistry.get(id);
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

export const getRecordInternalLink = (
  record: ATProtoRecord,
): string | undefined => {
  const lexicon = getLexiconForRecord(record);
  if (!lexicon || !lexicon.supportedViews.includes("full")) {
    return undefined;
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
