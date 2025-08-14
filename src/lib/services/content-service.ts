import { AtprotoBrowser } from '../atproto/atproto-browser';
import { loadConfig } from '../config/site';

export interface ContentRecord {
  uri: string;
  cid: string;
  value: any;
  indexedAt: string;
  collection: string;
}

export interface ProcessedContent {
  $type: string;
  collection: string;
  uri: string;
  data: any;
  createdAt: Date;
}

export class ContentService {
  private browser: AtprotoBrowser;
  private config: any;
  private cache: Map<string, ProcessedContent[]> = new Map();

  constructor() {
    this.config = loadConfig();
    this.browser = new AtprotoBrowser();
  }

  async getContentFromCollection(identifier: string, collection: string): Promise<ProcessedContent[]> {
    const cacheKey = `${identifier}:${collection}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      console.log(`Fetching ${collection} for ${identifier}...`);
      const collectionInfo = await this.browser.getCollectionRecords(identifier, collection);
      console.log(`Collection info for ${collection}:`, collectionInfo);
      
      if (!collectionInfo || !collectionInfo.records) {
        console.log(`No records found for ${collection}`);
        return [];
      }
      
      console.log(`Found ${collectionInfo.records.length} records for ${collection}`);
      
      // Debug: Show first few records
      if (collectionInfo.records.length > 0) {
        console.log(`First record in ${collection}:`, JSON.stringify(collectionInfo.records[0], null, 2));
      }
      
      const processed = collectionInfo.records.map(record => this.processRecord(record));
      
      this.cache.set(cacheKey, processed);
      return processed;
    } catch (error) {
      console.error(`Error fetching ${collection}:`, error);
      return [];
    }
  }

  private processRecord(record: ContentRecord): ProcessedContent {
    return {
      $type: record.value.$type || 'unknown',
      collection: record.collection,
      uri: record.uri,
      data: record.value,
      createdAt: new Date(record.value.createdAt || record.indexedAt)
    };
  }

  // Get galleries specifically
  async getGalleries(identifier: string): Promise<ProcessedContent[]> {
    return this.getContentFromCollection(identifier, 'social.grain.gallery');
  }

  // Get gallery items specifically with linked photos
  async getGalleryItems(identifier: string): Promise<ProcessedContent[]> {
    console.log(`Fetching gallery items for ${identifier}...`);
    const galleryItems = await this.getContentFromCollection(identifier, 'social.grain.gallery.item');
    console.log(`Found ${galleryItems.length} gallery items`);
    
    if (galleryItems.length === 0) {
      console.log('No gallery items found - this might be the issue');
      // Let's also try to fetch galleries to see if they exist
      const galleries = await this.getContentFromCollection(identifier, 'social.grain.gallery');
      console.log(`Found ${galleries.length} galleries`);
      return [];
    }
    
    // For each gallery item, try to fetch the linked photo
    const enrichedItems = await Promise.all(
      galleryItems.map(async (item) => {
        console.log(`Processing gallery item: ${item.uri}`);
        console.log(`Item data:`, JSON.stringify(item.data, null, 2));
        
        if (item.data.item && typeof item.data.item === 'string') {
          try {
            // Extract the photo URI from the item field
            const photoUri = item.data.item;
            console.log(`Fetching linked photo: ${photoUri}`);
            
            // Make sure we have a complete URI with record ID
            if (!photoUri.includes('/social.grain.photo/')) {
              console.log(`Invalid photo URI format: ${photoUri}`);
              return item;
            }
            
            const photoRecord = await this.browser.getRecord(photoUri);
            
            if (photoRecord && photoRecord.value) {
              console.log(`Found photo record:`, JSON.stringify(photoRecord.value, null, 2));
              // Merge the photo data into the gallery item
              return {
                ...item,
                data: {
                  ...item.data,
                  linkedPhoto: photoRecord.value,
                  photoUri: photoUri
                }
              };
            } else {
              console.log(`No photo record found for: ${photoUri}`);
              console.log(`Photo record was:`, photoRecord);
              
              // Let's try to fetch the photo record directly to see what's happening
              try {
                console.log(`Attempting to fetch photo record directly...`);
                const directResponse = await this.browser.agent.api.com.atproto.repo.getRecord({
                  uri: photoUri
                });
                console.log(`Direct API response:`, directResponse);
              } catch (directError) {
                console.log(`Direct API error:`, directError);
              }
            }
          } catch (error) {
            console.log(`Could not fetch linked photo for ${item.uri}:`, error);
          }
        } else {
          console.log(`No item field found in gallery item:`, item.data);
        }
        return item;
      })
    );
    
    console.log(`Returning ${enrichedItems.length} enriched gallery items`);
    return enrichedItems;
  }

  // Get posts
  async getPosts(identifier: string): Promise<ProcessedContent[]> {
    return this.getContentFromCollection(identifier, 'app.bsky.feed.post');
  }

  // Get profile
  async getProfile(identifier: string): Promise<ProcessedContent[]> {
    return this.getContentFromCollection(identifier, 'app.bsky.actor.profile');
  }

  // Get all content from multiple collections
  async getAllContent(identifier: string, collections: string[]): Promise<ProcessedContent[]> {
    const allContent: ProcessedContent[] = [];
    
    for (const collection of collections) {
      const content = await this.getContentFromCollection(identifier, collection);
      allContent.push(...content);
    }
    
    return allContent;
  }

  clearCache(): void {
    this.cache.clear();
  }
} 