import { useState, useEffect, useRef } from 'react';
import { usePerformanceConfig } from '../config/usePerformanceConfig';

/**
 * 📱 Progressive Image Loading Hook
 * 
 * Optimizes image loading for mobile devices with:
 * - Progressive loading (thumbnail → full quality)
 * - Lazy loading support
 * - Network-aware loading strategies
 * - Memory-efficient preloading
 * 
 * @param {string} src - Image source URL
 * @param {Object} options - Loading options
 * @returns {Object} Image loading state and utilities
 */
export const useProgressiveImage = (src, options = {}) => {
  const { 
    performanceConfig, 
    isMobile, 
    isLowEndDevice,
    connectionSpeed 
  } = usePerformanceConfig();

  const [imgSrc, setImgSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const loadingRef = useRef(false);
  const imageRef = useRef(null);

  const {
    placeholderSrc = null,
    enableLazyLoad = performanceConfig.lazyLoadImages,
    lowQualityFirst = connectionSpeed === 'slow',
    enableProgressiveLoading = isMobile,
    quality = isLowEndDevice ? 'low' : 'high'
  } = options;

  // Generate different quality versions of the image
  const getImageVariants = (originalSrc) => {
    if (!originalSrc) return [];

    const variants = [];

    // Add placeholder if provided
    if (placeholderSrc) {
      variants.push({ src: placeholderSrc, quality: 'placeholder', size: 'small' });
    }

    // For car images, try to generate thumbnail version first
    if (lowQualityFirst && originalSrc.includes('csm_')) {
      const thumbSrc = originalSrc.replace('csm_', 'thumb_');
      variants.push({ src: thumbSrc, quality: 'low', size: 'thumbnail' });
    }

    // Add the original full-quality image
    variants.push({ src: originalSrc, quality: 'high', size: 'full' });

    return variants;
  };

  // Progressive loading function
  const loadImageProgressively = async (variants) => {
    let loadedSrc = null;
    setLoadingProgress(0);

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      
      try {
        setLoadingProgress((i / variants.length) * 100);
        
        // Create new image element for loading
        const img = new Image();
        imageRef.current = img;
        
        // Configure image loading based on device capability
        if (isMobile) {
          // On mobile, don't set crossOrigin unless necessary
          img.decoding = 'async';
          img.loading = enableLazyLoad ? 'lazy' : 'eager';
        }
        
        // Promise-based image loading
        await new Promise((resolve, reject) => {
          img.onload = () => {
            setImgSrc(variant.src);
            loadedSrc = variant.src;
            
            // Only set as fully loaded when we have the final image
            if (i === variants.length - 1) {
              setIsLoaded(true);
              setLoadingProgress(100);
            }
            
            resolve();
          };
          
          img.onerror = () => {
            console.warn(`Failed to load image variant: ${variant.src}`);
            reject(new Error(`Failed to load ${variant.quality} quality image`));
          };
          
          // Start loading
          img.src = variant.src;
        });
        
        // Add delay between loads on slow connections to prevent overwhelming
        if (connectionSpeed === 'slow' && i < variants.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
      } catch (loadError) {
        console.warn(`Error loading image variant ${i}:`, loadError);
        
        // If this is the final variant and it failed, set error
        if (i === variants.length - 1) {
          setError(loadError.message);
        }
        
        // Continue to next variant
        continue;
      }
    }
    
    return loadedSrc;
  };

  // Main loading effect
  useEffect(() => {
    if (!src) {
      setImgSrc(null);
      setIsLoaded(false);
      setError(null);
      return;
    }

    // Prevent multiple simultaneous loads
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    const variants = getImageVariants(src);
    
    // Load images progressively
    loadImageProgressively(variants)
      .then((finalSrc) => {
        if (finalSrc) {
          console.log(`✅ Progressive image loading completed: ${finalSrc}`);
        }
      })
      .catch((loadError) => {
        console.error('Progressive image loading failed:', loadError);
        setError(loadError.message);
      })
      .finally(() => {
        setIsLoading(false);
        loadingRef.current = false;
      });

    // Cleanup function
    return () => {
      loadingRef.current = false;
      if (imageRef.current) {
        imageRef.current.onload = null;
        imageRef.current.onerror = null;
        imageRef.current = null;
      }
    };
  }, [src, lowQualityFirst, enableLazyLoad, connectionSpeed, isMobile]);

  // Preload function for galleries
  const preloadImage = (imageSrc) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => resolve(imageSrc);
      img.onerror = () => reject(new Error(`Failed to preload: ${imageSrc}`));
      
      // Configure for mobile
      if (isMobile) {
        img.decoding = 'async';
      }
      
      img.src = imageSrc;
    });
  };

  // Batch preload for galleries with mobile optimization
  const preloadImages = async (imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) return [];

    // Limit concurrent preloads based on device capability
    const concurrencyLimit = performanceConfig.imagePreloadLimit || (isMobile ? 2 : 5);
    const results = [];
    
    for (let i = 0; i < imageUrls.length; i += concurrencyLimit) {
      const batch = imageUrls.slice(i, i + concurrencyLimit);
      
      try {
        const batchResults = await Promise.allSettled(
          batch.map(url => preloadImage(url))
        );
        
        results.push(...batchResults);
        
        // Add delay between batches on mobile to prevent overwhelming
        if (isMobile && i + concurrencyLimit < imageUrls.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (batchError) {
        console.warn('Batch preload error:', batchError);
      }
    }
    
    const successful = results.filter(result => result.status === 'fulfilled').length;
    console.log(`📊 Preloaded ${successful}/${imageUrls.length} images`);
    
    return results;
  };

  return { 
    imgSrc: imgSrc || placeholderSrc, 
    isLoaded, 
    isLoading, 
    error,
    loadingProgress,
    isMobile,
    
    // Utility functions
    preloadImage,
    preloadImages,
    
    // Performance info
    performanceConfig,
    quality,
    enableLazyLoad
  };
};

export default useProgressiveImage;