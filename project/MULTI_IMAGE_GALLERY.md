# Multi-Image Gallery Documentation

## Overview

The smart AI widget now supports intelligent image display with automatic detection. The ElevenLabs agent simply provides a folder path, and the system automatically detects whether to show a single image or an interactive gallery based on the contents of the folder.

## Key Features

### ✨ Enhanced Capabilities
- **Automatic Detection**: Intelligently detects single image vs. gallery based on folder contents
- **Unified Interface**: Single `imageFolder` parameter handles all scenarios
- **Multi-Image Gallery**: Interactive slider for folders with multiple images
- **Single Image Display**: Clean product view for folders with one image
- **Responsive Design**: Optimized for both mobile and desktop viewing
- **Smooth Animations**: Elegant transitions between images with navigation controls
- **Image Preloading**: Improved performance with automatic image preloading
- **Error Handling**: Graceful fallbacks for missing or broken images

### 🎛️ Interactive Controls
- **Navigation Arrows**: Previous/Next buttons for easy browsing
- **Thumbnail Dots**: Quick navigation to specific images
- **Touch/Swipe Support**: Mobile-friendly gesture controls
- **Keyboard Navigation**: Accessibility support for keyboard users
- **Auto-sizing**: Images automatically scale to fit the container

## Implementation Architecture

### 📁 New Files Created

1. **`/src/components/ImageSlider.jsx`** - Main carousel component
2. **`/src/utils/imageGallery.js`** - Utility functions for image handling
3. **`/src/test/imageGalleryTest.js`** - Test functions and scenarios
4. **`/elevenlabs-dashboard-config.json`** - Updated ElevenLabs configuration

### 🔧 Modified Files

1. **`/src/hooks/useElevenLabsConversation.js`** - Enhanced client tool
2. **`/src/components/ChatAvatar.jsx`** - Integrated slider component

## ElevenLabs Dashboard Configuration

### Updated `displayProductImage` Tool

The client tool now uses a simple folder-based approach with automatic detection:

```json
{
  "type": "client",
  "name": "displayProductImage",
  "description": "Display car images with title and description. Automatically detects single images or multiple images in the specified folder and displays them appropriately.",
  "parameters": [
    {
      "id": "imageFolder",
      "type": "string",
      "description": "Path to folder containing car images (e.g., '/images/cars'). System will automatically detect if it contains a single image or multiple images and display accordingly.",
      "required": true
    },
    {
      "id": "title",
      "type": "string",
      "description": "Car title or name (e.g., 'Volvo XC40 - Premium Compact SUV', 'Available Car Models')",
      "required": true
    },
    {
      "id": "description",
      "type": "string",
      "description": "Brief car description, key features, or additional details about the car(s)",
      "required": false
    }
  ]
}
```

### Usage Rules
- `imageFolder` is required and should point to a valid folder path
- `title` is always required
- System automatically detects whether to show single image or gallery
- Single image displays as traditional product view
- Multiple images display as interactive gallery slider

## Usage Examples

### All Cars (Auto-detects Gallery)
```javascript
// Agent calls this to show all available cars
// System detects multiple images and shows gallery
displayProductImage({
  imageFolder: "/images/cars",
  title: "Available Car Models",
  description: "Browse our complete selection of vehicles"
});
```

### Specific Car Model (Auto-detects Single)
```javascript
// Agent calls this for a specific car model
// System detects single image and shows traditional view
displayProductImage({
  imageFolder: "/images/cars/volvo",
  title: "Volvo XC40 - Premium Compact SUV",
  description: "Swedish design meets urban versatility"
});
```

## 🔄 How It Works

1. **Agent Input**: The ElevenLabs agent provides an `imageFolder` path (e.g., "/images/cars")
2. **Automatic Discovery**: The system fetches all images from the specified folder
3. **Intelligent Detection**: Based on the number of images found:
   - **1 image**: Displays as traditional single product view
   - **2+ images**: Displays as interactive gallery slider
4. **Dynamic Rendering**: The UI automatically chooses the appropriate display mode
5. **Seamless UX**: Users get the optimal experience regardless of image count

## Technical Implementation Details

### Image Fetching Strategy

The `fetchImagesFromFolder()` function uses multiple strategies to find images:

