import type { GeneratedLexiconUnion, GeneratedLexiconTypeMap } from '../generated/lexicon-types';

// Type-safe component registry
export interface ComponentRegistryEntry<T = any> {
  component: string;
  props?: T;
}

export type ComponentRegistry = {
  [K in keyof GeneratedLexiconTypeMap]?: ComponentRegistryEntry;
} & {
  [key: string]: ComponentRegistryEntry; // Fallback for unknown types
};

// Default registry - add your components here
export const registry: ComponentRegistry = {
  'ComWhtwndBlogEntry': {
    component: 'WhitewindBlogPost',
    props: {}
  },
  'AStatusUpdate': {
    component: 'StatusUpdate',
    props: {}
  },
  // Bluesky posts (not in generated types, but used by components)
  'app.bsky.feed.post': {
    component: 'BlueskyPost',
    props: {}
  },

};

// Type-safe component lookup
export function getComponentInfo<T extends keyof GeneratedLexiconTypeMap>(
  $type: T
): ComponentRegistryEntry | null {
  return registry[$type] || null;
}

// Helper to register a new component
export function registerComponent<T extends keyof GeneratedLexiconTypeMap>(
  $type: T,
  component: string,
  props?: any
): void {
  registry[$type] = { component, props };
}

// Auto-assignment for unknown types (fallback)
export function autoAssignComponent($type: string): ComponentRegistryEntry {
  // Convert NSID to component name
  const parts = $type.split('.');
  const componentName = parts[parts.length - 1]
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  
  return {
    component: componentName,
    props: {}
  };
} 