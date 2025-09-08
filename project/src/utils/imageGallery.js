/**
 * Dynamic utility functions for handling image galleries based on car name and category
 * Uses optimized discovery patterns to eliminate console spam
 */

/**
 * Car image manifests - extracted from actual file structure
 * Maps exact image numbers and hashes per car and category
 */
const CAR_IMAGE_MANIFESTS = {
  'Mercedes-Benz_E_300_e_T_AVANTGARDE_DISTRONIC_KEYLESS_KAMERA_image': {
    exterior_front: [
      {num: 1, hash: '430545639_5b_ebbade1936'},
      {num: 3, hash: '430545639_9a_91d48229b5'},
      {num: 15, hash: '430545639_2c_74a7534ac7'}
    ],
    exterior_back: [
      {num: 2, hash: '430545639_f3_d3df56aacf'},
      {num: 4, hash: '430545639_ac_0fb8cdf28b'}
    ],
    interior: [
      {num: 5, hash: '430545639_7f_ac124d44ee'},
      {num: 6, hash: '430545639_b5_1fe9878a7a'},
      {num: 7, hash: '430545639_dc_a96d240ff7'},
      {num: 8, hash: '430545639_d2_0211398127'},
      {num: 9, hash: '430545639_2d_9aacfdcd1a'},
      {num: 10, hash: '430545639_5d_9ed209768d'},
      {num: 11, hash: '430545639_c8_641f89384c'},
      {num: 12, hash: '430545639_49_5f99f71754'},
      {num: 13, hash: '430545639_bc_9d87a72c7f'},
      {num: 14, hash: '430545639_bf_565bb15123'}
    ]
  },
  'Mercedes-Benz_A_250_e_PROGRESSIVE_DISTRONIC_MEMORY_MULTIBEAM_image': {
    exterior_front: [
      {num: 1, hash: '434759686_f0_0f81bb25cf'},
      {num: 3, hash: '434759686_47_aa81805246'},
      {num: 13, hash: '434759686_f0_0f81bb25cf'},
      {num: 15, hash: '434759686_4b_e19ea9d90a'}
    ],
    exterior_back: [
      {num: 2, hash: '434759686_bf_d48ff6f680'},
      {num: 4, hash: '434759686_3b_8e4707ee6a'}
    ],
    interior: [
      {num: 5, hash: '434759686_e9_ea6102276d'},
      {num: 6, hash: '434759686_32_0391719ddf'},
      {num: 7, hash: '434759686_2e_c6a7f75c96'},
      {num: 8, hash: '434759686_42_00dadb50ce'},
      {num: 9, hash: '434759686_50_3f643cfd9a'},
      {num: 10, hash: '434759686_85_1df148140c'},
      {num: 11, hash: '434759686_cc_0c3be8ba5b'},
      {num: 12, hash: '434759686_9c_94ffc0b6da'},
      {num: 14, hash: '434759686_0d_0c3edf03b3'}
    ]
  },
  'Jeep_Avenger_Elektro_Longitude_Navi_Technology_und_S_image': {
    exterior_front: [
      {num: 1, hash: '392527039_7b_eb1f6b8d8c'},
      {num: 3, hash: '392527039_22_a1a2a57112'},
      {num: 16, hash: '392527039_7b_eb1f6b8d8c'}
    ],
    exterior_back: [
      {num: 2, hash: '392527039_2c_cc25f7198e'},
      {num: 4, hash: '392527039_2b_899dd3df55'},
      {num: 15, hash: '392527039_81_876b1dfdab'}
    ],
    interior: [
      {num: 5, hash: '392527039_d6_ef3c23b889'},
      {num: 6, hash: '392527039_ed_1773609f80'},
      {num: 7, hash: '392527039_27_fedd1269f8'},
      {num: 8, hash: '392527039_3e_2978b1131f'},
      {num: 9, hash: '392527039_4c_6bfea5ddc1'},
      {num: 10, hash: '392527039_eb_336fa9a5e7'},
      {num: 11, hash: '392527039_75_ba05601136'},
      {num: 12, hash: '392527039_55_3bd856105e'},
      {num: 13, hash: '392527039_56_2f26bdd94e'},
      {num: 14, hash: '392527039_5a_c6f0d631a2'},
      {num: 17, hash: '392527039_95_c8766cf5b9'},
      {num: 18, hash: '392527039_20_7e8bdb906e'}
    ]
  },
  'Kia_Stonic_Spirit_1.0_T-GDI_EU6d-T_Automatic_image': {
    exterior_front: [
      {num: 1, hash: '433644497_89_929452242c'},
      {num: 3, hash: '433644497_dc_b31bc7cf7e'},
      {num: 15, hash: '433644497_b1_ed9e5b5829'}
    ],
    exterior_back: [
      {num: 2, hash: '433644497_b7_da7a60063f'},
      {num: 4, hash: '433644497_a7_b046348859'}
    ],
    interior: [
      {num: 5, hash: '433644497_0e_afd63883e9'},
      {num: 6, hash: '433644497_ee_923e33beb0'},
      {num: 7, hash: '433644497_4d_483b16717d'},
      {num: 9, hash: '433644497_84_19f509c7f0'},
      {num: 10, hash: '433644497_93_eab4f407da'},
      {num: 11, hash: '433644497_f4_8b1b00c785'},
      {num: 12, hash: '433644497_b9_d9f97100a1'},
      {num: 13, hash: '433644497_90_cbc6ad408c'},
      {num: 14, hash: '433644497_14_1150227b94'}
    ]
  },
  'Mercedes-Benz_CLA_180_PROGRESSIVE_PANORAMA_SPURASSIST_KAMERA_image': {
    exterior_front: [
      {num: 1, hash: '428577398_f2_dab4285f8a'},
      {num: 2, hash: '428577398_63_6ef373fcee'},
      {num: 3, hash: '428577398_69_0b283f14ed'},
      {num: 15, hash: '428577398_b7_0baec0853c'}
    ],
    exterior_back: [],
    interior: [
      {num: 4, hash: '428577398_8b_05f3c0ee24'},
      {num: 5, hash: '428577398_08_378f1baf07'},
      {num: 6, hash: '428577398_1e_8e6d16802f'},
      {num: 7, hash: '428577398_64_dd857bb67c'},
      {num: 8, hash: '428577398_3b_a186af370b'},
      {num: 9, hash: '428577398_be_a6b363a3a0'},
      {num: 10, hash: '428577398_c3_caa89173e5'},
      {num: 11, hash: '428577398_e1_29ab766b92'},
      {num: 12, hash: '428577398_6d_442eb00286'},
      {num: 13, hash: '428577398_f7_d07c10297a'},
      {num: 14, hash: '428577398_26_a9a927be55'}
    ]
  },
  'Mercedes-Benz_CLA_180_Shooting_Brake_EDITION_DISTRONIC_NAV_AHK_image': {
    exterior_front: [
      {num: 1, hash: '434785922_34_a69ea0243e'},
      {num: 3, hash: '434785922_c7_dccf40d6c0'}
    ],
    exterior_back: [
      {num: 2, hash: '434785922_79_f678ef7deb'},
      {num: 4, hash: '434785922_3a_7ab1b6933e'},
      {num: 13, hash: '434785922_79_f678ef7deb'}
    ],
    interior: [
      {num: 5, hash: '434785922_7f_1c377a3457'},
      {num: 6, hash: '434785922_e3_5190905df2'},
      {num: 7, hash: '434785922_24_5e5d56024e'},
      {num: 8, hash: '434785922_42_321c2eaf73'},
      {num: 9, hash: '434785922_22_536213ca44'},
      {num: 10, hash: '434785922_68_dcd77f8b24'},
      {num: 11, hash: '434785922_92_1219b46c8f'},
      {num: 12, hash: '434785922_7f_1c377a3457'},
      {num: 14, hash: '434785922_ae_3953e91bbe'},
      {num: 15, hash: '434785922_68_dcd77f8b24'}
    ]
  },
  'Mercedes-Benz_EQA_250+_AMG_SPURPAKET_KAMERA_PDC_LENKRADHEIZ_image': {
    exterior_front: [
      {num: 1, hash: '434848311_29_10cbcc7dc1'},
      {num: 9, hash: '434848311_a6_11c5c6d6ab'}
    ],
    exterior_back: [
      {num: 2, hash: '434848311_b2_b1d53dd4e4'},
      {num: 10, hash: '434848311_8d_4e83bcf767'}
    ],
    interior: [
      {num: 3, hash: '434848311_ca_c9db3ff5a7'},
      {num: 4, hash: '434848311_14_4478ec3222'},
      {num: 5, hash: '434848311_48_69379d686a'},
      {num: 6, hash: '434848311_a3_74d0716d77'},
      {num: 7, hash: '434848311_66_df88afa3ba'},
      {num: 8, hash: '434848311_fd_0c2d189950'}
    ]
  },
  'Mercedes-Benz_G_500_FINAL_EDITION_WHITE_AMG_LEDER_STANDHZG_AHK_image': {
    exterior_front: [
      {num: 1, hash: '425472040_bb_ee0ee70052'},
      {num: 3, hash: '425472040_b4_efaef9d5cb'},
      {num: 5, hash: '425472040_f3_a1c924f15f'}
    ],
    exterior_back: [
      {num: 2, hash: '425472040_4a_68c3b30856'},
      {num: 4, hash: '425472040_0c_f87a7fbaee'}
    ],
    interior: [
      {num: 6, hash: '425472040_4e_fef37da13d'},
      {num: 7, hash: '425472040_99_77a311d6ec'},
      {num: 8, hash: '425472040_9e_bdd2a8f8ba'},
      {num: 9, hash: '425472040_7f_60349edfb1'},
      {num: 10, hash: '425472040_43_ab75aeb505'},
      {num: 11, hash: '425472040_28_39d7d724c0'},
      {num: 12, hash: '425472040_d1_7b52ad5551'},
      {num: 13, hash: '425472040_c7_9ce8c7f6bd'},
      {num: 14, hash: '425472040_6b_29298c076b'},
      {num: 15, hash: '425472040_ae_1080207e7e'},
      {num: 16, hash: '425472040_56_79b1d68b0f'}
    ]
  },
  'Opel_Corsa_F_GS_1.2_Sitz.&Lenkradh_100KW_EU6d_image': {
    exterior_front: [
      {num: 1, hash: '430327472_a9_c89b530e02'},
      {num: 3, hash: '430327472_69_6e6939fb4d'},
      {num: 14, hash: '430327472_57_8653492775'}
    ],
    exterior_back: [
      {num: 2, hash: '430327472_8a_ff58c6d3a5'},
      {num: 4, hash: '430327472_27_9be79ce557'}
    ],
    interior: [
      {num: 5, hash: '430327472_d4_c99a80e2f2'},
      {num: 6, hash: '430327472_1a_c795543f81'},
      {num: 7, hash: '430327472_f6_c5778b48a5'},
      {num: 8, hash: '430327472_62_af0a37318c'},
      {num: 9, hash: '430327472_78_082c86cac0'},
      {num: 10, hash: '430327472_4f_55a2be4d43'},
      {num: 11, hash: '430327472_d4_c99a80e2f2'},
      {num: 12, hash: '430327472_49_42fb67c92c'},
      {num: 13, hash: '430327472_da_22b224561b'}
    ]
  },
  'Porsche_Boxster_718_STYLE_EDITION_LED_CHRONO_BOSE_MEMORY_image': {
    exterior_front: [
      {num: 1, hash: '431195822_d1_4fbeebd706'},
      {num: 3, hash: '431195822_8d_adc95b66a5'},
      {num: 15, hash: '431195822_34_038beed578'}
    ],
    exterior_back: [
      {num: 2, hash: '431195822_87_80462565f4'},
      {num: 4, hash: '431195822_ae_1912efd2e3'}
    ],
    interior: [
      {num: 5, hash: '431195822_61_06bbcfdb2f'},
      {num: 6, hash: '431195822_0e_df357dc39a'},
      {num: 7, hash: '431195822_4f_23b357dfdb'},
      {num: 8, hash: '431195822_a2_b3b72c4717'},
      {num: 9, hash: '431195822_3b_36512a65f2'},
      {num: 10, hash: '431195822_33_4b7c0cedc5'},
      {num: 11, hash: '431195822_cc_73d9dd10d6'},
      {num: 12, hash: '431195822_da_7be7605373'},
      {num: 13, hash: '431195822_23_836143c69e'},
      {num: 14, hash: '431195822_a1_60ee8e542e'}
    ]
  }
};

