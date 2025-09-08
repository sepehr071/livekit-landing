/**
 * Test the new manifest-based image discovery system
 * This test verifies that we can discover images without console spam
 */

import { fetchImagesFromFolder, getAvailableCarNames, getCarManifest } from '../utils/imageGallery.js';

console.log('🧪 Testing Manifest-Based Image Discovery System');
console.log('=' .repeat(60));

// Test 1: Check available cars
console.log('\n📋 Test 1: Available Cars');
const availableCars = getAvailableCarNames();
console.log(`✅ Found ${availableCars.length} cars in manifest:`);
availableCars.forEach(car => console.log(`   - ${car}`));

// Test 2: Check specific car manifest
console.log('\n📋 Test 2: Opel Corsa Manifest Check');
const opelCarName = 'Opel_Corsa_F_GS_1.2_Sitz.&Lenkradh_100KW_EU6d_image';
const opelManifest = getCarManifest(opelCarName);
if (opelManifest) {
  const totalImages = (opelManifest.exterior_front?.length || 0) +
                     (opelManifest.exterior_back?.length || 0) +
                     (opelManifest.interior?.length || 0);
  console.log(`✅ Opel Corsa manifest found with ${totalImages} total images`);
  console.log(`   Categories: exterior_front(${opelManifest.exterior_front?.length || 0}), exterior_back(${opelManifest.exterior_back?.length || 0}), interior(${opelManifest.interior?.length || 0})`);
  if (opelManifest.interior?.length > 0) {
    console.log(`   Sample interior: ${opelManifest.interior[0].hash}`);
  }
} else {
  console.log('❌ Opel Corsa manifest not found');
}

// Test 3: Fetch Opel Corsa interior images (this was causing console spam before)
console.log('\n📋 Test 3: Opel Corsa Interior Discovery (Previously Problematic)');
console.log('🔍 Testing Opel Corsa interior images...');

async function testOpelCorsaInterior() {
  try {
    const interiorImages = await fetchImagesFromFolder(opelCarName, 'interior');
    
    if (interiorImages.length > 0) {
      console.log(`✅ SUCCESS: Found ${interiorImages.length} interior images for Opel Corsa`);
      interiorImages.forEach((img, index) => {
        console.log(`   ${index + 1}. ${img}`);
      });
    } else {
      console.log('⚠️ No interior images found for Opel Corsa');
    }
  } catch (error) {
    console.error('❌ Error testing Opel Corsa interior:', error);
  }
}

// Test 4: Test multiple categories for Mercedes
console.log('\n📋 Test 4: Mercedes Multi-Category Test');

async function testMercedesCategories() {
  const mercedesCarName = 'Mercedes-Benz_E_300_e_T_AVANTGARDE_DISTRONIC_KEYLESS_KAMERA_image';
  
  console.log(`🔍 Testing Mercedes categories...`);
  
  const categories = ['exterior_front', 'exterior_back', 'interior', 'all'];
  
  for (const category of categories) {
    try {
      console.log(`\n   📂 Category: ${category}`);
      const images = await fetchImagesFromFolder(mercedesCarName, category);
      console.log(`   ✅ Found ${images.length} images`);
      
      if (images.length > 0) {
        console.log(`   📷 Sample: ${images[0]}`);
      }
    } catch (error) {
      console.error(`   ❌ Error in ${category}:`, error);
    }
  }
}

// Test 5: Performance test - check discovery speed
console.log('\n📋 Test 5: Performance Test');

async function testPerformance() {
  const startTime = performance.now();
  
  try {
    const porscheCarName = 'Porsche_Boxster_718_STYLE_EDITION_LED_CHRONO_BOSE_MEMORY_image';
    const allImages = await fetchImagesFromFolder(porscheCarName, 'all');
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    console.log(`✅ Performance test completed in ${duration}ms`);
    console.log(`📊 Discovered ${allImages.length} total images for Porsche`);
    
    if (duration < 5000) {
      console.log('🚀 Good performance: Under 5 seconds');
    } else {
      console.log('⚠️ Slow performance: Over 5 seconds');
    }
  } catch (error) {
    console.error('❌ Performance test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Running dynamic tests...\n');
  
  await testOpelCorsaInterior();
  await testMercedesCategories();
  await testPerformance();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 All tests completed!');
  console.log('💡 Check console for any 404 errors - there should be none with the new system');
  console.log('=' .repeat(60));
}

// Execute tests when this file is run
runAllTests();

export { runAllTests };