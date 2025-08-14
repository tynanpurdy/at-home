// Generated from lexicon schema: social.grain.photo.exif
// Do not edit manually - regenerate with: npm run gen:types

export interface SocialGrainPhotoExifRecord {
  photo: string;
  createdAt: string;
  dateTimeOriginal?: string;
  exposureTime?: number;
  fNumber?: number;
  flash?: string;
  focalLengthIn35mmFormat?: number;
  iSO?: number;
  lensMake?: string;
  lensModel?: string;
  make?: string;
  model?: string;
}

export interface SocialGrainPhotoExif {
  $type: 'social.grain.photo.exif';
  value: SocialGrainPhotoExifRecord;
}

// Helper type for discriminated unions
export type SocialGrainPhotoExifUnion = SocialGrainPhotoExif;
