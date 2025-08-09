# ATproto Personal Website

A personal website built with Astro that uses your ATproto repository as a CMS. Features full type safety, real-time updates, and automatic component routing.

## Features

- **Type-Safe Content**: Automatic TypeScript type generation from ATproto lexicon schemas
- **Real-Time Updates**: Live content streaming via ATproto Jetstream
- **Component Registry**: Type-safe mapping of lexicon types to Astro components
- **Dynamic Routing**: Automatic component selection based on record types
- **Blog Support**: Full blog post rendering with markdown support
- **Gallery Display**: Image galleries with EXIF data and hover effects
- **Pagination**: Fetch more than 100 records with cursor-based pagination

## Quick Start

1. **Configure Environment**:
   ```bash
   cp env.example .env
   # Edit .env with your ATproto handle and DID
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Add Lexicon Schemas**:
   - Place JSON lexicon schemas in `src/lexicons/`
   - Update `src/lib/config/site.ts` with your lexicon sources
   - Run `npm run gen:types` to generate TypeScript types

4. **Create Components**:
   - Create Astro components in `src/components/content/`
   - Register them in `src/lib/components/registry.ts`
   - Use `ContentDisplay.astro` for automatic routing

5. **Start Development**:
   ```bash
   npm run dev
   ```

## Lexicon Integration

The system provides full type safety for ATproto lexicons:

1. **Schema Files**: JSON lexicon definitions in `src/lexicons/`
2. **Type Generation**: Automatic TypeScript type generation
3. **Component Registry**: Type-safe mapping of lexicon types to components
4. **Content Display**: Dynamic component routing

See [LEXICON_INTEGRATION.md](./LEXICON_INTEGRATION.md) for detailed instructions.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run discover` - Discover collections from your repo
- `npm run gen:types` - Generate TypeScript types from lexicon schemas

## Project Structure

```
src/
├── components/content/     # Content display components
├── lib/
│   ├── atproto/          # ATproto client and utilities
│   ├── components/        # Component registry
│   ├── config/           # Site configuration
│   ├── generated/        # Generated TypeScript types
│   ├── services/         # Content services
│   └── types/           # Type definitions
├── lexicons/            # Lexicon schema files
└── pages/              # Astro pages
```

## Configuration

The system is configured via environment variables and `src/lib/config/site.ts`:

- `ATPROTO_HANDLE` - Your Bluesky handle
- `ATPROTO_DID` - Your DID (optional, auto-resolved)
- `SITE_TITLE` - Site title
- `SITE_DESCRIPTION` - Site description
- `SITE_AUTHOR` - Site author

## Adding New Content Types

1. Create a lexicon schema in `src/lexicons/`
2. Add it to `lexiconSources` in site config
3. Run `npm run gen:types`
4. Create a component in `src/components/content/`
5. Register it in `src/lib/components/registry.ts`

The system will automatically route records to your components with full type safety.

## Development

- Debug mode shows component routing information
- Generic fallback for unknown record types
- Real-time updates via Jetstream
- Type-safe component registry
- Automatic type generation from schemas

## License

MIT
