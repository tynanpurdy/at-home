import React from "react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  priority?: boolean;
  placeholder?: "blur" | "empty";
  quality?: number;
  format?: "webp" | "avif" | "auto";
  sizes?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = "",
  width,
  height,
  loading = "lazy",
  priority = false,
  placeholder = "empty",
  quality = 80,
  format = "auto",
  sizes,
  style,
  onLoad,
  onError,
  fallbackSrc,
}) => {
  // Generate optimized image URL with query parameters
  const generateOptimizedSrc = (originalSrc: string): string => {
    // If it's already an external URL or data URL, return as-is
    if (originalSrc.startsWith("http") || originalSrc.startsWith("data:")) {
      return originalSrc;
    }

    // For local images, we can add optimization parameters
    const params = new URLSearchParams();

    if (width) params.set("w", width.toString());
    if (height) params.set("h", height.toString());
    if (quality && quality !== 80) params.set("q", quality.toString());
    if (format && format !== "auto") params.set("f", format);

    const queryString = params.toString();
    return queryString ? `${originalSrc}?${queryString}` : originalSrc;
  };

  // Generate srcset for responsive images
  const generateSrcSet = (originalSrc: string): string | undefined => {
    if (!width || originalSrc.startsWith("data:")) return undefined;

    const srcsetEntries = [];
    const multipliers = [1, 1.5, 2, 3];

    for (const multiplier of multipliers) {
      const scaledWidth = Math.round(width * multiplier);
      const params = new URLSearchParams();
      params.set("w", scaledWidth.toString());
      if (height) params.set("h", Math.round(height * multiplier).toString());
      if (quality && quality !== 80) params.set("q", quality.toString());
      if (format && format !== "auto") params.set("f", format);

      const queryString = params.toString();
      const scaledSrc = queryString
        ? `${originalSrc}?${queryString}`
        : originalSrc;
      srcsetEntries.push(`${scaledSrc} ${multiplier}x`);
    }

    return srcsetEntries.join(", ");
  };

  const optimizedSrc = generateOptimizedSrc(src);
  const srcSet = generateSrcSet(src);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (fallbackSrc && e.currentTarget.src !== fallbackSrc) {
      e.currentTarget.src = fallbackSrc;
    } else {
      onError?.();
    }
  };

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={priority ? "eager" : loading}
      srcSet={srcSet}
      sizes={sizes}
      style={style}
      onLoad={onLoad}
      onError={handleError}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
};

export default OptimizedImage;
