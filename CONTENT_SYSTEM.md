# Content System Documentation

This document explains how the ATProto content system works in this project, including real-time streaming, repository browsing, and type generation.

## Overview

The content system is built around ATProto (Authenticated Transfer Protocol) and provides three main capabilities:

1. **Real-time Streaming**: Live updates from your ATProto repository
2. **Repository Browsing**: Explore collections and records from any ATProto account
3. **Type Generation**: Automatically generate TypeScript types for discovered lexicons

## Architecture

### Core Components

```
src/lib/atproto/
├── client.ts              # Basic ATProto API client
├── jetstream-client.ts    # Real-time streaming via WebSocket
└── atproto-browser.ts     # Repository browsing and analysis
```

### Test Pages

```
src/pages/
├── jetstream-test.astro           # Real-time streaming test
├── atproto-browser-test.astro     # Repository browsing test
├── lexicon-generator-test.astro   # Type generation test
└── galleries.astro               # Image galleries display
```

## 1. Real-time Streaming (Jetstream)

### How It Works

The jetstream system connects to ATProto's real-time streaming service to receive live updates from your repository.

**Key Features:**
- WebSocket connection to `wss://jetstream1.us-east.bsky.network/subscribe`
- DID filtering (only shows your configured account)
- Real-time commit events (create/update/delete)
- Low latency updates

**Configuration:**
```typescript
// From src/lib/config/site.ts
export const defaultConfig: SiteConfig = {
  atproto: {
    handle: 'tynanpurdy.com',
    did: 'did:plc:6ayddqghxhciedbaofoxkcbs',
    pdsUrl: 'https://bsky.social',
  },
  // ...
};
```

**Usage:**
```typescript
// In jetstream-test.astro
const client = new JetstreamClient();
client.onRecord((record) => {
  console.log('New record:', record);
  // Display record in UI
});
await client.startStreaming();
```

**Message Format:**
```typescript
interface JetstreamRecord {
  uri: string;
  cid: string;
  value: any;
  indexedAt: string;
  collection: string;
  $type: string;
  service: string;
  did: string;
  time_us: number;
  operation: 'create' | 'update' | 'delete';
}
```

## 2. Repository Browsing (ATProto Browser)

### How It Works

The ATProto browser allows you to explore any ATProto repository's collections and records, similar to atptools.

**Key Features:**
- Resolve handles to DIDs automatically
- Discover all collections in a repository
- Browse records from specific collections
- Get repository metadata and profiles

**API Endpoints Used:**
```typescript
// Resolve handle to DID
GET /xrpc/com.atproto.identity.resolveHandle?handle={handle}

// Get repository info
GET /xrpc/com.atproto.repo.describeRepo?repo={did}

// Get records from collection
GET /xrpc/com.atproto.repo.listRecords?repo={did}&collection={collection}&limit={limit}

// Get specific record
GET /xrpc/com.atproto.repo.getRecord?uri={uri}
```

**Usage:**
```typescript
// In atproto-browser-test.astro
const browser = new AtprotoBrowser();

// Get repository info
const repoInfo = await browser.getRepoInfo('tynanpurdy.com');

// Get collections
const collections = await browser.getAllCollections('tynanpurdy.com');

// Get records from collection
const records = await browser.getCollectionRecords('tynanpurdy.com', 'app.bsky.feed.post', 50);
```

## 3. Type Generation (Lexicon Generator)

### How It Works

The lexicon generator analyzes your repository to discover all lexicon types and generates TypeScript interfaces for them.

**Process:**
1. Get all collections from your repository
2. Sample records from each collection
3. Group records by `$type`
4. Analyze record structure and properties
5. Generate TypeScript interfaces

**Generated Output:**
```typescript
// Auto-generated TypeScript types
export interface AppBskyFeedPost {
  $type: 'app.bsky.feed.post';
  text: string;
  createdAt: string;
  // ... other properties
}

export interface CollectionTypes {
  'app.bsky.feed.post': 'app.bsky.feed.post';
  'app.bsky.actor.profile': 'app.bsky.actor.profile';
  // ... other collections
}

export type AllLexicons = AppBskyFeedPost | AppBskyActorProfile | /* ... */;

// Helper functions
export function isLexiconType(record: any, type: string): boolean;
export function getCollectionTypes(collection: string): string[];
```

