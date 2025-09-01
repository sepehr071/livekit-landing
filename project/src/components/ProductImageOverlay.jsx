import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useCompanyConfig } from '../config/useCompanyConfig';

const ProductImageOverlay = ({ productData, onClose }) => {
  // Get company configuration
  const { config, getText } = useCompanyConfig();
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (productData) {
      // Trigger animation after component mounts
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [productData]);

  const handleClose = () => {
    setIsVisible(false);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!productData) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
        isVisible 
          ? 'bg-black bg-opacity-80 backdrop-blur-md' 
          : 'bg-black bg-opacity-0 backdrop-blur-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Overlay Content */}
      <div
        className={`relative max-w-4xl max-h-[90vh] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ease-out transform ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-8'
        }`}
      >
        {/* Header */}
        <div
          className="relative text-white p-4"
          style={{
            background: `linear-gradient(to right, ${config.theme.primary.main}, ${config.theme.secondary.main})`
          }}
        >
          <h2 className="text-xl font-bold pr-12">{productData.product_title}</h2>
          {productData.description && (
            <p className="text-amber-100 text-sm mt-1">{productData.description}</p>
          )}
          {productData.category && (
            <span className="inline-block bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs mt-2">
              {productData.category}
            </span>
          )}
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
            title={getText("ui.closeEsc")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative bg-gray-50 flex items-center justify-center min-h-[400px] max-h-[calc(90vh-140px)] overflow-hidden">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          )}
          
          <img
            src={productData.image_url}
            alt={productData.product_title}
            className={`max-w-full max-h-full object-contain transition-all duration-300 cursor-pointer ${
              isZoomed ? 'scale-150' : 'scale-100'
            } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onClick={toggleZoom}
            style={{ minHeight: '200px' }}
          />

          {/* Zoom Controls */}
          {imageLoaded && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={toggleZoom}
                className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200 backdrop-blur-sm"
                title={isZoomed ? getText("ui.zoomOut") : getText("ui.zoomIn")}
              >
                {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-4 py-3 text-center">
          <p className="text-sm text-gray-600">
            {getText("ui.imageOverlayInstructions")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductImageOverlay;