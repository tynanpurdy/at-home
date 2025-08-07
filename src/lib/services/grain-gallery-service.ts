import { AtprotoBrowser } from '../atproto/atproto-browser';
import { loadConfig } from '../config/site';
import type { AtprotoRecord } from '../types/atproto';
import { extractCidFromBlobRef, blobCdnUrl } from '../atproto/blob-url';

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
    exif?: {
      make?: string;
      model?: string;
      lensMake?: string;
      lensModel?: string;
      iSO?: number;
      fNumber?: number;
      exposureTime?: number;
      focalLengthIn35mmFormat?: number;
      dateTimeOriginal?: string;
    };
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

  // Resolve gallery URI directly from the item record if present
  private extractGalleryUriFromItem(item: any): string | null {
    const value = item?.value ?? item;
    if (typeof value?.gallery === 'string') return value.gallery;
    // Some variants might use a nested key
    if (typeof value?.galleryUri === 'string') return value.galleryUri;
    return null;
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

  // Build processed galleries using the authoritative gallery records and item mappings
  private buildProcessedGalleries(
    galleries: AtprotoRecord[],
    items: AtprotoRecord[],
    photosByUri: Map<string, AtprotoRecord>,
    exifByPhotoUri: Map<string, any>
  ): ProcessedGrainGallery[] {
    // Index items by gallery URI
    const itemsByGallery = new Map<string, AtprotoRecord[]>();
    for (const item of items) {
      const galleryUri = this.extractGalleryUriFromItem(item);
      if (!galleryUri) continue;
      const arr = itemsByGallery.get(galleryUri) ?? [];
      arr.push(item);
      itemsByGallery.set(galleryUri, arr);
    }

    const processed: ProcessedGrainGallery[] = [];
    const did = this.config.atproto.did;

    for (const gallery of galleries) {
      const galleryUri = gallery.uri;
      const galleryItems = itemsByGallery.get(galleryUri) ?? [];
      // Sort by position if available
      galleryItems.sort((a, b) => {
        const pa = Number(a.value?.position ?? 0);
        const pb = Number(b.value?.position ?? 0);
        return pa - pb;
      });

      const images: Array<{ alt?: string; url: string; caption?: string; exif?: any }> = [];
      for (const item of galleryItems) {
        const photoUri = typeof item.value?.item === 'string' ? item.value.item : null;
        if (!photoUri) continue;
        const photo = photosByUri.get(photoUri);
        if (!photo) continue;

        // Extract blob CID
        const cid = extractCidFromBlobRef(photo.value?.photo?.ref ?? photo.value?.photo);
        if (!cid || !did) continue;
        const url = blobCdnUrl(did, cid);

        const exif = exifByPhotoUri.get(photoUri);
        images.push({
          url,
          alt: photo.value?.alt,
          caption: photo.value?.caption,
          exif: exif ? {
            make: exif.make,
            model: exif.model,
            lensMake: exif.lensMake,
            lensModel: exif.lensModel,
            iSO: exif.iSO,
            fNumber: exif.fNumber,
            exposureTime: exif.exposureTime,
            focalLengthIn35mmFormat: exif.focalLengthIn35mmFormat,
            dateTimeOriginal: exif.dateTimeOriginal,
          } : undefined,
        });
      }

      processed.push({
        id: galleryUri,
        title: gallery.value?.title || 'Untitled Gallery',
        description: gallery.value?.description,
        createdAt: gallery.value?.createdAt || gallery.indexedAt,
        images,
        itemCount: galleryItems.length,
        collections: [gallery.collection],
      });
    }

    // Sort galleries by createdAt desc
    processed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return processed;
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

  // Fetch galleries with items, photos, and exif metadata
  async getGalleries(identifier: string): Promise<ProcessedGrainGallery[]> {
    try {
      const repoInfo = await this.browser.getRepoInfo(identifier);
      if (!repoInfo) {
        throw new Error(`Could not get repository info for: ${identifier}`);
      }

      // Fetch the four relevant collections
      const [galleries, items, photos, exifs] = await Promise.all([
        this.browser.getCollectionRecords(identifier, 'social.grain.gallery', 100),
        this.browser.getCollectionRecords(identifier, 'social.grain.gallery.item', 100),
        this.browser.getCollectionRecords(identifier, 'social.grain.photo', 100),
        this.browser.getCollectionRecords(identifier, 'social.grain.photo.exif', 100),
      ]);

      const galleryRecords = galleries?.records ?? [];
      const itemRecords = items?.records ?? [];
      const photoRecords = photos?.records ?? [];
      const exifRecords = exifs?.records ?? [];

      // Build maps for fast lookup
      const photosByUri = new Map<string, AtprotoRecord>();
      for (const p of photoRecords) {
        photosByUri.set(p.uri, p);
      }
      const exifByPhotoUri = new Map<string, any>();
      for (const e of exifRecords) {
        const photoUri = typeof e.value?.photo === 'string' ? e.value.photo : undefined;
        if (photoUri) exifByPhotoUri.set(photoUri, e.value);
      }

      const processed = this.buildProcessedGalleries(
        galleryRecords,
        itemRecords,
        photosByUri,
        exifByPhotoUri,
      );

      return processed;
    } catch (error) {
      console.error('Error getting galleries:', error);
      return [];
    }
  }

  // Deprecated older flow kept for compatibility; prefer getGalleries()

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