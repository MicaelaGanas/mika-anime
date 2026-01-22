"use client"

import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string | undefined;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export default function LazyImage({ src, alt, className = "", fallback }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  if (!src || hasError) {
    return fallback || (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center text-xs text-gray-500">
        No cover
      </div>
    );
  }

  return (
    <div ref={imgRef} className="w-full h-full relative">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-900 animate-pulse" />
      )}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
