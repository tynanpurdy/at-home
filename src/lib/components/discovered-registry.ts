import type { DiscoveredTypes } from '../generated/discovered-types';

export interface DiscoveredComponent {
  $type: DiscoveredTypes;
  component: string;
  props: Record<string, any>;
}

export interface ComponentRegistry {
  [key: string]: {
    component: string;
    props?: Record<string, any>;
  };
}

export class DiscoveredComponentRegistry {
  private registry: ComponentRegistry = {};
  private discoveredTypes: DiscoveredTypes[] = [];

  constructor() {
    this.initializeRegistry();
  }

  // Initialize the registry with discovered types
  private initializeRegistry(): void {
    // This will be populated with discovered types
    // For now, we'll use a basic mapping
    this.registry = {
      'app.bsky.feed.post': {
        component: 'BlueskyPost',
        props: { showAuthor: false, showTimestamp: true }
      },
      'app.bsky.actor.profile': {
        component: 'ProfileDisplay',
        props: { showHandle: true }
      },
      'social.grain.gallery': {
        component: 'GrainGalleryDisplay',
        props: { showCollections: true, columns: 3 }
      },
      'grain.social.feed.gallery': {
        component: 'GrainGalleryDisplay',
        props: { showCollections: true, columns: 3 }
      }
    };
  }

  // Register a component for a specific $type
  registerComponent($type: DiscoveredTypes, component: string, props?: Record<string, any>): void {
    this.registry[$type] = {
      component,
      props
    };
  }

  // Get component info for a $type
  getComponent($type: DiscoveredTypes): { component: string; props?: Record<string, any> } | null {
    return this.registry[$type] || null;
  }

  // Get all registered $types
  getRegisteredTypes(): DiscoveredTypes[] {
    return Object.keys(this.registry) as DiscoveredTypes[];
  }

  // Check if a $type has a registered component
  hasComponent($type: DiscoveredTypes): boolean {
    return $type in this.registry;
  }

  // Get component mapping for rendering
  getComponentMapping(): ComponentRegistry {
    return this.registry;
  }

  // Update discovered types (called after build-time discovery)
  updateDiscoveredTypes(types: DiscoveredTypes[]): void {
    this.discoveredTypes = types;
    
    // Auto-register components for discovered types that don't have explicit mappings
    for (const $type of types) {
      if (!this.hasComponent($type)) {
        // Auto-assign based on service/collection
        const component = this.autoAssignComponent($type);
        if (component) {
          this.registerComponent($type, component);
        }
      }
    }
  }

  // Auto-assign component based on $type
  private autoAssignComponent($type: DiscoveredTypes): string | null {
    if ($type.includes('grain') || $type.includes('gallery')) {
      return 'GrainGalleryDisplay';
    }
    if ($type.includes('post') || $type.includes('feed')) {
      return 'BlueskyPost';
    }
    if ($type.includes('profile') || $type.includes('actor')) {
      return 'ProfileDisplay';
    }
    return 'GenericContentDisplay';
  }

  // Get component info for rendering
  getComponentInfo($type: DiscoveredTypes): DiscoveredComponent | null {
    const componentInfo = this.getComponent($type);
    if (!componentInfo) return null;

    return {
      $type,
      component: componentInfo.component,
      props: componentInfo.props || {}
    };
  }
} 