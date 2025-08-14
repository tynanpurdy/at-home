// Generated from lexicon schema: social.grain.gallery.item
// Do not edit manually - regenerate with: npm run gen:types

export interface SocialGrainGalleryItemRecord {
  createdAt: string;
  gallery: string;
  item: string;
  position?: number;
}

export interface SocialGrainGalleryItem {
  $type: 'social.grain.gallery.item';
  value: SocialGrainGalleryItemRecord;
}

// Helper type for discriminated unions
export type SocialGrainGalleryItemUnion = SocialGrainGalleryItem;
