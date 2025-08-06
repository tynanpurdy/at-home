# ATproto Personal Website Template

A modern personal website template powered by Astro, Tailwind CSS, and the ATproto protocol. This template allows you to create a personal website that displays content from your ATproto repository, including Bluesky posts, custom lexicon types, and more.

## Features

- **Type-safe ATproto Integration**: Full TypeScript support for ATproto records and custom lexicon
- **Component-driven Rendering**: Only render content types that have dedicated components
- **Feed Support**: Display content from custom Bluesky feeds
- **Custom Lexicon Support**: Easy to add new content types with custom components
- **Theme Customization**: Configurable colors, fonts, and styling
- **Performance Optimized**: Caching and efficient data fetching
- **Responsive Design**: Works on all device sizes
- **Dark Mode Support**: Built-in dark/light theme switching

## Supported Content Types

- **Bluesky Posts**: Standard Bluesky posts with text, images, and embeds
- **Whitewind Blog Posts**: Blog posts with titles, content, and tags
- **Leaflet Publications**: Publications with categories and rich content
- **Grain Image Galleries**: Image galleries with descriptions and captions

## Pages

- **Home Page** (`/`): Displays your latest posts and links to other content
- **Galleries Page** (`/galleries`): Shows all your grain.social image galleries

## Quick Start

1. **Clone the template**:
   ```bash
   git clone <your-repo-url>
   cd your-website
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your environment**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   ATPROTO_DID=did:plc:your-did-here
   SITE_TITLE=My Personal Website
   SITE_AUTHOR=Your Name
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ATPROTO_DID` | Your ATproto DID | Required |
| `ATPROTO_PDS_URL` | PDS server URL | `https://bsky.social` |
| `SITE_TITLE` | Website title | `My Personal Website` |
| `SITE_DESCRIPTION` | Website description | `A personal website powered by ATproto` |
| `SITE_AUTHOR` | Your name | `Your Name` |
| `SITE_URL` | Your website URL | `https://example.com` |
| `THEME_PRIMARY_COLOR` | Primary color | `#3b82f6` |
| `THEME_SECONDARY_COLOR` | Secondary color | `#64748b` |
| `THEME_ACCENT_COLOR` | Accent color | `#f59e0b` |
| `THEME_FONT_FAMILY` | Font family | `Inter, system-ui, sans-serif` |
| `CONTENT_DEFAULT_FEED_LIMIT` | Default feed limit | `20` |
| `CONTENT_CACHE_TTL` | Cache TTL (ms) | `300000` |

## Usage

### Adding Content Components

The template uses a component registry system. To add a new content type:

1. **Define the type** in `src/lib/types/atproto.ts`:
   ```typescript
   export interface MyCustomType extends CustomLexiconRecord {
     $type: 'app.bsky.actor.profile#myCustomType';
     title: string;
     content: string;
   }
   ```

2. **Create a component** in `src/components/content/`:
   ```astro
   ---
   interface Props {
     title: string;
     content: string;
   }
   const { title, content } = Astro.props;
   ---
   
   <article class="...">
     <h2>{title}</h2>
     <div>{content}</div>
   </article>
   ```

3. **Register the component** in `src/lib/components/register.ts`:
   ```typescript
   registerComponent('app.bsky.actor.profile#myCustomType', MyCustomComponent);
   ```

### Using Feed Components

Display content from a Bluesky feed:

```astro
<BlueskyFeed 
  feedUri="at://did:plc:.../app.bsky.feed.generator/..."
  limit={10}
  showAuthor={true}
  showTimestamp={true}
/>
```

Display content from your repository:

```astro
<ContentFeed 
  did="did:plc:your-did"
  limit={20}
  showAuthor={false}
  showTimestamp={true}
/>
```

### Displaying Image Galleries

The template includes a dedicated galleries page that displays all your grain.social image galleries:

```astro
<GrainImageGallery 
  gallery={galleryData}
  showDescription={true}
  showTimestamp={true}
  columns={3}
/>
```

Visit `/galleries` to see all your image galleries in a beautiful grid layout.

## Project Structure

```
src/
├── lib/
│   ├── atproto/           # ATproto API integration
│   ├── components/        # Component registry
│   ├── config/           # Site configuration
│   └── types/            # TypeScript definitions
├── components/
│   ├── content/          # Content rendering components
│   ├── layout/           # Layout components
│   └── ui/              # UI components
├── pages/               # Astro pages
└── styles/              # Global styles
```

## Deployment

### Cloudflare Pages

1. Connect your repository to Cloudflare Pages
2. Set build command: `npm run build`
3. Set build output directory: `dist`
4. Add environment variables in Cloudflare Pages settings

### Other Platforms

The site can be deployed to any static hosting platform that supports Astro:
- Vercel
- Netlify
- GitHub Pages
- etc.

## Custom Lexicon

To publish custom lexicon for others to use:

1. Define your lexicon schema following the ATproto specification
2. Publish to your PDS or a public repository
3. Create components for rendering your custom types
4. Document the lexicon for other developers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
