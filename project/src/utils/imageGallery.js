/**
 * Utility functions for handling image galleries and folder-based image loading
 */

/**
 * Fetch all images from a specified folder path
 * @param {string} folderPath - Path to the folder containing images
 * @returns {Promise<string[]>} Array of image URLs
 */
export const fetchImagesFromFolder = async (folderPath) => {
  try {
    console.log('📁 Fetching images from folder:', folderPath);
    
    // Remove trailing slash if present
    const cleanPath = folderPath.replace(/\/$/, '');
    
    // Define known image collections to avoid Vite directory fetch issues
    const imageCollections = {
      '/images/cars': [
        'volvo-xc40-465570.webp',
        'peugeot-5008-479956.webp',
        'opel-astra-481456.webp'
      ],
      // Add more collections as needed
      '/images/cars/volvo': ['volvo-xc40-465570.webp'],
      '/images/cars/peugeot': ['peugeot-5008-479956.webp'],
      '/images/cars/opel': ['opel-astra-481456.webp']
    };
    
    // Check if we have a known collection for this path
    const knownImages = imageCollections[cleanPath];
    
    if (knownImages) {
      console.log(`📋 Using known image collection for: ${cleanPath}`);
      const imageUrls = [];
      
      // Verify each known image exists
      for (const imageName of knownImages) {
        const imageUrl = cleanPath.includes('/cars/') ? `/images/cars/${imageName}` : `${cleanPath}/${imageName}`;
        
        try {
          // Test if image exists by making a HEAD request
          const response = await fetch(imageUrl, { method: 'HEAD' });
          if (response.ok) {
            imageUrls.push(imageUrl);
            console.log('✅ Verified image exists:', imageUrl);
          } else {
            console.log('⚠️ Image not accessible:', imageUrl);
          }
        } catch (error) {
          console.log('❌ Image fetch failed:', imageUrl, error.message);
        }
      }
      
      console.log(`📊 Found ${imageUrls.length} verified images in folder:`, imageUrls);
      return imageUrls;
    }
    
    // Fallback: Try common image patterns for unknown paths
    const imageExtensions = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'svg'];
    const imageUrls = [];
    
    // Try common patterns
    const commonPatterns = [
      'image1', 'image2', 'image3', 'image4', 'image5',
      'main', 'front', 'side', 'interior', 'detail',
      '1', '2', '3', '4', '5'
    ];
    
    for (const pattern of commonPatterns) {
      for (const ext of imageExtensions) {
        const imageUrl = `${cleanPath}/${pattern}.${ext}`;
        try {
          const response = await fetch(imageUrl, { method: 'HEAD' });
          if (response.ok) {
            imageUrls.push(imageUrl);
            console.log('✅ Found image via pattern:', imageUrl);
          }
        } catch (error) {
          // Continue with next pattern
        }
      }
    }
    
    console.log(`📊 Found ${imageUrls.length} images via pattern matching:`, imageUrls);
    return imageUrls;
    
  } catch (error) {
    console.error('❌ Error fetching images from folder:', error);
    return [];
  }
};

/**
 * Process image data to determine if it's a single image or multiple images
 * @param {Object} imageData - Image data from client tool
 * @returns {Object} Processed image data with images array
 */
export const processImageData = (imageData) => {
  if (!imageData) return null;
  
  // If imageUrl is provided, treat as single image (backward compatibility)
  if (imageData.imageUrl) {
    return {
      images: [imageData.imageUrl],
      title: imageData.title || '',
      description: imageData.description || '',
      type: 'single'
    };
  }
  
  // If imageFolder is provided, treat as multiple images
  if (imageData.imageFolder) {
    return {
      folderPath: imageData.imageFolder,
      title: imageData.title || '',
      description: imageData.description || '',
      type: 'gallery',
      images: [] // Will be populated after fetching
    };
  }
  
  // If images array is directly provided
  if (imageData.images && Array.isArray(imageData.images)) {
    return {
      images: imageData.images,
      title: imageData.title || '',
      description: imageData.description || '',
      type: 'gallery'
    };
  }
  
  return null;
};

/**
 * Preload images to improve performance
 * @param {string[]} imageUrls - Array of image URLs to preload
 * @returns {Promise<void>}
 */
export const preloadImages = async (imageUrls) => {
  const loadPromises = imageUrls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log('✅ Preloaded image:', url);
        resolve(url);
      };
      img.onerror = () => {
        console.log('❌ Failed to preload image:', url);
        reject(url);
      };
      img.src = url;
    });
  });
  
  try {
    await Promise.allSettled(loadPromises);
    console.log('✅ Image preloading completed');
  } catch (error) {
    console.log('⚠️ Some images failed to preload:', error);
  }
};

/**
 * Get image dimensions for better layout
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = imageUrl;
  });
};

/**
 * Validate image URLs
 * @param {string[]} imageUrls - Array of image URLs to validate
 * @returns {Promise<string[]>} Valid image URLs
 */
export const validateImageUrls = async (imageUrls) => {
  const validationPromises = imageUrls.map(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      
      if (response.ok && contentType && contentType.startsWith('image/')) {
        return url;
      }
    } catch (error) {
      console.log('❌ Invalid image URL:', url);
    }
    return null;
  });
  
  const results = await Promise.all(validationPromises);
  return results.filter(url => url !== null);
};