# Getting Started with AT Home

Welcome to AT Home - your personal portfolio and blog powered by the AT Protocol! This guide will help you set up and customize your decentralized website.

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- An AT Protocol account (Bluesky account works perfectly)

### Installation

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd at-home
   npm install
   ```

2. **Run the Setup Script**
   ```bash
   npm run setup
   ```
   This interactive script will guide you through the configuration process.

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Your site will be available at `http://localhost:4321`

### Manual Configuration

If you prefer to configure manually, follow these steps:

1. **Update AT Protocol Settings**
   
   Edit `src/config/atproto.ts`:
   ```typescript
   export const DEFAULT_CONFIG: ATProtoConfig = {
     service: 'https://bsky.social',
     identifier: 'your-handle.bsky.social', // Your actual handle
     handle: 'your-handle.bsky.social',     // Your actual handle
     // password: 'your-app-password',      // Optional: for authenticated requests
   };
   ```

2. **Create Environment File**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

3. **Update Site Information**
   
   Edit `astro.config.mjs` to set your site URL:
   ```javascript
   export default defineConfig({
     site: "https://your-domain.com", // Your actual domain
     // ... other config
   });
   ```

## Understanding Your AT Protocol Identity

### What You Need

1. **Handle**: Your AT Protocol identifier (e.g., `alice.bsky.social`)
2. **DID**: Your decentralized identifier (automatically resolved from handle)
3. **App Password**: Optional, for authenticated requests (create in Bluesky settings)

### Where to Find Your Information

- **Handle**: This is your Bluesky username
- **DID**: Will be automatically resolved
- **App Password**: Create in Bluesky Settings → App Passwords

## Publishing Content

### Blog Posts (WhiteWind)

1. **Using WhiteWind App**
   - Go to [whitewind.app](https://whitewind.app)
   - Sign in with your AT Protocol credentials
   - Create and publish blog posts
   - They'll automatically appear on your site

2. **Using Other Clients**
   - Any AT Protocol client that supports the `com.whtwnd.blog.entry` lexicon
   - Posts will be fetched automatically during site builds

### Social Content (Bluesky)

Your Bluesky activity will automatically appear in your activity feed:
- Posts (`app.bsky.feed.post`)
- Likes (`app.bsky.feed.like`)
- Reposts (`app.bsky.feed.repost`)
- Follows (`app.bsky.graph.follow`)

## Site Structure

### Pages

- **Home** (`/`): Overview with recent blog posts and activity
- **Blog** (`/blog`): All your blog posts from WhiteWind
- **Activity** (`/activity`): Complete activity feed from AT Protocol
- **About** (`/about`): Profile information and site details

### Components

- **BlogPost**: Displays WhiteWind blog posts
- **ActivityFeed**: Shows recent AT Protocol activity
- **Profile**: Your AT Protocol profile information
- **CollectionActivity**: Displays specific collection types

## Customization

### Styling

The site uses Tailwind CSS for styling. Key customization points:

1. **Colors**: Edit `tailwind.config.js`
2. **Fonts**: Update font imports in page headers
3. **Components**: Modify React components in `src/components/`

### Content Display

1. **Item Limits**: Configure in `src/config/atproto.ts`
2. **Collections**: Add support for new AT Protocol collections
3. **Layouts**: Customize page layouts in `src/pages/`

### Adding New Features

1. **New Collections**: 
   - Add collection support in `src/lib/atproto.ts`
   - Create display components
   - Update pages to show new content

2. **Custom Components**:
   - Create new React components in `src/components/`
   - Import and use in Astro pages

## Deployment

### Building for Production

```bash
npm run build
```

This creates static files in the `dist/` directory.

### Hosting Options

**Netlify**
```bash
# Build command: npm run build
# Publish directory: dist
```

**Vercel**
```bash
# Framework: Astro
# Build command: npm run build
# Output directory: dist
```

**GitHub Pages**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Environment Variables for Deployment

Set these in your hosting platform:

```bash
ATPROTO_SERVICE=https://bsky.social
ATPROTO_IDENTIFIER=your-handle.bsky.social
ATPROTO_HANDLE=your-handle.bsky.social
ATPROTO_PASSWORD=your-app-password  # Optional
```

## Content Updates

### Automatic Updates

Content is fetched at build time. For automatic updates:

1. **Scheduled Builds**: Set up cron jobs to rebuild periodically
2. **Webhook Triggers**: Configure webhooks to rebuild on new content
3. **Manual Triggers**: Rebuild manually when needed

### Content Caching

- Content is cached during build
- Rebuild to fetch latest content
- Consider implementing client-side refresh for real-time updates

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check your handle is correct
   - Verify app password if using one
   - Ensure credentials are properly configured

2. **No Content Showing**
   - Verify your AT Protocol handle exists
   - Check if you have published content
   - Confirm collections are accessible

3. **Build Errors**
   - Ensure all dependencies are installed
   - Check Node.js version compatibility
   - Verify configuration files are correct

### Debug Mode

Enable debug logging:
```bash
DEBUG=atproto:* npm run dev
```

### Getting Help

1. **Check Documentation**
   - [AT Protocol Docs](https://atproto.com)
   - [Astro Documentation](https://docs.astro.build)
   - [WhiteWind Guide](https://whitewind.app)

2. **Community Support**
   - Bluesky community
   - AT Protocol Discord
   - GitHub Issues

## Advanced Configuration

### Custom Collections

Add support for new AT Protocol collections:

1. **Update Client**
   ```typescript
   // src/lib/atproto.ts
   async getCustomCollection(handle?: string, limit = 50) {
     // Implementation
   }
   ```

2. **Create Components**
   ```tsx
   // src/components/CustomCollection.tsx
   export const CustomCollection = ({ records }) => {
     // Component implementation
   }
   ```

3. **Add to Pages**
   ```astro
   ---
   // src/pages/custom.astro
   const customData = await atClient.getCustomCollection();
   ---
   ```

### Performance Optimization

1. **Image Optimization**: Use Astro's image optimization
2. **Bundle Splitting**: Configure in `astro.config.mjs`
3. **Caching**: Implement appropriate caching strategies

### Security Considerations

1. **Environment Variables**: Never expose passwords in client-side code
2. **Rate Limiting**: Implement proper rate limiting
3. **Error Handling**: Graceful error handling for failed requests

## Next Steps

1. **Customize Design**: Make the site your own
2. **Add Content**: Start publishing blog posts and social content
3. **Optimize Performance**: Implement caching and optimization
4. **Deploy**: Choose a hosting platform and deploy
5. **Share**: Let others know about your decentralized website!

## Resources

- [AT Protocol](https://atproto.com) - Learn about the protocol
- [WhiteWind](https://whitewind.app) - Blogging platform
- [Bluesky](https://bsky.app) - Social platform
- [Astro](https://astro.build) - Site generator
- [Tailwind CSS](https://tailwindcss.com) - Styling framework

---

Welcome to the decentralized web! 🌐✨