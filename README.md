# AT Home - Personal Portfolio & Blog

A modern, decentralized personal website built with Astro and powered by the AT Protocol. This site serves as both a portfolio and blog, with all content fetched directly from your AT Protocol repository.

## Features

- 🌐 **Decentralized Content**: All content is fetched from your AT Protocol repository
- 📝 **WhiteWind Blog Integration**: Blog posts using the WhiteWind lexicon
- 🔄 **Activity Feed**: Display activity from any AT Protocol collections
- 💾 **Smart Caching**: Build-time caching to reduce API calls and prevent rate limiting
- 🎨 **Modern Design**: Clean, responsive interface with dark mode support
- 🚀 **Fast Performance**: Static site generation with Astro
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🔒 **Own Your Data**: No vendor lock-in, your content stays with you

## Tech Stack

- **Frontend**: Astro, React, Tailwind CSS
- **Data Source**: AT Protocol
- **Blog Platform**: WhiteWind lexicon
- **Styling**: Tailwind CSS with dark mode support
- **Type Safety**: TypeScript throughout

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- An AT Protocol account (Bluesky account works)
- Optional: App password for authenticated requests

### Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd at-home
```

2. Install dependencies:
```bash
npm install
```

3. Set up the cache directory:
```bash
mkdir -p src/data/cache
```

4. Configure your AT Protocol settings:

Edit `src/config/atproto.ts` and update the configuration:

```typescript
export const DEFAULT_CONFIG: ATProtoConfig = {
  service: 'https://bsky.social',
  identifier: 'your-handle.bsky.social', // Replace with your handle
  handle: 'your-handle.bsky.social', // Replace with your handle
  // password: 'your-app-password', // Optional: for authenticated requests
};
```

5. Set up environment variables (optional):

Create a `.env` file in the root directory:

```env
ATPROTO_SERVICE=https://bsky.social
ATPROTO_IDENTIFIER=your-handle.bsky.social
ATPROTO_HANDLE=your-handle.bsky.social
ATPROTO_PASSWORD=your-app-password
```

6. Build the initial cache:
```bash
npm run refresh-cache
```

7. Start the development server:
```bash
npm run dev
```

8. Open your browser and navigate to `http://localhost:4321`

## Configuration

### AT Protocol Setup

1. **Get your handle**: This is your Bluesky username (e.g., `alice.bsky.social`)
2. **Optional - App Password**: For authenticated requests, create an app password in your Bluesky settings
3. **Update config**: Modify `src/config/atproto.ts` with your details

### Content Sources

This site can display content from various AT Protocol collections:

- **Blog Posts**: Uses the WhiteWind lexicon (`com.whtwnd.blog.entry`)
- **Social Posts**: Bluesky posts (`app.bsky.feed.post`)
- **Likes**: Your likes (`app.bsky.feed.like`)
- **Reposts**: Your reposts (`app.bsky.feed.repost`)
- **Follows**: Your follows (`app.bsky.graph.follow`)
- **Profile Updates**: Profile changes (`app.bsky.actor.profile`)

### Publishing Blog Posts

To publish blog posts that appear on your site:

