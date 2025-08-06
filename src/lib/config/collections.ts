// Configuration for known ATproto collections
export interface CollectionConfig {
  name: string;
  description: string;
  service: string;
  priority: number; // Higher priority = test first
  enabled: boolean;
}

// Known collections configuration
export const KNOWN_COLLECTIONS: CollectionConfig[] = [
  // Standard Bluesky collections (high priority)
  {
    name: 'app.bsky.feed.post',
    description: 'Standard Bluesky posts',
    service: 'bsky.app',
    priority: 100,
    enabled: true
  },
  {
    name: 'app.bsky.actor.profile',
    description: 'Bluesky profile information',
    service: 'bsky.app',
    priority: 90,
    enabled: true
  },
  {
    name: 'app.bsky.feed.generator',
    description: 'Bluesky custom feeds',
    service: 'bsky.app',
    priority: 80,
    enabled: true
  },
  {
    name: 'app.bsky.graph.follow',
    description: 'Bluesky follow relationships',
    service: 'bsky.app',
    priority: 70,
    enabled: true
  },
  {
    name: 'app.bsky.graph.block',
    description: 'Bluesky block relationships',
    service: 'bsky.app',
    priority: 60,
    enabled: true
  },
  {
    name: 'app.bsky.feed.like',
    description: 'Bluesky like records',
    service: 'bsky.app',
    priority: 50,
    enabled: true
  },
  {
    name: 'app.bsky.feed.repost',
    description: 'Bluesky repost records',
    service: 'bsky.app',
    priority: 40,
    enabled: true
  },

  // Grain.social collections (high priority for your use case)
  {
    name: 'social.grain.gallery',
    description: 'Grain.social image galleries',
    service: 'grain.social',
    priority: 95,
    enabled: true
  },
  {
    name: 'grain.social.feed.gallery',
    description: 'Grain.social image galleries (legacy)',
    service: 'grain.social',
    priority: 85,
    enabled: true
  },
  {
    name: 'grain.social.feed.post',
    description: 'Grain.social posts',
    service: 'grain.social',
    priority: 85,
    enabled: true
  },
  {
    name: 'grain.social.actor.profile',
    description: 'Grain.social profile information',
    service: 'grain.social',
    priority: 75,
    enabled: true
  },
  {
    name: 'grain.social.feed.image',
    description: 'Grain.social image posts',
    service: 'grain.social',
    priority: 65,
    enabled: true
  },
  {
    name: 'grain.social.feed.media',
    description: 'Grain.social media posts',
    service: 'grain.social',
    priority: 55,
    enabled: true
  },

  // Sh.tangled collections
  {
    name: 'sh.tangled.feed.star',
    description: 'Sh.tangled star records',
    service: 'sh.tangled',
    priority: 45,
    enabled: true
  },
  {
    name: 'sh.tangled.feed.post',
    description: 'Sh.tangled posts',
    service: 'sh.tangled',
    priority: 35,
    enabled: true
  },
  {
    name: 'sh.tangled.actor.profile',
    description: 'Sh.tangled profile information',
    service: 'sh.tangled',
    priority: 25,
    enabled: true
  },

  // Generic collections that might contain custom content
  {
    name: 'app.bsky.feed.custom',
    description: 'Custom Bluesky feed content',
    service: 'bsky.app',
    priority: 30,
    enabled: true
  },
  {
    name: 'app.bsky.actor.custom',
    description: 'Custom Bluesky actor content',
    service: 'bsky.app',
    priority: 20,
    enabled: true
  },
  {
    name: 'app.bsky.feed.media',
    description: 'Bluesky media content',
    service: 'bsky.app',
    priority: 15,
    enabled: true
  },
  {
    name: 'app.bsky.feed.image',
    description: 'Bluesky image content',
    service: 'bsky.app',
    priority: 10,
    enabled: true
  },
  {
    name: 'app.bsky.feed.gallery',
    description: 'Bluesky gallery content',
    service: 'bsky.app',
    priority: 5,
    enabled: true
  }
];

// Collection management utilities
export class CollectionManager {
  private collections: CollectionConfig[];

  constructor(customCollections: CollectionConfig[] = []) {
    this.collections = [...KNOWN_COLLECTIONS, ...customCollections];
  }

  // Get all enabled collections sorted by priority
  getEnabledCollections(): CollectionConfig[] {
    return this.collections
      .filter(c => c.enabled)
      .sort((a, b) => b.priority - a.priority);
  }

  // Get collections by service
  getCollectionsByService(service: string): CollectionConfig[] {
    return this.collections.filter(c => c.service === service && c.enabled);
  }

  // Get collection names for API calls
  getCollectionNames(): string[] {
    return this.getEnabledCollections().map(c => c.name);
  }

  // Add a new collection
  addCollection(collection: CollectionConfig): void {
    this.collections.push(collection);
  }

  // Enable/disable collections by service
  setServiceEnabled(service: string, enabled: boolean): void {
    this.collections.forEach(c => {
      if (c.service === service) {
        c.enabled = enabled;
      }
    });
  }

  // Get collection info by name
  getCollectionInfo(name: string): CollectionConfig | undefined {
    return this.collections.find(c => c.name === name);
  }

  // Get all services
  getServices(): string[] {
    return [...new Set(this.collections.map(c => c.service))];
  }
}

// Default collection manager instance
export const collectionManager = new CollectionManager(); 