1. **Known Patterns**: Checks for common car image naming patterns
2. **Directory Listing**: Attempts to parse server directory listings  
3. **Numbered Patterns**: Looks for sequentially numbered images
4. **Wildcard Patterns**: Searches for common product image names

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)
- SVG (.svg)

### Performance Optimizations

1. **Image Preloading**: Background loading of gallery images
2. **Lazy Loading**: Images load as needed during navigation
3. **Error Handling**: Graceful degradation for broken images
4. **Memory Management**: Efficient cleanup of unused resources

## User Experience

### Navigation Methods
- **Arrow Buttons**: Click left/right arrows to navigate
- **Thumbnail Dots**: Click dots to jump to specific images
- **Keyboard**: Use arrow keys for navigation
- **Touch Gestures**: Swipe left/right on mobile devices

### Visual Indicators
- **Image Counter**: Shows current position (e.g., "2 / 5")
- **Loading States**: Animated spinners during image loading
- **Error States**: Fallback icons for broken images
- **Active Thumbnails**: Highlighted current image indicator

## Integration with Chat Avatar

The `ChatAvatar` component automatically detects image data format:

- **Single Image**: Displays traditional product image layout
- **Multiple Images**: Renders the `ImageSlider` component
- **Responsive**: Adapts layout based on screen size
- **Animations**: Smooth transitions between display modes

## Testing

### Browser Console Testing
```javascript
// Load test functions in browser console
window.imageGalleryTest.runTests();           // Run all tests
window.imageGalleryTest.testScenarios();      // Test different scenarios  
window.imageGalleryTest.simulateClientTool({  // Test specific parameters
  imageFolder: "/images/cars",
  title: "Test Gallery"
});
```

### Test Scenarios Included
1. Single image display
2. Multi-image gallery from folder
3. Error handling for missing folders
4. Image URL validation
5. Performance testing with preloading

## Deployment Instructions

### 1. Update ElevenLabs Dashboard
Copy the configuration from `/elevenlabs-dashboard-config.json` to your ElevenLabs agent tools configuration.

### 2. Agent Prompting
Update your agent's system prompt to include:

```
When showing car images:
- Always use imageFolder parameter with the path to the image folder
- Use imageFolder="/images/cars" to show all available cars (system auto-detects gallery)
- Use imageFolder="/images/cars/volvo" for specific car models (system auto-detects single)
- Always provide descriptive titles and descriptions
- System automatically handles single images vs galleries based on folder contents
```

### 3. Image Folder Structure
Ensure your images are organized in folders:
```
/public/images/cars/
  ├── volvo-xc40-465570.webp
  ├── peugeot-5008-479956.webp
  └── opel-astra-481456.webp
```

## Future Enhancements

### Potential Improvements
- **Zoom Functionality**: Full-screen image viewing
- **Image Filtering**: Filter by car type, brand, etc.
- **Sorting Options**: Sort by name, price, popularity
- **Infinite Scroll**: Load more images dynamically
- **3D Gallery**: Advanced 3D carousel view
- **Video Support**: Include car video previews

### API Extensions
- **Dynamic Folders**: Generate image lists from APIs
- **Real-time Updates**: Live inventory synchronization
- **Metadata Support**: Rich image information overlay
- **Progressive Loading**: Enhanced performance for large galleries

## Troubleshooting

### Common Issues

**Images not loading:**
- Check image file paths and extensions
- Verify server has proper CORS headers
- Ensure image files exist in specified folder

**Gallery not appearing:**
- Confirm `imageFolder` parameter is correctly specified
- Check browser console for JavaScript errors
- Verify folder contains valid image files

**Performance issues:**
- Reduce image file sizes
- Limit gallery to reasonable number of images (< 20)
- Enable image compression on server

### Debug Mode
Enable debug logging by opening browser console:
```javascript
// Enable detailed logging
localStorage.setItem('imageGalleryDebug', 'true');
```

## Conclusion

The multi-image gallery functionality transforms the AI widget from a single-image display into a powerful product showcase tool. This enhancement maintains backward compatibility while providing rich, interactive experiences for showcasing multiple product images.

The implementation follows modern web development best practices with responsive design, accessibility features, and performance optimizations, making it suitable for production deployment.