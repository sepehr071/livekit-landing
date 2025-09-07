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
    
    // Common image extensions to look for
    const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'];
    
    // Try to fetch images using different strategies
    const imageUrls = [];
    
    // Strategy 1: Try common car image naming patterns
    const commonPatterns = [
      'volvo-xc40-465570.webp',
      'peugeot-5008-479956.webp', 
      'opel-astra-481456.webp'
    ];
    
    // Check if folder path matches known car patterns
    if (cleanPath.includes('cars') || cleanPath.includes('car')) {
      for (const pattern of commonPatterns) {
        const imageUrl = `/images/cars/${pattern}`;
        try {
          // Test if image exists by making a HEAD request
          const response = await fetch(imageUrl, { method: 'HEAD' });
          if (response.ok) {
            imageUrls.push(imageUrl);
            console.log('✅ Found car image:', imageUrl);
          }
        } catch (error) {
          console.log('❌ Image not found:', imageUrl);
        }
      }
    }
    
    // Strategy 2: Try to fetch directory listing (if server supports it)
    try {
      const folderResponse = await fetch(cleanPath);
      if (folderResponse.ok) {
        const folderContent = await folderResponse.text();
        
        // Parse HTML to find image files (basic parsing)
        const imageFiles = folderContent.match(/href="([^"]*\.(jpg|jpeg|png|webp|gif|svg))"/gi) || [];
        
        for (const match of imageFiles) {
          const imageFile = match.replace(/href="/i, '').replace(/"$/i, '');
          const fullImageUrl = cleanPath.endsWith('/') ? cleanPath + imageFile : cleanPath + '/' + imageFile;
          
          if (!imageUrls.includes(fullImageUrl)) {
            imageUrls.push(fullImageUrl);
            console.log('✅ Found image via directory listing:', fullImageUrl);
          }
        }
      }
    } catch (error) {
      console.log('ℹ️ Directory listing not available or failed:', error.message);
    }
    
    // Strategy 3: Try numbered image patterns (e.g., image1.jpg, image2.jpg)
    if (imageUrls.length === 0) {
      for (let i = 1; i <= 10; i++) {
        for (const ext of imageExtensions) {
          const numberedImageUrl = `${cleanPath}/image${i}.${ext}`;
          try {
            const response = await fetch(numberedImageUrl, { method: 'HEAD' });
            if (response.ok) {
              imageUrls.push(numberedImageUrl);
              console.log('✅ Found numbered image:', numberedImageUrl);
              break; // Move to next number after finding one
            }
          } catch (error) {
            // Continue trying other extensions
          }
        }
      }
    }
    
    // Strategy 4: Try wildcard patterns if we have some context
    if (imageUrls.length === 0 && cleanPath.includes('product')) {
      const productPatterns = ['main.jpg', 'front.jpg', 'side.jpg', 'interior.jpg', 'detail.jpg'];
      for (const pattern of productPatterns) {
        const productImageUrl = `${cleanPath}/${pattern}`;
        try {
          const response = await fetch(productImageUrl, { method: 'HEAD' });
          if (response.ok) {
            imageUrls.push(productImageUrl);
            console.log('✅ Found product image:', productImageUrl);
          }
        } catch (error) {
          // Continue with next pattern
        }
      }
    }
    
    console.log(`📊 Found ${imageUrls.length} images in folder:`, imageUrls);
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