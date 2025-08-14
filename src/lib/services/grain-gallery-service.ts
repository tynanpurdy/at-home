import { AtprotoBrowser } from '../atproto/atproto-browser';
import { loadConfig } from '../config/site';
import { extractCidFromBlobRef, blobCdnUrl } from '../atproto/blob-url';
import type { SocialGrainGalleryRecord } from '../generated/social-grain-gallery';
import type { SocialGrainGalleryItemRecord } from '../generated/social-grain-gallery-item';
import type { SocialGrainPhotoRecord } from '../generated/social-grain-photo';
import type { SocialGrainPhotoExifRecord } from '../generated/social-grain-photo-exif';

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
  private extractGalleryUriFromItem(item: { value: SocialGrainGalleryItemRecord } | SocialGrainGalleryItemRecord): string | null {
    const value: SocialGrainGalleryItemRecord = (item as any)?.value ?? (item as SocialGrainGalleryItemRecord);
    if (typeof value?.gallery === 'string') return value.gallery;
    return null;
  }

  // Build processed galleries using the authoritative gallery records and item mappings
  private buildProcessedGalleries(
    galleries: Array<{ uri: string; value: SocialGrainGalleryRecord; indexedAt: string; collection: string }>,
    items: Array<{ uri: string; value: SocialGrainGalleryItemRecord }>,
    photosByUri: Map<string, { uri: string; value: SocialGrainPhotoRecord }>,
    exifByPhotoUri: Map<string, SocialGrainPhotoExifRecord>
  ): ProcessedGrainGallery[] {
    // Index items by gallery URI
    const itemsByGallery = new Map<string, Array<{ uri: string; value: SocialGrainGalleryItemRecord }>>();
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
        const pa = Number(a.value.position ?? 0);
        const pb = Number(b.value.position ?? 0);
        return pa - pb;
      });

      const images: Array<{ alt?: string; url: string; caption?: string; exif?: any }> = [];
      for (const item of galleryItems) {
        const photoUri = item.value.item;
        if (!photoUri) continue;
        const photo = photosByUri.get(photoUri);
        if (!photo) continue;

        // Extract blob CID
        const cid = extractCidFromBlobRef((photo.value as any)?.photo?.ref ?? (photo.value as any)?.photo);
        if (!cid || !did) continue;
        const url = blobCdnUrl(did, cid);

        const exif = exifByPhotoUri.get(photoUri);
        images.push({
          url,
          alt: photo.value.alt,
          caption: (photo.value as any).caption,
          exif: exif
            ? {
                make: exif.make,
                model: exif.model,
                lensMake: exif.lensMake,
                lensModel: exif.lensModel,
                iSO: exif.iSO,
                fNumber: exif.fNumber,
                exposureTime: exif.exposureTime,
                focalLengthIn35mmFormat: exif.focalLengthIn35mmFormat,
                dateTimeOriginal: exif.dateTimeOriginal,
              }
            : undefined,
        });
      }

      processed.push({
        id: galleryUri,
        title: gallery.value.title || 'Untitled Gallery',
        description: gallery.value.description,
        createdAt: gallery.value.createdAt || gallery.indexedAt,
        images,
        itemCount: galleryItems.length,
        collections: [gallery.collection],
      });
    }

    // Sort galleries by createdAt desc
    processed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return processed;
  }

  // Fetch galleries with items, photos, and exif metadata
  async getGalleries(identifier: string): Promise<ProcessedGrainGallery[]> {
    try {
      const repoInfo = await this.browser.getRepoInfo(identifier);
      if (!repoInfo) {
        throw new Error(`Could not get repository info for: ${identifier}`);
      }

      // Fetch the four relevant collections
      const [galleryRecords, itemRecords, photoRecords, exifRecords] = await Promise.all([
        this.browser.getAllCollectionRecords(identifier, 'social.grain.gallery', 500),
        this.browser.getAllCollectionRecords(identifier, 'social.grain.gallery.item', 5000),
        this.browser.getAllCollectionRecords(identifier, 'social.grain.photo', 5000),
        this.browser.getAllCollectionRecords(identifier, 'social.grain.photo.exif', 5000),
      ]);

      // Type and build maps for fast lookup
      const typedGalleries = galleryRecords.map(r => ({
        uri: r.uri,
        value: r.value as SocialGrainGalleryRecord,
        indexedAt: r.indexedAt,
        collection: r.collection,
      }));

      const typedItems = itemRecords.map(r => ({
        uri: r.uri,
        value: r.value as SocialGrainGalleryItemRecord,
      }));

      const photosByUri = new Map<string, { uri: string; value: SocialGrainPhotoRecord }>();
      for (const p of photoRecords) {
        photosByUri.set(p.uri, { uri: p.uri, value: p.value as SocialGrainPhotoRecord });
      }

      const exifByPhotoUri = new Map<string, SocialGrainPhotoExifRecord>();
      for (const e of exifRecords) {
        const ev = e.value as SocialGrainPhotoExifRecord;
        const photoUri = ev.photo;
        if (photoUri) exifByPhotoUri.set(photoUri, ev);
      }

      const processed = this.buildProcessedGalleries(
        typedGalleries,
        typedItems,
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

} 