/**
 * Test file for multi-image gallery functionality
 * Run this in the browser console to test the image gallery features
 */

// Test the image gallery utility functions
import { fetchImagesFromFolder, processImageData, validateImageUrls } from '../utils/imageGallery';

// Test data for different scenarios
const testData = {
  // Single car folder (auto-detects single image)
  singleCarFolder: {
    imageFolder: "/images/cars/volvo",
    title: "Volvo XC40 - Premium Compact SUV",
    description: "Swedish design meets urban versatility"
  },
  
  // Multiple cars folder (auto-detects gallery)
  allCarsFolder: {
    imageFolder: "/images/cars",
    title: "Available Car Models",
    description: "Browse our complete selection of vehicles"
  },
  
  // Empty folder (error testing)
  emptyFolder: {
    imageFolder: "/images/empty",
    title: "Test Empty Folder",
    description: "Should show error message"
  }
};

// Test functions
const runTests = async () => {
  console.log('🧪 Starting Image Gallery Tests');
  
  // Test 1: Fetch images from all cars folder
  console.log('\n📋 Test 1: Fetch All Cars');
  try {
    const images = await fetchImagesFromFolder('/images/cars');
    console.log('Found images:', images);
    console.log(`Auto-detection: ${images.length === 1 ? 'Single image' : 'Gallery'} mode`);
  } catch (error) {
    console.error('Error fetching images:', error);
  }
  
  // Test 2: Validate image URLs
  console.log('\n📋 Test 2: Validate Image URLs');
  const testUrls = [
    "/images/cars/volvo-xc40-465570.webp",
    "/images/cars/peugeot-5008-479956.webp",
    "/images/cars/opel-astra-481456.webp",
    "/images/cars/non-existent.jpg"
  ];
  
  try {
    const validUrls = await validateImageUrls(testUrls);
    console.log('Valid URLs:', validUrls);
  } catch (error) {
    console.error('Error validating URLs:', error);
  }
  
  // Test 3: Auto-detection logic
  console.log('\n📋 Test 3: Auto-detection Logic');
  const testFolders = ['/images/cars', '/images/nonexistent'];
  for (const folder of testFolders) {
    try {
      const images = await fetchImagesFromFolder(folder);
      const type = images.length === 1 ? 'single' : 'gallery';
      console.log(`Folder: ${folder}, Images: ${images.length}, Type: ${type}`);
    } catch (error) {
      console.error(`Error testing folder ${folder}:`, error);
    }
  }
  
  console.log('\n✅ Image Gallery Tests Completed');
};

// Client tool simulation for testing
const simulateClientTool = async (params) => {
  console.log('\n🔧 Simulating Client Tool Call');
  console.log('Parameters:', params);
  
  try {
    if (!params.imageFolder) {
      console.error('❌ No imageFolder provided');
      return "imageFolder parameter is required";
    }
    
    console.log('📁 Fetching images from folder:', params.imageFolder);
    const images = await fetchImagesFromFolder(params.imageFolder);
    
    if (images.length === 0) {
      console.warn('⚠️ No images found in folder:', params.imageFolder);
      return `No images found in the specified folder: ${params.imageFolder}`;
    }
    
    // Auto-detect single vs multiple images
    const displayType = images.length === 1 ? 'single' : 'gallery';
    
    const imageData = {
      images: images,
      product_title: params.title || '',
      description: params.description || '',
      type: displayType,
      folderPath: params.imageFolder
    };
    
    console.log(`🖼️ Auto-detected ${displayType} mode: ${images.length} image(s) found`);
    
    // Return appropriate success message
    const result = images.length === 1
      ? `Product image displayed successfully`
      : `Product gallery with ${images.length} images displayed successfully`;
      
    console.log('✅ Client tool result:', result);
    return { result, imageData };
    
  } catch (error) {
    console.error('❌ Error in client tool:', error);
    return `Error displaying images: ${error.message}`;
  }
};

// Test scenarios
const testScenarios = async () => {
  console.log('\n🎭 Testing Different Scenarios');
  
  // Scenario 1: All cars folder (auto-detects gallery)
  console.log('\n📌 Scenario 1: All Cars Folder');
  await simulateClientTool({
    imageFolder: "/images/cars",
    title: "Available Car Models",
    description: "Browse our complete selection of vehicles"
  });
  
  // Scenario 2: Single car folder (auto-detects single)
  console.log('\n📌 Scenario 2: Single Car Folder');
  await simulateClientTool({
    imageFolder: "/images/cars/volvo",
    title: "Volvo XC40 - Premium Compact SUV",
    description: "Swedish design meets urban versatility"
  });
  
  // Scenario 3: Error handling - empty folder
  console.log('\n📌 Scenario 3: Error Handling');
  await simulateClientTool({
    imageFolder: "/images/nonexistent",
    title: "Test Error Handling"
  });
  
  // Scenario 4: Missing imageFolder parameter
  console.log('\n📌 Scenario 4: Missing Parameter');
  await simulateClientTool({
    title: "Missing imageFolder parameter"
  });
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.imageGalleryTest = {
    runTests,
    simulateClientTool,
    testScenarios,
    testData
  };
  
  console.log('🧪 Image Gallery Test functions loaded!');
  console.log('Available functions:');
  console.log('- window.imageGalleryTest.runTests()');
  console.log('- window.imageGalleryTest.testScenarios()');
  console.log('- window.imageGalleryTest.simulateClientTool(params)');
}

export { runTests, simulateClientTool, testScenarios, testData };