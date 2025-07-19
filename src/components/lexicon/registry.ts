/**
 * Lexicon Component Registry
 *
 * This module acts as a central mapping between AT Protocol lexicon strings
 * (like 'app.bsky.feed.post') and the React components responsible for
 * rendering them. This allows for a scalable and maintainable way to add
 * support for new, custom lexicons without changing the core feed logic.
 */

import type { ComponentType } from "react";
import type { ATProtoRecord } from "../../lib/atproto";

// Import the lexicon-specific components
import BlogEntryCard from "./BlogEntryCard";
import PostCard from "./PostCard";

// Define a common interface for the props that all lexicon components will receive.
// This ensures consistency and type safety.
export interface LexiconComponentProps {
  record: ATProtoRecord;
  className?: string;
}

// The registry object itself.
// It uses a Record type for strong typing, ensuring that every key is a string
// and every value is a React component that accepts `LexiconComponentProps`.
export const LexiconComponentRegistry: Record<
  string,
  ComponentType<LexiconComponentProps>
> = {
  "com.whtwnd.blog.entry": BlogEntryCard,
  "app.bsky.feed.post": PostCard,
  // To support a new lexicon type, simply create a new component,
  // import it here, and add a new entry to this object.
  // For example:
  // 'org.example.custom.record': CustomRecordComponent,
};