/**
 * Silent image existence checker - doesn't spam console with 404s
 */
const silentImageCheck = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-cache'
    });
    return response.ok;
  } catch (error) {
    // Silent failure - no console logging
    return false;
  }
};

/**
 * Fetch images dynamically based on car manifests and known patterns
 * @param {string} carName - Full car folder name
 * @param {string} category - Category: 'exterior_front', 'exterior_back', 'interior', 'all'
 * @returns {Promise<string[]>} Array of image URLs
 */
export const fetchImagesFromFolder = async (carName, category = 'all') => {
  try {
    console.log('🚗 Fetching images for car:', carName, 'Category:', category);
    
    if (!carName) {
      console.error('❌ No car name provided');
      return [];
    }

    const basePath = `/images/cars/${carName}`;
    const foundImages = [];

    // Get car-specific manifest
    const carManifest = CAR_IMAGE_MANIFESTS[carName];
    if (!carManifest) {
      console.warn(`⚠️ No manifest found for car: ${carName}`);
      console.log('💡 Available cars:', getAvailableCarNames());
      return [];
    }

    console.log(`🔍 Using exact manifest for ${carName}`);

    // Define which categories to process
    let categoriesToProcess = [];
    switch (category.toLowerCase()) {
      case 'exterior_front':
        categoriesToProcess = ['exterior_front'];
        break;
      case 'exterior_back':
        categoriesToProcess = ['exterior_back'];
        break;
      case 'interior':
        categoriesToProcess = ['interior'];
        break;
      case 'all':
      default:
        categoriesToProcess = ['exterior_front', 'exterior_back', 'interior'];
        break;
    }

    // For each category, build exact image URLs from manifest
    for (const cat of categoriesToProcess) {
      const categoryImages = carManifest[cat] || [];
      const categoryPath = `${basePath}/${cat}`;
      
      console.log(`📂 Processing ${cat}: ${categoryImages.length} images in manifest`);
      
      for (const imageInfo of categoryImages) {
        // Build exact URL from manifest data
        const imageUrl = `${categoryPath}/image_${imageInfo.num}_csm_${imageInfo.hash}.jpg`;
        
        // Verify the image exists (no console spam)
        const exists = await silentImageCheck(imageUrl);
        
        if (exists) {
          foundImages.push(imageUrl);
          console.log(`✅ Found: image_${imageInfo.num}_csm_${imageInfo.hash}.jpg in ${cat}`);
        } else {
          console.log(`⚠️ Missing: image_${imageInfo.num}_csm_${imageInfo.hash}.jpg in ${cat}`);
        }
      }
    }

    if (foundImages.length === 0) {
      console.warn(`⚠️ No images found for: ${carName} / ${category}`);
      console.log('💡 Available cars:', getAvailableCarNames());
    } else {
      console.log(`📊 Total discovered: ${foundImages.length} images for ${carName}/${category}`);
    }

    return foundImages;
    
  } catch (error) {
    console.error('❌ Error in image discovery:', error);
    return [];
  }
};

/**
 * Get list of available car names dynamically from the manifest
 */
export const getAvailableCarNames = () => {
  return Object.keys(CAR_IMAGE_MANIFESTS);
};

/**
 * Add a new car manifest (for future extensibility)
 */
export const addCarManifest = (carName, hashes) => {
  CAR_IMAGE_MANIFESTS[carName] = { hashes };
  console.log(`✅ Added manifest for ${carName} with ${hashes.length} hashes`);
};

/**
 * Get manifest info for a specific car
 */
export const getCarManifest = (carName) => {
  return CAR_IMAGE_MANIFESTS[carName] || null;
};

/**
 * Process image data for the new car name + category approach
 */
export const processImageData = (imageData) => {
  if (!imageData) return null;
  
  // Legacy support: imageUrl for single image
  if (imageData.imageUrl) {
    return {
      images: [imageData.imageUrl],
      title: imageData.title || '',
      description: imageData.description || '',
      type: 'single',
      category: 'single'
    };
  }
  
  // New approach: carName + category
  if (imageData.carName) {
    return {
      carName: imageData.carName,
      category: imageData.category || 'all',
      title: imageData.title || '',
      description: imageData.description || '',
      type: 'gallery',
      images: [] // Will be populated after fetching
    };
  }
  
  // Direct images array
  if (imageData.images && Array.isArray(imageData.images)) {
    return {
      images: imageData.images,
      title: imageData.title || '',
      description: imageData.description || '',
      type: 'gallery',
      category: imageData.category || 'all'
    };
  }
  
  return null;
};

/**
 * Preload images for better performance
 */
export const preloadImages = async (imageUrls) => {
  const loadPromises = imageUrls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(url);
      img.src = url;
    });
  });
  
  try {
    await Promise.allSettled(loadPromises);
    console.log('✅ Image preloading completed');
  } catch (error) {
    console.log('⚠️ Some images failed to preload');
  }
};

/**
 * Get image dimensions
 */
export const getImageDimensions = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = imageUrl;
  });
};

/**
 * Validate image URLs
 */
export const validateImageUrls = async (imageUrls) => {
  const validationPromises = imageUrls.map(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      return response.ok && contentType && contentType.startsWith('image/') ? url : null;
    } catch (error) {
      return null;
    }
  });
  
  const results = await Promise.all(validationPromises);
  return results.filter(url => url !== null);
};