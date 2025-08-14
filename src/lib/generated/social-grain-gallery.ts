// Generated from lexicon schema: social.grain.gallery
// Do not edit manually - regenerate with: npm run gen:types

export interface SocialGrainGalleryRecord {
  title: string;
  description?: string;
  facets?: any[];
  labels?: any;
  updatedAt?: string;
  createdAt: string;
}

export interface SocialGrainGallery {
  $type: 'social.grain.gallery';
  value: SocialGrainGalleryRecord;
}

// Helper type for discriminated unions
export type SocialGrainGalleryUnion = SocialGrainGallery;
