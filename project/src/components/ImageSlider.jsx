import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    setIsLoading(true);
    // Reset loading state when images change
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const goToPrevious = () => {
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    onIndexChange(newIndex);
  };

  const goToNext = () => {
    const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(newIndex);
    onIndexChange(newIndex);
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const handleImageLoad = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: false }));
  };

  return (
    <div className="relative w-full h-full bg-transparent rounded-lg overflow-hidden">
      {/* Minimal image counter (only show for multiple images) */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 z-20 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
          {activeIndex + 1} / {images.length}
        </div>
      )}

      {/* Main image display - clean, no overlays */}
      <div className="relative w-full h-full flex items-center justify-center bg-transparent">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 rounded-lg">
            <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        <img
          src={images[activeIndex]}
          alt={`Car ${activeIndex + 1}`}
          className={`w-full h-full object-cover rounded-lg transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => handleImageLoad(activeIndex)}
          onError={() => handleImageError(activeIndex)}
        />

        {imageErrors[activeIndex] && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-1">🚗</div>
              <p className="text-xs">Image not available</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation arrows - minimal design */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-all backdrop-blur-sm"
            aria-label="Previous image"
          >
            <ChevronLeft size={18} className="text-white" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-all backdrop-blur-sm"
            aria-label="Next image"
          >
            <ChevronRight size={18} className="text-white" />
          </button>
        </>
      )}

      {/* Thumbnail navigation - minimal dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-20 flex space-x-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveIndex(index);
                onIndexChange(index);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                index === activeIndex
                  ? 'bg-white shadow-sm'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Keyboard navigation */}
      <div className="sr-only" role="status" aria-live="polite">
        Image {activeIndex + 1} of {images.length}
      </div>
    </div>
  );
};

export default ImageSlider;