**Usage:**
```typescript
// In lexicon-generator-test.astro
const generator = new SimpleLexiconGenerator();
const result = await generator.generateTypesForRepository();
// result.typeDefinitions contains the generated TypeScript code
```

## Content Flow

### 1. Real-time Updates
```
ATProto Repository → Jetstream → WebSocket → UI Updates
```

### 2. Repository Browsing
```
User Input → Handle Resolution → Collection Discovery → Record Fetching → UI Display
```

### 3. Type Generation
```
Repository Analysis → Lexicon Discovery → Property Analysis → TypeScript Generation → File Export
```

## Configuration

### Environment Variables
```env
# Your ATProto account
ATPROTO_HANDLE=tynanpurdy.com
ATPROTO_DID=did:plc:6ayddqghxhciedbaofoxkcbs
ATPROTO_PDS_URL=https://bsky.social

# Site configuration
SITE_TITLE=Your Site Title
SITE_AUTHOR=Your Name
```

### Site Configuration
```typescript
// src/lib/config/site.ts
export interface SiteConfig {
  site: {
    title: string;
    description: string;
    author: string;
    url: string;
  };
  atproto: {
    handle: string;
    did: string;
    pdsUrl: string;
  };
}
```

## Error Handling

### Common Issues

1. **Jetstream Connection Failures:**
   - Check WebSocket endpoint availability
   - Verify DID is correct
   - Check network connectivity

2. **Repository Access Errors:**
   - Verify handle/DID exists
   - Check PDS server availability
   - Ensure proper API permissions

3. **Type Generation Issues:**
   - Repository must have records to analyze
   - Check for valid lexicon types
   - Verify record structure

### Debugging

```typescript
// Enable detailed logging
console.log('🔍 Analyzing collection:', collection);
console.log('📝 New record from jetstream:', record);
console.log('✅ Generated lexicon for:', $type);
```

## Performance Considerations

### Caching
- Repository metadata is cached to reduce API calls
- Collection lists are cached during browsing sessions
- Type generation results can be saved locally

### Rate Limiting
- ATProto APIs have rate limits
- Implement delays between requests
- Use pagination for large collections

### Memory Management
- Limit record samples during type generation
- Clear old records from streaming buffers
- Implement proper cleanup for WebSocket connections

## Future Enhancements

### Potential Improvements

1. **Enhanced Type Generation:**
   - Support for nested object types
   - Union type detection
   - Custom type annotations

2. **Advanced Streaming:**
   - Multiple DID filtering
   - Collection-specific streams
   - Event replay capabilities

3. **Repository Analysis:**
   - Statistical analysis of repository
   - Content type distribution
   - Usage patterns

4. **UI Enhancements:**
   - Real-time type updates
   - Interactive collection browsing
   - Advanced filtering options

## Integration with Other Systems

### ATProto Ecosystem
- Compatible with any ATProto PDS
- Works with custom lexicons
- Supports Bluesky and other ATProto apps

### Development Workflow
- Generated types can be used in TypeScript projects
- Real-time updates can trigger build processes
- Repository changes can trigger deployments

## Security Considerations

### Data Privacy
- Only access public repository data
- No authentication required for browsing
- Streaming only shows public commits

### API Usage
- Respect rate limits
- Implement proper error handling
- Use HTTPS for all API calls

## Troubleshooting

### Common Problems

1. **Jetstream not connecting:**
   - Check if endpoint is accessible
   - Verify DID format
   - Check browser WebSocket support

2. **No records found:**
   - Verify repository has content
   - Check collection names
   - Ensure proper API permissions

3. **Type generation fails:**
   - Repository must have records
   - Check for valid lexicon structure
   - Verify record format

### Debug Commands

```bash
# Test ATProto API access
curl "https://bsky.social/xrpc/com.atproto.repo.describeRepo?repo=did:plc:6ayddqghxhciedbaofoxkcbs"

# Test jetstream connection
wscat -c "wss://jetstream1.us-east.bsky.network/subscribe?dids=did:plc:6ayddqghxhciedbaofoxkcbs"
```

This content system provides a comprehensive foundation for working with ATProto data, from real-time streaming to type-safe development. 