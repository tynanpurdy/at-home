import type { ATProtoRecord } from './atproto';
import type { LexiconRenderer } from './lexicons';

// Template for creating new lexicon renderers
// Copy this template and customize for your new lexicon

const newLexiconTemplate: LexiconRenderer = {
  // Basic metadata
  name: 'Your Lexicon Name',
  collection: 'com.example.your.lexicon', // The AT Protocol collection identifier
  icon: '🔗', // Emoji or icon to represent this record type
  color: 'blue', // Color theme: blue, red, green, purple, orange, gray, etc.

  // Content extraction functions
  getTitle: (record: ATProtoRecord) => {
    // Extract the title/heading from the record
    // Return the lexicon name if no specific title
    return record.value.title || record.value.name || 'Your Lexicon Name';
  },

  getContent: (record: ATProtoRecord) => {
    // Extract the main content/text from the record
    // This is what gets displayed in the record body
    return record.value.content || record.value.text || record.value.description || 'No content available';
  },

  getAuthor: (record: ATProtoRecord) => {
    // Extract author information
    // Usually this comes from the record.author field
    return {
      name: record.author.displayName || record.author.handle,
      handle: record.author.handle,
      avatar: record.author.avatar
    };
  },

  getTags: (record: ATProtoRecord) => {
    // Extract tags/categories from the record
    // Return empty array if no tags
    return record.value.tags || record.value.categories || [];
  },

  getTimestamp: (record: ATProtoRecord) => {
    // Extract the timestamp for the record
    // Usually indexedAt or createdAt
    return record.indexedAt || record.value.createdAt;
  },

  getLink: (record: ATProtoRecord) => {
    // Generate the external link for this record
    // This could be to the original platform, a viewer, etc.
    const rkey = record.uri.split('/').pop();

    // Examples:
    // For blog posts: return `https://yourblog.com/${record.author.handle}/${rkey}`;
    // For social posts: return `https://yourplatform.com/post/${rkey}`;
    // For profiles: return `https://yourplatform.com/profile/${record.author.handle}`;

    return `https://example.com/${record.author.handle}/${rkey}`;
  },

  getLinkText: (record: ATProtoRecord) => {
    // Text to display for the external link
    // Should be descriptive and action-oriented
    return 'View on Example Platform →';
  },

  // Optional: Additional description or context
  getDescription: (record: ATProtoRecord) => {
    // Return additional context or description
    // This appears as a subtitle/byline
    // Leave empty string if not needed
    return '';
  },

  // Optional: Extract metadata for full view
  getMetadata: (record: ATProtoRecord) => {
    // Return additional metadata as key-value pairs
    // This shows up in the full view under "Metadata"
    return {
      // Example metadata fields:
      // visibility: record.value.visibility || 'public',
      // category: record.value.category,
      // status: record.value.status,
      // Custom fields from your lexicon
    };
  },

  // Validation function
  canRender: (record: ATProtoRecord) => {
    // Return true if this lexicon can render the given record
    // Usually check if the URI contains your collection identifier
    return record.uri.includes('com.example.your.lexicon');
  },

  // Display preferences
  showInActivity: true, // Should this appear in activity feeds?
  showInBlog: false,    // Should this appear in blog sections?

  // Supported view modes
  supportedViews: ['compact', 'expanded', 'full'], // Which views this lexicon supports

  // Notes:
  // - 'compact': Small list item (icon, type, timestamp, short content)
  // - 'expanded': Card view with full content, author, tags, link
  // - 'full': Full page view with all metadata and formatted content
  //
  // Remove views that don't make sense for your lexicon
  // For example, a "like" might only support compact and expanded
};

// Example of registering the new lexicon:
// import { registerLexicon } from './lexicons';
// registerLexicon(newLexiconTemplate);

export default newLexiconTemplate;

// Common patterns for different types of records:

// 1. SOCIAL MEDIA POST
// getTitle: () => 'Post'
// getContent: (record) => record.value.text
// getLink: (record) => `https://platform.com/post/${record.uri.split('/').pop()}`
// getLinkText: () => 'View Post →'

// 2. BLOG POST
// getTitle: (record) => record.value.title || 'Untitled Post'
// getContent: (record) => record.value.content || record.value.summary
// getLink: (record) => `https://blog.com/${record.author.handle}/${record.uri.split('/').pop()}`
// getLinkText: () => 'Read Full Post →'

// 3. SOCIAL INTERACTION (like, repost, etc.)
// getTitle: () => 'Like' / 'Repost' / etc.
// getContent: (record) => record.resolvedSubject?.text || 'Interacted with a post'
// getDescription: (record) => `❤️ Liked a post by ${record.resolvedSubject?.author?.handle}`
// getLink: (record) => link to original post
// getLinkText: () => 'View Original Post →'

// 4. PROFILE UPDATE
// getTitle: () => 'Profile Update'
// getContent: (record) => `Updated profile: ${record.value.displayName}`
// getLink: (record) => `https://platform.com/profile/${record.author.handle}`
// getLinkText: () => 'View Profile →'

// 5. MEDIA POST
// getTitle: (record) => record.value.title || 'Media Post'
// getContent: (record) => record.value.description || 'Shared media'
// getMetadata: (record) => ({ mediaType: record.value.mediaType, size: record.value.size })
// getLink: (record) => record.value.mediaUrl || profile link
// getLinkText: () => 'View Media →'
