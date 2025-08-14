// Generated from lexicon schema: com.whtwnd.blog.entry
// Do not edit manually - regenerate with: npm run gen:types

export interface ComWhtwndBlogEntryRecord {
  content: string;
  createdAt?: string;
  title?: string;
  subtitle?: string;
  ogp?: any;
  theme?: 'github-light';
  blobs?: any[];
  isDraft?: boolean;
  visibility?: 'public' | 'url' | 'author';
}

export interface ComWhtwndBlogEntry {
  $type: 'com.whtwnd.blog.entry';
  value: ComWhtwndBlogEntryRecord;
}

// Helper type for discriminated unions
export type ComWhtwndBlogEntryUnion = ComWhtwndBlogEntry;
