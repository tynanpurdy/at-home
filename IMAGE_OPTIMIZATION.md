# Image Optimization Setup

This document explains the image optimization implementation in the AT Protocol home page project.

## Overview

All images in the project use standard HTML `<img>` tags with proper optimization attributes. This approach is simple, reliable, and works well with Astro's remote image optimization through the configured `remotePatterns`.

## Approach

### For React Components (.tsx files)

React components use standard `<img>` tags with:
- Proper `width` and `height` attributes to prevent layout shift
- Descriptive `alt` text for accessibility
- Semantic CSS classes with Tailwind
- Loading optimization attributes (`loading="lazy"` or `loading="eager"`)
- Async decoding (`decoding="async"`)
- Explicit dimensions for external images

### For Astro Files (.astro files)

Astro files can use either:
- Standard `<img>` tags for external images
- Astro's `Image` component from `astro:assets` for local images

## Configuration

### Astro Config

The `astro.config.mjs` includes image optimization settings:

```javascript
image: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "*.bsky.app",
    },
    {
      protocol: "https",
      hostname: "*.atproto.com",
    },
    {
      protocol: "https",
      hostname: "avatars.githubusercontent.com",
    },
    {
      protocol: "https",
      hostname: "cdn.bsky.app",
    },
  ],
}
```

This allows optimization of images from AT Protocol domains including Bluesky app domains.

## Updated Components

The following components use optimized image tags:

1. **Profile.tsx** - Avatar and banner images
2. **BlogPost.tsx** - Author avatars
3. **ActivityFeed.tsx** - User avatars in activity items
4. **CollectionActivity.tsx** - Author avatars in collection items

## Best Practices

### For Profile Images
```tsx
<img
  src={user.avatar}
  alt={`${user.displayName || user.handle} avatar`}
  className="w-12 h-12 rounded-full object-cover"
  width={48}
  height={48}
  loading="lazy"
  decoding="async"
/>
```

### For Banner Images
```tsx
<img
  src={profile.banner}
  alt="Profile banner"
  className="w-full h-full object-cover"
  width={800}
  height={192}
  loading="eager"
  decoding="async"
/>
```

### For Content Images
```tsx
<img
  src={post.image}
  alt={post.imageAlt || "Post image"}
  className="rounded-lg"
  width={600}
  height={400}
  loading="lazy"
  decoding="async"
/>
```

## Performance Benefits

- **Proper sizing**: Images include width/height attributes to prevent layout shift
- **Lazy loading**: Non-critical images load only when needed
- **Async decoding**: Images decode asynchronously for better performance
- **Semantic markup**: Descriptive alt text for accessibility and SEO
- **CSS optimization**: Tailwind classes for responsive design
- **External optimization**: Astro's remotePatterns enable optimization of external images

## Key Attributes

Every image should include:

1. **`src`** - The image URL
2. **`alt`** - Descriptive alternative text
3. **`width`** and **`height`** - Explicit dimensions to prevent layout shift
4. **`className`** - CSS classes for styling
5. **`loading`** - Loading behavior (`lazy` for below-fold, `eager` for above-fold)
6. **`decoding`** - Async decoding for better performance (`async`)

## Testing

To verify image optimization is working:

1. Check that all images have proper `width` and `height` attributes
2. Verify alt text is descriptive and meaningful
3. Test responsive behavior across different screen sizes
4. Check for layout shift issues using browser dev tools
5. Verify lazy loading is working for below-fold images
6. Check that the Astro audit passes without image warnings

## Error Handling

Images handle errors gracefully through:

1. **Fallback content**: Default avatars or placeholder content when images fail
2. **Graceful degradation**: Failed images don't break layout
3. **Semantic markup**: Screen readers can understand image purpose through alt text
4. **Proper dimensions**: Layout remains stable even if images fail to load

## Future Enhancements

Potential improvements to consider:

1. **Responsive images**: Use `srcset` for different screen densities
2. **Progressive loading**: Show low-quality images while high-quality loads
3. **CDN integration**: Use image CDN for additional optimization
4. **Local image optimization**: Use Astro's Image component for local assets
5. **Preloading**: Preload critical images for faster initial loads