import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'empty'
}) => {
  const [imageSrc, setImageSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Generate WebP source if original is PNG/JPG
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  
  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    // Fallback to original if WebP fails
    if (imageSrc.includes('.webp')) {
      setImageSrc(src);
    }
  };

  const placeholderStyle = {
    background: 'linear-gradient(45deg, #FFD700, #FF8F00)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500'
  };

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Loading placeholder */}
      {isLoading && placeholder === 'blur' && (
        <div 
          className="absolute inset-0 animate-pulse rounded"
          style={placeholderStyle}
        >
          Loading...
        </div>
      )}
      
      <picture>
        {/* WebP source for modern browsers */}
        <source 
          srcSet={webpSrc} 
          type="image/webp"
        />
        
        {/* Fallback to original format */}
        <img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            maxWidth: '100%',
            height: 'auto'
          }}
        />
      </picture>
      
      {/* Error fallback */}
      {hasError && (
        <div 
          className="absolute inset-0 rounded flex items-center justify-center text-white"
          style={placeholderStyle}
        >
          Image unavailable
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
