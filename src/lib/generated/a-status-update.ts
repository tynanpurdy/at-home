// Generated from lexicon schema: a.status.update
// Do not edit manually - regenerate with: npm run gen:types

export interface AStatusUpdateRecord {
  text: string;
  createdAt: string;
}

export interface AStatusUpdate {
  $type: 'a.status.update';
  value: AStatusUpdateRecord;
}

// Helper type for discriminated unions
export type AStatusUpdateUnion = AStatusUpdate;
