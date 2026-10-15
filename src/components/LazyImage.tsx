import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  rootMargin?: string;
  threshold?: number;
  fallbackSrc?: string;
  wrapperClassName?: string;
}

export default function LazyImage({
  src,
  alt,
  className = '',
  placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWExYTFhIi8+PC9zdmc+',
  rootMargin = '200px 0px',
  threshold = 0.01,
  fallbackSrc = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  wrapperClassName = '',
  style,
  onLoad,
  onError,
  ...restProps
}: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>(placeholderSrc);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If IntersectionObserver isn't supported, fallback immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (containerRef.current) {
              observer.unobserve(containerRef.current);
            }
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  useEffect(() => {
    if (isVisible && src) {
      setCurrentSrc(src);
    }
  }, [isVisible, src]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    if (onError) onError(e);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-[#10121a] ${wrapperClassName}`}
      style={style}
    >
      {/* Skeleton Shimmer Background while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 animate-pulse z-0" />
      )}

      {isVisible && (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full object-cover transition-all duration-700 ${
            isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-md scale-105'
          } ${className}`}
          {...restProps}
        />
      )}
    </div>
  );
}
