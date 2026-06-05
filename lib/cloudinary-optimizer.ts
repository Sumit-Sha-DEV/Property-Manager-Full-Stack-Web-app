/**
 * Cloudinary URL Optimizer
 * Generates optimized image URLs with automatic quality, format, and sizing
 */

interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number; // 'auto' for automatic quality optimization
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  fit?: 'fill' | 'max' | 'scale' | 'crop';
  gravity?: string;
}

/**
 * Build optimized Cloudinary image URL
 * Automatic format detection + quality optimization
 * Supports responsive sizing with srcSet generation
 */
export function optimizeCloudinaryImage(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  if (!originalUrl || !originalUrl.includes('res.cloudinary.com')) {
    return originalUrl;
  }

  const {
    width,
    height,
    quality = 'auto', // Automatically optimize quality
    format = 'auto', // Automatically choose best format
    fit = 'fill',
    gravity = 'auto',
  } = options;

  // Extract Cloudinary path components
  const url = new URL(originalUrl);
  const pathParts = url.pathname.split('/upload/');

  if (pathParts.length !== 2) return originalUrl;

  const [baseUrl, imagePath] = pathParts;

  // Build transformation parameters
  const transformations: string[] = [];

  // Add width optimization
  if (width) {
    transformations.push(`w_${width}`);
  }

  // Add height optimization
  if (height) {
    transformations.push(`h_${height}`);
  }

  // Add fit mode
  transformations.push(`c_${fit}`);

  // Add gravity for better cropping
  if (gravity) {
    transformations.push(`g_${gravity}`);
  }

  // Add quality optimization (auto = smart quality based on device)
  if (quality === 'auto') {
    transformations.push('q_auto');
  } else if (typeof quality === 'number') {
    transformations.push(`q_${quality}`);
  }

  // Add format optimization (auto = best format for browser)
  if (format === 'auto') {
    transformations.push('f_auto');
  } else {
    transformations.push(`f_${format}`);
  }

  // Add DPR (device pixel ratio) for retina displays
  transformations.push('dpr_auto');

  // Construct optimized URL
  const transformationString = transformations.join(',');
  return `${url.origin}${baseUrl}/upload/${transformationString}/${imagePath}`;
}

/**
 * Generate responsive srcSet for images
 * Used for <img srcSet> attributes
 */
export function generateImageSrcSet(
  originalUrl: string,
  maxWidth: number = 1200
): string {
  if (!originalUrl || !originalUrl.includes('res.cloudinary.com')) {
    return originalUrl;
  }

  // Generate sizes for common breakpoints
  const sizes = [256, 384, 512, 768, 1024, 1280, 1536, 2048];
  const relevantSizes = sizes.filter((s) => s <= maxWidth);

  const srcSetArray = relevantSizes.map((size) => {
    const optimizedUrl = optimizeCloudinaryImage(originalUrl, {
      width: size,
      quality: 'auto',
      format: 'auto',
    });
    return `${optimizedUrl} ${size}w`;
  });

  return srcSetArray.join(', ');
}

/**
 * Get optimized image URL for thumbnails (aggressive compression)
 */
export function getThumbnailUrl(
  originalUrl: string,
  size: number = 150
): string {
  return optimizeCloudinaryImage(originalUrl, {
    width: size,
    height: size,
    fit: 'crop',
    quality: 80,
    format: 'auto',
  });
}

/**
 * Get optimized hero image URL (high quality)
 */
export function getHeroImageUrl(originalUrl: string): string {
  return optimizeCloudinaryImage(originalUrl, {
    width: 1920,
    quality: 'auto',
    format: 'auto',
    fit: 'fill',
  });
}

/**
 * Get optimized card image URL (balanced quality)
 */
export function getCardImageUrl(originalUrl: string): string {
  return optimizeCloudinaryImage(originalUrl, {
    width: 600,
    height: 400,
    quality: 'auto',
    format: 'auto',
    fit: 'fill',
    gravity: 'auto',
  });
}

/**
 * Get video thumbnail URL from Cloudinary video
 */
export function getVideoThumbnailUrl(
  videoUrl: string,
  options: { width?: number; height?: number } = {}
): string {
  if (!videoUrl || !videoUrl.includes('res.cloudinary.com')) {
    return '';
  }

  const { width = 400, height = 300 } = options;

  // Replace video transformation with image transformation
  const url = new URL(videoUrl);
  const pathParts = url.pathname.split('/upload/');

  if (pathParts.length !== 2) return videoUrl;

  const [baseUrl, imagePath] = pathParts;

  // Swap video extension (e.g. .mp4, .webm) for .jpg to force image thumbnail delivery
  const thumbnailPath = imagePath.replace(/\.[^/.]+$/, '.jpg');

  // Generate video thumbnail with optimizations
  const transformations = [
    'c_fill',
    `w_${width}`,
    `h_${height}`,
    'g_auto',
    'q_auto',
    'f_auto',
    'dpr_auto',
  ];

  return `${url.origin}${baseUrl.replace('/video', '/image')}/upload/${transformations.join(',')}/${thumbnailPath}`;
}

/**
 * Preload critical images (for performance)
 * Returns link tag HTML string to inject in head
 */
export function getImagePreloadTag(imageUrl: string, as: 'image' = 'image'): string {
  const optimizedUrl = optimizeCloudinaryImage(imageUrl, {
    width: 1200,
    quality: 'auto',
    format: 'auto',
  });

  const srcSet = generateImageSrcSet(imageUrl, 1200);

  return `<link rel="preload" as="${as}" href="${optimizedUrl}" imagesrcset="${srcSet}" />`;
}
