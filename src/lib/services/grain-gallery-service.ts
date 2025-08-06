import { AtprotoBrowser } from '../atproto/atproto-browser';
import { loadConfig } from '../config/site';
import type { AtprotoRecord } from '../types/atproto';

export interface GrainGalleryItem {
  uri: string;
  cid: string;
  value: {
    $type: string;
    galleryId?: string;
    gallery_id?: string;
    id?: string;
    title?: string;
    description?: string;
    caption?: string;
    image?: {
      url?: string;
      src?: string;
      alt?: string;
      caption?: string;
    };
    photo?: {
      url?: string;
      src?: string;
      alt?: string;
      caption?: string;
    };
    media?: {
      url?: string;
      src?: string;
      alt?: string;
      caption?: string;
    };
    createdAt: string;
  };
  indexedAt: string;
  collection: string;
}

export interface GrainGallery {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  items: GrainGalleryItem[];
  imageCount: number;
  collections: string[];
}

export interface ProcessedGrainGallery {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  images: Array<{
    alt?: string;
    url: string;
    caption?: string;
  }>;
  itemCount: number;
  collections: string[];
}

export class GrainGalleryService {
  private browser: AtprotoBrowser;
  private config: any;

  constructor() {
    this.config = loadConfig();
    this.browser = new AtprotoBrowser();
  }

  // Extract gallery ID from various possible fields
  private extractGalleryId(item: GrainGalleryItem): string | null {
    const value = item.value;
    
    // Direct gallery ID fields
    if (value.galleryId) return value.galleryId;
    if (value.gallery_id) return value.gallery_id;
    if (value.id) return value.id;
    
    // Extract from URI if it contains gallery ID
    const uriMatch = item.uri.match(/gallery\/([^\/]+)/);
    if (uriMatch) return uriMatch[1];
    
    // Extract from title if it contains gallery ID
    if (value.title) {
      const titleMatch = value.title.match(/gallery[:\-\s]+([^\s]+)/i);
      if (titleMatch) return titleMatch[1];
    }
    
    // Use a hash of the collection and first part of URI as fallback
    return `${item.collection}-${item.uri.split('/').pop()?.split('?')[0]}`;
  }

  // Extract image from gallery item
  private extractImageFromItem(item: GrainGalleryItem): { alt?: string; url: string; caption?: string } | null {
    const value = item.value;
    
    // Try different image fields
    const imageFields = ['image', 'photo', 'media'];
    
    for (const field of imageFields) {
      const imageData = value[field];
      if (imageData && (imageData.url || imageData.src)) {
        return {
          alt: imageData.alt || imageData.caption || value.caption,
          url: imageData.url || imageData.src,
          caption: imageData.caption || value.caption
        };
      }
    }
    
    return null;
  }

  // Group gallery items into galleries
  private groupGalleryItems(items: GrainGalleryItem[]): GrainGallery[] {
    const galleryGroups = new Map<string, GrainGallery>();
    
    for (const item of items) {
      const galleryId = this.extractGalleryId(item);
      if (!galleryId) continue;
      
      if (!galleryGroups.has(galleryId)) {
        // Create new gallery
        galleryGroups.set(galleryId, {
          id: galleryId,
          title: item.value.title || `Gallery ${galleryId}`,
          description: item.value.description || item.value.caption,
          createdAt: item.value.createdAt || item.indexedAt,
          items: [],
          imageCount: 0,
          collections: new Set()
        });
      }
      
      const gallery = galleryGroups.get(galleryId)!;
      gallery.items.push(item);
      gallery.collections.add(item.collection);
      
      // Update earliest creation date
      const itemDate = new Date(item.value.createdAt || item.indexedAt);
      const galleryDate = new Date(gallery.createdAt);
      if (itemDate < galleryDate) {
        gallery.createdAt = item.value.createdAt || item.indexedAt;
      }
    }
    
    // Calculate image counts and convert collections to arrays
    for (const gallery of galleryGroups.values()) {
      gallery.imageCount = gallery.items.filter(item => this.extractImageFromItem(item)).length;
      gallery.collections = Array.from(gallery.collections);
    }
    
    return Array.from(galleryGroups.values());
  }

  // Process gallery into display format
  private processGalleryForDisplay(gallery: GrainGallery): ProcessedGrainGallery {
    const images: Array<{ alt?: string; url: string; caption?: string }> = [];
    
    // Extract images from all items
    for (const item of gallery.items) {
      const image = this.extractImageFromItem(item);
      if (image) {
        images.push(image);
      }
    }
    
    return {
      id: gallery.id,
      title: gallery.title,
      description: gallery.description,
      createdAt: gallery.createdAt,
      images,
      itemCount: gallery.items.length,
      collections: gallery.collections
    };
  }

  // Fetch all gallery items from Grain.social collections
  async getGalleryItems(identifier: string): Promise<GrainGalleryItem[]> {
    try {
      const repoInfo = await this.browser.getRepoInfo(identifier);
      if (!repoInfo) {
        throw new Error(`Could not get repository info for: ${identifier}`);
      }

      const items: GrainGalleryItem[] = [];
      
      // Get all grain-related collections
      const grainCollections = repoInfo.collections.filter(col => 
        col.includes('grain') || col.includes('social.grain')
      );
      
      console.log('🔍 Found grain collections:', grainCollections);
      
      for (const collection of grainCollections) {
        const records = await this.browser.getCollectionRecords(identifier, collection, 200);
        if (records && records.records) {
          console.log(`📦 Collection ${collection}: ${records.records.length} records`);
          
          for (const record of records.records) {
            // Convert to GrainGalleryItem format
            const item: GrainGalleryItem = {
              uri: record.uri,
              cid: record.cid,
              value: record.value,
              indexedAt: record.indexedAt,
              collection: record.collection
            };
            
            items.push(item);
          }
        }
      }
      
      console.log(`🎯 Total gallery items found: ${items.length}`);
      return items;
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      return [];
    }
  }

  // Get grouped galleries
  async getGalleries(identifier: string): Promise<ProcessedGrainGallery[]> {
    try {
      const items = await this.getGalleryItems(identifier);
      
      if (items.length === 0) {
        console.log('No gallery items found');
        return [];
      }
      
      // Group items into galleries
      const groupedGalleries = this.groupGalleryItems(items);
      
      console.log(`🏛️ Grouped into ${groupedGalleries.length} galleries`);
      
      // Process for display
      const processedGalleries = groupedGalleries.map(gallery => this.processGalleryForDisplay(gallery));
      
      // Sort by creation date (newest first)
      processedGalleries.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      return processedGalleries;
    } catch (error) {
      console.error('Error getting galleries:', error);
      return [];
    }
  }

  // Get a specific gallery by ID
  async getGallery(identifier: string, galleryId: string): Promise<ProcessedGrainGallery | null> {
    try {
      const galleries = await this.getGalleries(identifier);
      return galleries.find(gallery => gallery.id === galleryId) || null;
    } catch (error) {
      console.error('Error getting gallery:', error);
      return null;
    }
  }

  // Get gallery items for a specific gallery
  async getGalleryItemsForGallery(identifier: string, galleryId: string): Promise<GrainGalleryItem[]> {
    try {
      const items = await this.getGalleryItems(identifier);
      return items.filter(item => this.extractGalleryId(item) === galleryId);
    } catch (error) {
      console.error('Error getting gallery items:', error);
      return [];
    }
  }
} 