import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : placeholder);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Load actual image when in view
  useEffect(() => {
    if (isInView && currentSrc === placeholder) {
      const img = new Image();
      img.onload = () => {
        setCurrentSrc(src);
        setIsLoaded(true);
      };
      img.src = src;
    }
  }, [isInView, src, currentSrc, placeholder]);

  // Generate responsive srcSet for different screen sizes
  const generateSrcSet = (originalSrc: string) => {
    if (!originalSrc || originalSrc === placeholder) return '';
    
    // For Pexels images, generate different sizes
    if (originalSrc.includes('pexels.com')) {
      const baseUrl = originalSrc.split('?')[0];
      return `
        ${baseUrl}?auto=compress&cs=tinysrgb&w=400 400w,
        ${baseUrl}?auto=compress&cs=tinysrgb&w=800 800w,
        ${baseUrl}?auto=compress&cs=tinysrgb&w=1200 1200w
      `.trim();
    }
    
    return '';
  };

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      srcSet={generateSrcSet(currentSrc)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      alt={alt}
      width={width}
      height={height}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-70'
      } ${className}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      style={{
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    />
  );
};

export default OptimizedImage;