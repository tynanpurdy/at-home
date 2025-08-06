import { AtprotoBrowser } from '../atproto/atproto-browser';
import { loadConfig } from '../config/site';
import type { AtprotoRecord } from '../types/atproto';

export interface ContentRendererOptions {
  showAuthor?: boolean;
  showTimestamp?: boolean;
  showType?: boolean;
  limit?: number;
  filter?: (record: AtprotoRecord) => boolean;
}

export interface RenderedContent {
  type: string;
  component: string;
  props: Record<string, any>;
  metadata: {
    uri: string;
    cid: string;
    collection: string;
    $type: string;
    createdAt: string;
  };
}

export class ContentRenderer {
  private browser: AtprotoBrowser;
  private config: any;

  constructor() {
    this.config = loadConfig();
    this.browser = new AtprotoBrowser();
  }

  // Determine the appropriate component for a record type
  private getComponentForType($type: string): string {
    // Map ATProto types to component names
    const componentMap: Record<string, string> = {
      'app.bsky.feed.post': 'BlueskyPost',
      'app.bsky.actor.profile#whitewindBlogPost': 'WhitewindBlogPost',
      'app.bsky.actor.profile#leafletPublication': 'LeafletPublication',
      'app.bsky.actor.profile#grainImageGallery': 'GrainImageGallery',
      'gallery.display': 'GalleryDisplay',
    };

    // Check for gallery-related types
    if ($type.includes('gallery') || $type.includes('grain')) {
      return 'GalleryDisplay';
    }

    return componentMap[$type] || 'BlueskyPost';
  }

  // Process a record into a renderable format
  private processRecord(record: AtprotoRecord): RenderedContent | null {
    const value = record.value;
    if (!value || !value.$type) return null;

    const component = this.getComponentForType(value.$type);

    // Extract common metadata
    const metadata = {
      uri: record.uri,
      cid: record.cid,
      collection: record.collection,
      $type: value.$type,
      createdAt: value.createdAt || record.indexedAt,
    };

    // For gallery display, use the gallery service format
    if (component === 'GalleryDisplay') {
      // This would need to be processed by the gallery service
      // For now, return a basic format
      return {
        type: 'gallery',
        component: 'GalleryDisplay',
        props: {
          gallery: {
            uri: record.uri,
            cid: record.cid,
            title: value.title || 'Untitled Gallery',
            description: value.description,
            text: value.text,
            createdAt: value.createdAt || record.indexedAt,
            images: this.extractImages(value),
            $type: value.$type,
            collection: record.collection,
          },
          showDescription: true,
          showTimestamp: true,
          showType: false,
          columns: 3,
        },
        metadata,
      };
    }

    // For other content types, return the record directly
    return {
      type: 'content',
      component,
      props: {
        post: value,
        showAuthor: false,
        showTimestamp: true,
      },
      metadata,
    };
  }

  // Extract images from various embed formats
  private extractImages(value: any): Array<{ alt?: string; url: string }> {
    const images: Array<{ alt?: string; url: string }> = [];

    // Extract from embed.images
    if (value.embed?.$type === 'app.bsky.embed.images' && value.embed.images) {
      for (const image of value.embed.images) {
        if (image.image?.ref) {
          const did = this.config.atproto.did;
          const url = `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${image.image.ref}`;
          images.push({
            alt: image.alt,
            url,
          });
        }
      }
    }

    // Extract from direct images array
    if (value.images && Array.isArray(value.images)) {
      for (const image of value.images) {
        if (image.url) {
          images.push({
            alt: image.alt,
            url: image.url,
          });
        }
      }
    }

    return images;
  }

  // Fetch and render content for a given identifier
  async renderContent(
    identifier: string,
    options: ContentRendererOptions = {}
  ): Promise<RenderedContent[]> {
    try {
      const { limit = 50, filter } = options;

      // Get repository info
      const repoInfo = await this.browser.getRepoInfo(identifier);
      if (!repoInfo) {
        throw new Error(`Could not get repository info for: ${identifier}`);
      }

      const renderedContent: RenderedContent[] = [];

      // Get records from main collections
      const collections = ['app.bsky.feed.post', 'app.bsky.actor.profile', 'social.grain.gallery'];
      
      for (const collection of collections) {
        if (repoInfo.collections.includes(collection)) {
          const records = await this.browser.getCollectionRecords(identifier, collection, limit);
          if (records && records.records) {
            for (const record of records.records) {
              // Apply filter if provided
              if (filter && !filter(record)) continue;

              const rendered = this.processRecord(record);
              if (rendered) {
                renderedContent.push(rendered);
              }
            }
          }
        }
      }

      // Sort by creation date (newest first)
      renderedContent.sort((a, b) => {
        const dateA = new Date(a.metadata.createdAt);
        const dateB = new Date(b.metadata.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      return renderedContent;
    } catch (error) {
      console.error('Error rendering content:', error);
      return [];
    }
  }

  // Render a specific record by URI
  async renderRecord(uri: string): Promise<RenderedContent | null> {
    try {
      const record = await this.browser.getRecord(uri);
      if (!record) return null;

      return this.processRecord(record);
    } catch (error) {
      console.error('Error rendering record:', error);
      return null;
    }
  }

  // Get available content types for an identifier
  async getContentTypes(identifier: string): Promise<string[]> {
    try {
      const repoInfo = await this.browser.getRepoInfo(identifier);
      if (!repoInfo) return [];

      const types = new Set<string>();

      for (const collection of repoInfo.collections) {
        const records = await this.browser.getCollectionRecords(identifier, collection, 10);
        if (records && records.records) {
          for (const record of records.records) {
            if (record.value?.$type) {
              types.add(record.value.$type);
            }
          }
        }
      }

      return Array.from(types);
    } catch (error) {
      console.error('Error getting content types:', error);
      return [];
    }
  }
} 