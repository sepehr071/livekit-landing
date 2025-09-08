import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const ImageSlider = ({
  images = [],
  title = '',
  description = '',
  onClose = () => {},
  currentIndex = 0,
  onIndexChange = () => {}
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [leftFlash, setLeftFlash] = useState(false);
  const [rightFlash, setRightFlash] = useState(false);
  
  const autoSlideIntervalRef = useRef(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    setIsLoading(true);
    // Reset loading state when images change
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [images]);

  // Auto-slide functionality
  useEffect(() => {
    if (images.length <= 1 || !isAutoPlaying || isPaused) {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
      }
      return;
    }

    autoSlideIntervalRef.current = setInterval(() => {
      setActiveIndex(prevIndex => {
        const newIndex = prevIndex === images.length - 1 ? 0 : prevIndex + 1;
        // Delay onIndexChange to avoid setState during render
        setTimeout(() => onIndexChange(newIndex), 0);
        return newIndex;
      });
    }, 2500); // 2500ms interval

    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current);
      }
    };
  }, [images.length, isAutoPlaying, isPaused, onIndexChange]);

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
    // Trigger flash effect
    setLeftFlash(true);
    setTimeout(() => setLeftFlash(false), 200);
    
    // Pause auto-slide when user manually navigates
    setIsPaused(true);
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    
    // Call onIndexChange in next tick to avoid setState during render
    setTimeout(() => onIndexChange(newIndex), 0);
    
    // Resume auto-slide after 5 seconds
    setTimeout(() => setIsPaused(false), 5000);
  };

  const goToNext = () => {
    // Trigger flash effect
    setRightFlash(true);
    setTimeout(() => setRightFlash(false), 200);
    
    // Pause auto-slide when user manually navigates
    setIsPaused(true);
    const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(newIndex);
    
    // Call onIndexChange in next tick to avoid setState during render
    setTimeout(() => onIndexChange(newIndex), 0);
    
    // Resume auto-slide after 5 seconds
    setTimeout(() => setIsPaused(false), 5000);
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
      className="relative w-full h-96 md:h-[500px] lg:h-[600px] bg-transparent rounded-lg overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* CLEAN IMAGE DISPLAY - FIXED CSS */}
      <div className="relative w-full h-full bg-gray-50 rounded-lg">
        <img
          src={images[activeIndex]}
          alt={`Car ${activeIndex + 1}`}
          className="w-full transition-all duration-500"
          onLoad={() => handleImageLoad(activeIndex)}
          onError={() => handleImageError(activeIndex)}
          style={{
            display: 'block',
            opacity: 1,
            visibility: 'visible'
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

      {/* Navigation arrows - visible when multiple images */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-full bg-white hover:bg-gray-100 shadow-xl border-2 border-gray-300 transition-all duration-200 group ${
              leftFlash ? 'scale-125 bg-blue-500 border-blue-400' : ''
            }`}
            aria-label="Previous image"
          >
            <ChevronLeft size={24} className={`transition-all duration-200 ${
              leftFlash ? 'text-white scale-110' : 'text-gray-700 group-hover:text-gray-900'
            }`} />
          </button>
          
          <button
            onClick={goToNext}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-50 p-3 rounded-full bg-white hover:bg-gray-100 shadow-xl border-2 border-gray-300 transition-all duration-200 group ${
              rightFlash ? 'scale-125 bg-blue-500 border-blue-400' : ''
            }`}
            aria-label="Next image"
          >
            <ChevronRight size={24} className={`transition-all duration-200 ${
              rightFlash ? 'text-white scale-110' : 'text-gray-700 group-hover:text-gray-900'
            }`} />
          </button>
        </>
      )}

      {/* Auto-slide indicator - subtle flash when auto-advancing */}
      {images.length > 1 && isAutoPlaying && !isPaused && (
        <div className="absolute bottom-3 left-3 z-20">
          <div className="flex items-center space-x-1 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
            <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
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