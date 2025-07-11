# Image Optimization Setup

This document explains the image optimization implementation in the AT Protocol home page project.

## Overview

All images in the project have been updated to use optimized image components that provide:
- Automatic format conversion (WebP/AVIF when supported)
- Responsive image generation with srcset
- Lazy loading by default
- Error handling with fallback images
- Loading states and blur placeholders

## Components

### OptimizedImage (React Components)

Used in `.tsx` React components for dynamic images like avatars and banners.

**Location**: `src/components/OptimizedImage.tsx`

**Features**:
- Automatic srcset generation for different pixel densities
- Quality optimization (default 80%)
- Format conversion support
- Error handling with fallback images
- Lazy loading by default
- Full opacity display (no loading state dimming)

**Usage**:
```tsx
import OptimizedImage from './OptimizedImage';

<OptimizedImage
  src={profile.avatar}
  alt="User avatar"
  width={64}
  height={64}
  className="rounded-full"
  priority={false} // or true for above-the-fold images
  fallbackSrc="/default-avatar.png"
  quality={80}
  loading="lazy"
/>
```

### AstroImage (Astro Files)

Used in `.astro` files for both local and remote images.

**Location**: `src/components/AstroImage.astro`

**Features**:
- Automatic detection of local vs remote images
- Uses Astro's built-in Image component for local images
- Optimized handling of external images
- Format conversion and quality optimization

**Usage**:
```astro
---
import AstroImage from '../components/AstroImage.astro';
---

<AstroImage
  src="/local-image.jpg"
  alt="Local image"
  width={800}
  height={600}
  class="rounded-lg"
  loading="lazy"
/>
```

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

This allows optimization of images from AT Protocol domains including Bluesky app domains, which is necessary for AT Protocol avatar and banner images.

## Updated Components

The following components have been updated to use optimized images:

1. **Profile.tsx** - Avatar and banner images
2. **BlogPost.tsx** - Author avatars
3. **ActivityFeed.tsx** - User avatars in activity items
4. **CollectionActivity.tsx** - Author avatars in collection items

## Performance Benefits

- **Reduced bandwidth**: Images are served in optimal formats (WebP/AVIF)
- **Faster loading**: Lazy loading and responsive images
- **Better UX**: Error handling with fallback images
- **SEO friendly**: Proper alt text and semantic markup
- **Full opacity**: No loading state dimming for immediate visual clarity

## Best Practices

### For Profile Images
```tsx
<OptimizedImage
  src={user.avatar}
  alt={`${user.displayName || user.handle} avatar`}
  width={64}
  height={64}
  className="rounded-full"
  fallbackSrc="/default-avatar.png"
/>
```

### For Banner Images
```tsx
<OptimizedImage
  src={profile.banner}
  alt="Profile banner"
  width={800}
  height={200}
  className="w-full h-full object-cover"
  priority={true} // Above the fold
  loading="eager"
/>
```

### For Content Images
```tsx
<OptimizedImage
  src={post.image}
  alt={post.imageAlt || "Post image"}
  width={600}
  height={400}
  className="rounded-lg"
  sizes="(max-width: 768px) 100vw, 600px"
/>
```

## Error Handling

All image components include error handling:

1. **Fallback images**: If primary image fails, fallback is shown
2. **Graceful degradation**: Failed images don't break layout
3. **Immediate display**: Images show at full opacity without loading dimming

## Testing

To verify image optimization is working:

1. Check Network tab in browser dev tools
2. Verify WebP/AVIF formats are being served
3. Test on different screen densities
4. Verify lazy loading behavior

## Future Enhancements

Potential improvements to consider:

1. **Blur placeholders**: Generate blur data URLs for smoother loading
2. **Preloading**: Implement image preloading for critical images
3. **Progressive loading**: Show low-quality images while high-quality loads
4. **CDN integration**: Use image CDN for additional optimization
5. **Loading states**: Add optional loading indicators for slow connections