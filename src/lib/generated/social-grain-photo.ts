// Generated from lexicon schema: social.grain.photo
// Do not edit manually - regenerate with: npm run gen:types

export interface SocialGrainPhotoRecord {
  photo: any;
  alt?: string;
  aspectRatio: any;
  createdAt: string;
}

export interface SocialGrainPhoto {
  $type: 'social.grain.photo';
  value: SocialGrainPhotoRecord;
}

// Helper type for discriminated unions
export type SocialGrainPhotoUnion = SocialGrainPhoto;
