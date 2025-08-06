# ATProto Personal Website

A personal website powered by ATProto, featuring real-time streaming, repository browsing, and type generation.

## Features

### 🚀 Real-time Streaming
- **Jetstream Test** (`/jetstream-test`): Real-time ATProto streaming with DID filtering
- Uses the same jetstream endpoint as atptools for low-latency updates
- Filters by your configured DID for personalized streaming

### 🌐 Repository Browsing
- **ATProto Browser Test** (`/atproto-browser-test`): Browse any ATProto account's collections and records
- Discover all collections in a repository
- View records from specific collections
- Similar functionality to atptools

### 📝 Type Generation
- **Lexicon Generator Test** (`/lexicon-generator-test`): Generate TypeScript types for all lexicons in your repository
- Automatically discovers all lexicon types from your configured account
- Generates proper TypeScript interfaces and helper functions
- Copy to clipboard or download as `.ts` file

### 🖼️ Image Galleries
- **Image Galleries** (`/galleries`): View grain.social image galleries and photo collections

## Configuration

The site is configured to use your ATProto account:

- **Handle**: `tynanpurdy.com`
- **DID**: `did:plc:6ayddqghxhciedbaofoxkcbs`
- **PDS**: `https://bsky.social`

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:4324` to see the site.

## Project Structure

```
src/
├── lib/atproto/
│   ├── atproto-browser.ts    # Repository browsing functionality
│   ├── jetstream-client.ts   # Real-time streaming client
│   └── client.ts             # Basic ATProto client
├── pages/
│   ├── index.astro           # Homepage with navigation
│   ├── jetstream-test.astro  # Real-time streaming test
│   ├── atproto-browser-test.astro  # Repository browsing test
│   ├── lexicon-generator-test.astro # Type generation test
│   └── galleries.astro       # Image galleries
└── components/
    └── content/              # Content display components
```

## Technologies

- **Astro**: Web framework
- **ATProto API**: For repository access and streaming
- **TypeScript**: For type safety
- **Tailwind CSS**: For styling

## Inspired By

This project takes inspiration from [atptools](https://github.com/espeon/atptools) for repository browsing and jetstream streaming approaches.