1. **Use WhiteWind**: Go to [whitewind.app](https://whitewind.app) and create posts
2. **Use compatible clients**: Any AT Protocol client that supports the WhiteWind lexicon
3. **Manual publishing**: Use AT Protocol tools to publish records with the `com.whtwnd.blog.entry` collection

## Deployment

### Static Site Generation

Build the site for production:

```bash
npm run build
```

This automatically refreshes the cache and generates static files in the `dist/` directory.

### Hosting Options

Deploy to any static hosting service:

- **Netlify**: Connect your repository for automatic deployments
- **Vercel**: Import your project for seamless deployment
- **GitHub Pages**: Use GitHub Actions for automated builds
- **Cloudflare Pages**: Connect your repository for global CDN deployment

### Automated Rebuilds

Since content is fetched at build time, you'll want to set up automated rebuilds:

1. **Webhooks**: Set up webhooks to trigger builds when you publish new content
2. **Scheduled builds**: Use cron jobs to rebuild periodically (e.g., every hour)
3. **Manual triggers**: Trigger builds manually when needed

## Customization

### Styling

The site uses Tailwind CSS for styling. Customize the design by:

1. **Colors**: Edit the color palette in `tailwind.config.js`
2. **Fonts**: Change font families in the config
3. **Components**: Modify React components in `src/components/`
4. **Layouts**: Update Astro pages in `src/pages/`

### Adding New Components

Create new AT Protocol-powered components:

1. **Collections**: Add support for new AT Protocol collections
2. **Displays**: Create custom ways to display your content
3. **Interactions**: Add new ways to interact with AT Protocol data
4. **Caching**: Extend the caching system for new data types

### Content Customization

- **Display limits**: Adjust how many items are shown in `src/config/atproto.ts`
- **Refresh rates**: Configure how often content is fetched
- **Filtering**: Add filters for content types or dates

## AT Protocol Collections

This site can display content from various AT Protocol collections:

### Supported Collections

- `com.whtwnd.blog.entry` - WhiteWind blog posts
- `app.bsky.feed.post` - Bluesky posts
- `app.bsky.feed.like` - Likes
- `app.bsky.feed.repost` - Reposts
- `app.bsky.graph.follow` - Follows
- `app.bsky.actor.profile` - Profile updates

### Adding New Collections

To add support for new AT Protocol collections:

1. **Update the client**: Add methods to `src/lib/atproto.ts`
2. **Create components**: Build React components to display the new content
3. **Update pages**: Add the new content to your pages

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production (refreshes cache first)
- `npm run preview` - Preview production build locally
- `npm run refresh-cache` - Manually refresh the AT Protocol data cache

### Project Structure

```
at-home/
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # UI components
│   │   │   ├── blog-post.tsx # Blog post display
│   │   │   ├── activity-feed.tsx # Activity feed
│   │   │   ├── profile-card.tsx # Profile display
│   │   │   └── cache-manager.tsx # Cache management UI
│   ├── data/                # Data handling
│   │   ├── cache/           # Cached AT Protocol data
│   │   ├── cache-utils.ts   # Cache utility functions
│   │   └── fetch-atproto-data.mjs # Cache refresh script
│   ├── lib/                 # Utilities
│   │   └── atproto.ts       # AT Protocol client
│   ├── config/              # Configuration
│   │   └── atproto.ts       # AT Protocol settings
│   └── pages/               # Astro pages
│       ├── index.astro      # Homepage
│       ├── blog.astro       # Blog page
│       ├── activity.astro   # Activity page
│       ├── about.astro      # About page
│       └── admin/           # Admin pages
│           └── cache.astro  # Cache management page
├── public/                  # Static assets
└── package.json
```

## Troubleshooting

### Common Issues

1. **No content showing**: Check your AT Protocol configuration
2. **Build errors**: Ensure all dependencies are installed
3. **Authentication errors**: Verify your app password if using one
4. **Rate limiting**: Use the caching system to reduce API calls
5. **Empty cache**: Run `npm run refresh-cache` to populate the cache
6. **Stale data**: Visit `/admin/cache` to refresh the cache manually

### Debug Mode

Enable debug logging by setting environment variables:

```env
DEBUG=atproto:*
```

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is open source and available under the [MIT License](LICENSE).

## Learn More

- [AT Protocol Documentation](https://atproto.com)
- [Astro Documentation](https://docs.astro.build)
- [WhiteWind](https://whitewind.app)
- [Bluesky](https://bsky.app)

## Support

If you have questions or need help:

1. Check the [AT Protocol documentation](https://atproto.com)
2. Visit the [Bluesky community](https://bsky.app)
3. Open an issue in this repository
4. Visit the `/admin/cache` page to manage your cache

## Caching System

This site uses a build-time caching system to reduce API calls and prevent rate limiting:

### How It Works

1. **Build-time Caching**: During build, data is fetched once and cached as JSON
2. **Page Load**: Pages load data from cache instead of making API calls
3. **Cache Refresh**: Cache is refreshed during builds or manually via UI/CLI
4. **Fallback Mechanism**: Falls back to direct API calls if cache is unavailable

### Managing Cache

- **Admin UI**: Visit `/admin/cache` to view and refresh cache
- **CLI**: Run `npm run refresh-cache` to refresh cache manually
- **Build Hook**: Cache is automatically refreshed during builds

---

Built with ❤️ using Astro and the AT Protocol ecosystem.