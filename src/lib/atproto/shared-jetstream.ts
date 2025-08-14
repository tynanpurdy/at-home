// Shared Jetstream instance for components to access and filter
import { JetstreamClient, type JetstreamRecord } from './jetstream-client';

let sharedJetstream: JetstreamClient | null = null;
let connectionCount = 0;
const listeners: Map<string, Set<(record: JetstreamRecord) => void>> = new Map();

export function getSharedJetstream(): JetstreamClient {
  if (!sharedJetstream) {
    sharedJetstream = new JetstreamClient();
    
    // Set up the main record handler that distributes to filtered listeners
    sharedJetstream.onRecord((record) => {
      // Distribute to all listeners that match the filter
      listeners.forEach((listenerSet, filterKey) => {
        if (matchesFilter(record, filterKey)) {
          listenerSet.forEach(callback => callback(record));
        }
      });
    });
  }
  return sharedJetstream;
}

// Start the shared stream (call once when first component needs it)
export async function startSharedStream(): Promise<void> {
  const jetstream = getSharedJetstream();
  if (connectionCount === 0) {
    await jetstream.startStreaming();
  }
  connectionCount++;
}

// Stop the shared stream (call when last component is done)
export function stopSharedStream(): void {
  connectionCount--;
  if (connectionCount <= 0 && sharedJetstream) {
    sharedJetstream.stopStreaming();
    connectionCount = 0;
  }
}

// Subscribe to filtered records
export function subscribeToRecords(
  filter: string | ((record: JetstreamRecord) => boolean),
  callback: (record: JetstreamRecord) => void
): () => void {
  const filterKey = typeof filter === 'string' ? filter : filter.toString();
  
  if (!listeners.has(filterKey)) {
    listeners.set(filterKey, new Set());
  }
  
  const listenerSet = listeners.get(filterKey)!;
  listenerSet.add(callback);
  
  // Return unsubscribe function
  return () => {
    const set = listeners.get(filterKey);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        listeners.delete(filterKey);
      }
    }
  };
}

// Helper to check if a record matches a filter
function matchesFilter(record: JetstreamRecord, filterKey: string): boolean {
  // If filter is a function string, we can't easily evaluate it
  // For now, support simple $type matching
  if (filterKey.startsWith('$type:')) {
    const expectedType = filterKey.substring(6);
    return record.$type === expectedType;
  }
  
  // Support collection matching
  if (filterKey.startsWith('collection:')) {
    const expectedCollection = filterKey.substring(11);
    return record.collection === expectedCollection;
  }
  
  // Support operation matching
  if (filterKey.startsWith('operation:')) {
    const expectedOperation = filterKey.substring(10);
    return record.operation === expectedOperation;
  }
  
  // Default to exact match
  return filterKey === record.$type;
}

// Convenience functions for common filters
export function subscribeToStatusUpdates(callback: (record: JetstreamRecord) => void): () => void {
  return subscribeToRecords('$type:a.status.update', callback);
}

export function subscribeToPosts(callback: (record: JetstreamRecord) => void): () => void {
  return subscribeToRecords('$type:app.bsky.feed.post', callback);
}

export function subscribeToGalleryUpdates(callback: (record: JetstreamRecord) => void): () => void {
  return subscribeToRecords('collection:social.grain.gallery', callback);
}
