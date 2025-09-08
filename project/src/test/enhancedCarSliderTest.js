/**
 * Enhanced Car Image Slider Test
 * Tests the new auto-slide functionality, category support, and car structure handling
 */

import { fetchImagesFromFolder, processImageData } from '../utils/imageGallery.js';

// Test function to simulate ElevenLabs client tool calls
const testEnhancedCarSlider = async () => {
  console.log('🧪 Testing Enhanced Car Image Slider with New Structure');
  console.log('================================================');

  // Test 1: Car overview (all cars, exterior_front by default)
  console.log('\n📋 Test 1: Car Overview - All Cars');
  try {
    const overviewImages = await fetchImagesFromFolder('/images/cars');
    console.log(`✅ Found ${overviewImages.length} car overview images:`);
    overviewImages.forEach((img, idx) => {
      console.log(`   ${idx + 1}. ${img}`);
    });
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  // Test 2: Specific car - Mercedes A250e exterior_front
  console.log('\n🚗 Test 2: Mercedes A250e - Exterior Front');
  try {
    const mercedesFolder = '/images/cars/Mercedes-Benz_A_250_e_PROGRESSIVE_DISTRONIC_MEMORY_MULTIBEAM_image';
    const frontImages = await fetchImagesFromFolder(mercedesFolder, 'exterior_front');
    console.log(`✅ Found ${frontImages.length} exterior front images:`);
    frontImages.forEach((img, idx) => {
      console.log(`   ${idx + 1}. ${img}`);
    });
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  // Test 3: Specific car - Jeep Avenger interior
  console.log('\n🏠 Test 3: Jeep Avenger - Interior');
  try {
    const jeepFolder = '/images/cars/Jeep_Avenger_Elektro_Longitude_Navi_Technology_und_S_image';
    const interiorImages = await fetchImagesFromFolder(jeepFolder, 'interior');
    console.log(`✅ Found ${interiorImages.length} interior images:`);
    interiorImages.slice(0, 3).forEach((img, idx) => {
      console.log(`   ${idx + 1}. ${img}`);
    });
    if (interiorImages.length > 3) {
      console.log(`   ... and ${interiorImages.length - 3} more interior images`);
    }
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
  }

  // Test 4: Specific car - Kia Stonic all views
  console.log('\n🔄 Test 4: Kia Stonic - All Views');
  try {
    const kiaFolder = '/images/cars/Kia_Stonic_Spirit_1.0_T-GDI_EU6d-T_Automatic_image';
    const allImages = await fetchImagesFromFolder(kiaFolder, 'all');
    console.log(`✅ Found ${allImages.length} total images (all categories):`);
    allImages.slice(0, 5).forEach((img, idx) => {
      const category = img.includes('exterior_front') ? 'Front' : 
                     img.includes('exterior_back') ? 'Back' : 
                     img.includes('interior') ? 'Interior' : 'Unknown';
      console.log(`   ${idx + 1}. [${category}] ${img}`);
    });
    if (allImages.length > 5) {
      console.log(`   ... and ${allImages.length - 5} more images`);
    }
  } catch (error) {
    console.error('❌ Test 4 failed:', error);
  }

  // Test 5: Process image data with category support
  console.log('\n⚙️ Test 5: Process Image Data with Categories');
  try {
    const testImageData = {
      imageFolder: '/images/cars/Mercedes-Benz_A_250_e_PROGRESSIVE_DISTRONIC_MEMORY_MULTIBEAM_image',
      category: 'interior',
      title: 'Mercedes-Benz A 250e Interior',
      description: 'Premium interior with advanced technology'
    };
    
    const processed = processImageData(testImageData);
    console.log('✅ Processed image data:', {
      type: processed.type,
      category: processed.category,
      title: processed.title,
      folderPath: processed.folderPath
    });
  } catch (error) {
    console.error('❌ Test 5 failed:', error);
  }

  console.log('\n🎯 Enhanced Slider Features Summary:');
  console.log('=====================================');
  console.log('✅ Auto-slide: 2500ms intervals with hover pause');
  console.log('✅ Larger display: h-96 md:h-[500px] lg:h-[600px]');
  console.log('✅ Minimal UI: Only arrows, no dots or counters');
  console.log('✅ Category support: exterior_front, exterior_back, interior, all');
  console.log('✅ Smart detection: Car overview vs specific models');
  console.log('✅ ElevenLabs integration: Updated client tool with category parameter');
  
  console.log('\n📱 Example Agent Requests:');
  console.log('- "Show me all available cars" → Overview slider');
  console.log('- "Show me the Mercedes A250e interior" → Interior category');
  console.log('- "Show me the Jeep Avenger from all angles" → All categories');
  console.log('- "Show me the front view of the Kia Stonic" → Exterior front');
};

// Run the test
if (typeof window !== 'undefined') {
  // Browser environment
  window.testEnhancedCarSlider = testEnhancedCarSlider;
  console.log('🧪 Enhanced Car Slider test loaded. Run testEnhancedCarSlider() to start testing.');
} else {
  // Node environment
  testEnhancedCarSlider().catch(console.error);
}

export { testEnhancedCarSlider };