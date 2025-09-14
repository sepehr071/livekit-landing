import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { usePerformanceConfig } from '../config/usePerformanceConfig';
import { useCSSOptimization } from '../utils/cssUtils';
import { useProgressiveImage } from '../hooks/useProgressiveImage';
import { useMemoryManagement } from '../hooks/useMemoryManagement';

const ImageSlider = ({
  images = [],
  title = '',
  description = '',
  onClose = () => {},
  currentIndex = 0,
  onIndexChange = () => {}
}) => {
  // Performance configuration
  const {
    performanceConfig,
    isMobile,
    isLowEndDevice
  } = usePerformanceConfig();
  
  // CSS optimization utilities
  const {
    getOptimizedClasses,
    getPerformanceClass,
    getTransitionDuration,
    getShadow,
    getBackdropBlur
  } = useCSSOptimization();
  
  // Memory management for image cleanup
  const { addCleanupTask, checkMemoryUsage } = useMemoryManagement();
  
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [leftFlash, setLeftFlash] = useState(false);
  const [rightFlash, setRightFlash] = useState(false);
  const [preloadedImages, setPreloadedImages] = useState(new Set());
  
  const autoSlideIntervalRef = useRef(null);
  const sliderRef = useRef(null);
  const imageRefs = useRef(new Map());

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    setIsLoading(true);
    // Reset loading state when images change
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [images]);

  // Performance-optimized auto-slide functionality
  useEffect(() => {
    if (images.length <= 1 || !isAutoPlaying || isPaused) {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
      }
      return;
    }

    // Adjust slide interval based on device performance
    const slideInterval = isMobile ? (isLowEndDevice ? 4000 : 3000) : 2500;

    autoSlideIntervalRef.current = setInterval(() => {
      // Use requestAnimationFrame for smoother transitions on mobile
      if (isMobile) {
        requestAnimationFrame(() => {
          setActiveIndex(prevIndex => {
            const newIndex = prevIndex === images.length - 1 ? 0 : prevIndex + 1;
            // Delay onIndexChange to avoid setState during render
            setTimeout(() => onIndexChange(newIndex), 0);
            return newIndex;
          });
        });
      } else {
        setActiveIndex(prevIndex => {
          const newIndex = prevIndex === images.length - 1 ? 0 : prevIndex + 1;
          setTimeout(() => onIndexChange(newIndex), 0);
          return newIndex;
        });
      }
    }, slideInterval);

    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
      }
    };
  }, [images.length, isAutoPlaying, isPaused, onIndexChange, isMobile, isLowEndDevice]);

  // Memory management for images
  useEffect(() => {
    // Add cleanup task for image references
    addCleanupTask(() => {
      imageRefs.current.clear();
      setPreloadedImages(new Set());
      console.log('🧹 Cleaned up image slider references');
    }, 'ImageSlider cleanup');

    return () => {
      // Cleanup on unmount
      imageRefs.current.clear();
    };
  }, [addCleanupTask]);

  // Progressive image preloading for mobile optimization
  useEffect(() => {
    if (!images.length || isLowEndDevice) return;

    const preloadLimit = performanceConfig.imagePreloadLimit || 3;
    const imagesToPreload = images.slice(0, preloadLimit);

    const preloadImages = async () => {
      const newPreloaded = new Set(preloadedImages);
      
      for (const imageSrc of imagesToPreload) {
        if (!newPreloaded.has(imageSrc)) {
          try {
            const img = new Image();
            img.decoding = 'async';
            
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = imageSrc;
            });
            
            newPreloaded.add(imageSrc);
            imageRefs.current.set(imageSrc, img);
            
            // Add small delay between preloads on mobile
            if (isMobile) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          } catch (error) {
            console.warn('Failed to preload image:', imageSrc);
          }
        }
      }
      
      setPreloadedImages(newPreloaded);
    };

    preloadImages();
  }, [images, performanceConfig.imagePreloadLimit, isMobile, isLowEndDevice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
      }
    };
  }, []);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const goToPrevious = () => {
    // Trigger flash effect (reduced duration on mobile)
    setLeftFlash(true);
    setTimeout(() => setLeftFlash(false), isMobile ? 150 : 200);
    
    // Pause auto-slide when user manually navigates
    setIsPaused(true);
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    
    // Use requestAnimationFrame for smoother updates on mobile
    if (isMobile) {
      requestAnimationFrame(() => {
        setActiveIndex(newIndex);
        setTimeout(() => onIndexChange(newIndex), 0);
      });
    } else {
      setActiveIndex(newIndex);
      setTimeout(() => onIndexChange(newIndex), 0);
    }
    
    // Resume auto-slide after device-appropriate delay
    const resumeDelay = isMobile ? 3000 : 5000;
    setTimeout(() => setIsPaused(false), resumeDelay);
  };

  const goToNext = () => {
    // Trigger flash effect (reduced duration on mobile)
    setRightFlash(true);
    setTimeout(() => setRightFlash(false), isMobile ? 150 : 200);
    
    // Pause auto-slide when user manually navigates
    setIsPaused(true);
    const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    
    // Use requestAnimationFrame for smoother updates on mobile
    if (isMobile) {
      requestAnimationFrame(() => {
        setActiveIndex(newIndex);
        setTimeout(() => onIndexChange(newIndex), 0);
      });
    } else {
      setActiveIndex(newIndex);
      setTimeout(() => onIndexChange(newIndex), 0);
    }
    
    // Resume auto-slide after device-appropriate delay
    const resumeDelay = isMobile ? 3000 : 5000;
    setTimeout(() => setIsPaused(false), resumeDelay);
  };

  const handleImageError = (index) => {
    console.error('🚫 Image failed to load:', images[index]);
    setImageErrors(prev => ({ ...prev, [index]: true }));
    setIsLoading(false);
  };

  const handleImageLoad = (index) => {
    console.log('✅ Image loaded successfully:', images[index]);
    setImageErrors(prev => ({ ...prev, [index]: false }));
    setIsLoading(false);
  };

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
    <div
      ref={sliderRef}
      className={getOptimizedClasses(
        "relative w-full h-96 md:h-[500px] lg:h-[600px] bg-transparent rounded-lg overflow-hidden",
        "relative w-full h-80 md:h-96 bg-transparent rounded-lg overflow-hidden mobile-optimized"
      )}
      onMouseEnter={!isMobile ? handleMouseEnter : undefined}
      onMouseLeave={!isMobile ? handleMouseLeave : undefined}
      onTouchStart={isMobile ? handleMouseEnter : undefined}
      onTouchEnd={isMobile ? handleMouseLeave : undefined}
    >
      {/* PERFORMANCE-OPTIMIZED IMAGE DISPLAY */}
      <div className={getOptimizedClasses(
        "relative w-full h-full bg-gray-50 rounded-lg",
        "relative w-full h-full bg-gray-50 rounded-lg hardware-accelerated"
      )}>
        <img
          src={images[activeIndex]}
          alt={`Car ${activeIndex + 1}`}
          className={getOptimizedClasses(
            `w-full transition-all ${getTransitionDuration('500')}`,
            `w-full transition-opacity ${getTransitionDuration('300')} mobile-optimized`
          )}
          onLoad={() => handleImageLoad(activeIndex)}
          onError={() => handleImageError(activeIndex)}
          loading={performanceConfig.lazyLoadImages ? 'lazy' : 'eager'}
          decoding="async"
          style={{
            display: 'block',
            opacity: 1,
            visibility: 'visible',
            // Mobile-specific optimizations
            imageRendering: isMobile ? 'optimizeSpeed' : 'auto',
            willChange: 'opacity'
          }}
        />

        {imageErrors[activeIndex] && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">🚗</div>
              <p className="text-sm">Image not available</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation arrows - Performance optimized and touch-friendly */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={getOptimizedClasses(
              `absolute left-4 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-full bg-white hover:bg-gray-100 ${getShadow('xl')} border-2 border-gray-300 transition-all ${getTransitionDuration('200')} group ${
                leftFlash ? 'scale-125 bg-blue-500 border-blue-400' : ''
              }`,
              `absolute left-2 top-1/2 transform -translate-y-1/2 z-50 p-4 rounded-full bg-white ${getShadow('lg')} border-2 border-gray-300 transition-colors ${getTransitionDuration('150')} ${
                leftFlash ? 'bg-blue-500 border-blue-400' : ''
              } mobile-optimized`
            )}
            aria-label="Previous image"
            style={{
              // Larger touch target on mobile
              minWidth: isMobile ? '48px' : '44px',
              minHeight: isMobile ? '48px' : '44px'
            }}
          >
            <ChevronLeft
              size={isMobile ? 28 : 24}
              className={getOptimizedClasses(
                `transition-all ${getTransitionDuration('200')} ${
                  leftFlash ? 'text-white scale-110' : 'text-gray-700 group-hover:text-gray-900'
                }`,
                `transition-colors ${getTransitionDuration('150')} ${
                  leftFlash ? 'text-white' : 'text-gray-700'
                }`
              )}
            />
          </button>
          
          <button
            onClick={goToNext}
            className={getOptimizedClasses(
              `absolute right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-full bg-white hover:bg-gray-100 ${getShadow('xl')} border-2 border-gray-300 transition-all ${getTransitionDuration('200')} group ${
                rightFlash ? 'scale-125 bg-blue-500 border-blue-400' : ''
              }`,
              `absolute right-2 top-1/2 transform -translate-y-1/2 z-50 p-4 rounded-full bg-white ${getShadow('lg')} border-2 border-gray-300 transition-colors ${getTransitionDuration('150')} ${
                rightFlash ? 'bg-blue-500 border-blue-400' : ''
              } mobile-optimized`
            )}
            aria-label="Next image"
            style={{
              // Larger touch target on mobile
              minWidth: isMobile ? '48px' : '44px',
              minHeight: isMobile ? '48px' : '44px'
            }}
          >
            <ChevronRight
              size={isMobile ? 28 : 24}
              className={getOptimizedClasses(
                `transition-all ${getTransitionDuration('200')} ${
                  rightFlash ? 'text-white scale-110' : 'text-gray-700 group-hover:text-gray-900'
                }`,
                `transition-colors ${getTransitionDuration('150')} ${
                  rightFlash ? 'text-white' : 'text-gray-700'
                }`
              )}
            />
          </button>
        </>
      )}

      {/* Auto-slide indicator - Performance optimized */}
      {images.length > 1 && isAutoPlaying && !isPaused && !isLowEndDevice && (
        <div className="absolute bottom-3 left-3 z-20">
          <div className={getOptimizedClasses(
            `flex items-center space-x-1 bg-black/20 px-2 py-1 rounded-full ${getBackdropBlur('sm')}`,
            "flex items-center space-x-1 bg-black/30 px-2 py-1 rounded-full"
          )}>
            <div className={`w-1 h-1 bg-white/60 rounded-full ${
              performanceConfig.reducedAnimations ? '' : 'animate-pulse'
            }`}></div>
            <span className="text-white/60 text-xs">Auto</span>
          </div>
        </div>
      )}

      {/* Accessibility navigation */}
      <div className="sr-only" role="status" aria-live="polite">
        Car image {activeIndex + 1} of {images.length}
        {isAutoPlaying && !isPaused ? ' - Auto-sliding' : ''}
      </div>
    </div>
  );
};

export default ImageSlider;