// Base ATproto record types
export interface AtprotoRecord {
  uri: string;
  cid: string;
  value: any;
  indexedAt: string;
}

// Bluesky post types with proper embed handling
export interface BlueskyPost {
  text: string;
  createdAt: string;
  embed?: {
    $type: 'app.bsky.embed.images' | 'app.bsky.embed.external' | 'app.bsky.embed.record';
    images?: Array<{
      alt?: string;
      image: {
        $type: 'blob';
        ref: {
          $link: string;
        };
        mimeType: string;
        size: number;
      };
      aspectRatio?: {
        width: number;
        height: number;
      };
    }>;
    external?: {
      uri: string;
      title: string;
      description?: string;
    };
    record?: {
      uri: string;
      cid: string;
    };
  };
  author?: {
    displayName?: string;
    handle?: string;
  };
  reply?: {
    root: {
      uri: string;
      cid: string;
    };
    parent: {
      uri: string;
      cid: string;
    };
  };
  facets?: Array<{
    index: {
      byteStart: number;
      byteEnd: number;
    };
    features: Array<{
      $type: string;
      [key: string]: any;
    }>;
  }>;
  langs?: string[];
  uri?: string;
  cid?: string;
}

// Custom lexicon types (to be extended)
export interface CustomLexiconRecord {
  $type: string;
  [key: string]: any;
}

// Whitewind blog post type
export interface WhitewindBlogPost extends CustomLexiconRecord {
  $type: 'app.bsky.actor.profile#whitewindBlogPost';
  title: string;
  content: string;
  publishedAt: string;
  tags?: string[];
}

// Leaflet publication type
export interface LeafletPublication extends CustomLexiconRecord {
  $type: 'app.bsky.actor.profile#leafletPublication';
  title: string;
  content: string;
  publishedAt: string;
  category?: string;
}

// Grain social image gallery type
export interface GrainImageGallery extends CustomLexiconRecord {
  $type: 'app.bsky.actor.profile#grainImageGallery';
  title: string;
  description?: string;
  images: Array<{
    alt: string;
    url: string;
  }>;
  createdAt: string;
}

// Generic grain gallery post type (for posts that contain galleries)
export interface GrainGalleryPost extends CustomLexiconRecord {
  $type: 'app.bsky.feed.post#grainGallery' | 'app.bsky.feed.post#grainImageGallery';
  text?: string;
  createdAt: string;
  embed?: {
    $type: 'app.bsky.embed.images';
    images?: Array<{
      alt?: string;
      image: {
        $type: 'blob';
        ref: string;
        mimeType: string;
        size: number;
      };
      aspectRatio?: {
        width: number;
        height: number;
      };
    }>;
  };
}

// Union type for all supported content types
export type SupportedContentType = 
  | BlueskyPost 
  | WhitewindBlogPost 
  | LeafletPublication 
  | GrainImageGallery
  | GrainGalleryPost;

// Component registry type
export interface ContentComponent {
  type: string;
  component: any;
  props?: Record<string, any>;
}

// Feed configuration type
export interface FeedConfig {
  uri: string;
  limit?: number;
  filter?: (record: AtprotoRecord) => boolean;
} 