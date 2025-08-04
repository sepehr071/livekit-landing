import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Copy, Check } from 'lucide-react';

const ProductLinkBox = ({ productData, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleLinkClick = () => {
    window.open(productData.link_url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productData.link_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!productData) return null;

  // Extract domain name for display
  const getDomainName = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
        isVisible 
          ? 'bg-black bg-opacity-50 backdrop-blur-sm' 
          : 'bg-black bg-opacity-0 backdrop-blur-0 pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      {/* Link Box Content */}
      <div
        className={`relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 ease-out transform ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-8">
              <h3 className="font-bold text-lg">{productData.product_title}</h3>
              {productData.description && (
                <p className="text-blue-100 text-sm mt-1">{productData.description}</p>
              )}
              {productData.category && (
                <span className="inline-block bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs mt-2">
                  {productData.category}
                </span>
              )}
            </div>
            
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200 flex-shrink-0"
              title="Close (ESC)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Link Content */}
        <div className="p-6">
          {/* Link Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-dashed border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <ExternalLink className="text-blue-500 flex-shrink-0" size={20} />
              <span className="text-sm font-medium text-gray-600">Product Link</span>
            </div>
            
            <div className="bg-white rounded-md p-3 border">
              <p className="text-sm text-gray-800 break-all font-mono">
                {productData.link_url}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Domain: {getDomainName(productData.link_url)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleLinkClick}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ExternalLink size={18} />
              Open Link
            </button>
            
            <button
              onClick={handleCopyLink}
              className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                copied 
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
              title="Copy link to clipboard"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>

          {/* Copy Feedback */}
          {copied && (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700 text-center">
                ✓ Link copied to clipboard!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 py-3 text-center border-t">
          <p className="text-xs text-gray-500">
            Press ESC or click outside to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductLinkBox;