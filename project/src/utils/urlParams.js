/**
 * Simple URL parameter utilities for extracting car name
 * Supports: ?car=BMW_X5 or ?carName=Audi_A4
 */

/**
 * Extract car name from URL parameters
 * @returns {string|null} Car name from URL or null if not found
 */
export const getCarNameFromURL = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check multiple possible parameter names
    const carName = urlParams.get('car') || 
                   urlParams.get('carName') || 
                   urlParams.get('model') ||
                   null;
    
    if (carName) {
      // Clean the car name - replace underscores with spaces for better readability
      const cleanCarName = carName.replace(/_/g, ' ').trim();
      console.log('🚗 Car name extracted from URL:', cleanCarName);
      return cleanCarName;
    }
    
    console.log('📋 No car parameter found in URL');
    return null;
  } catch (error) {
    console.error('❌ Error extracting car name from URL:', error);
    return null;
  }
};

/**
 * Get all URL parameters as an object
 * @returns {Object} All URL parameters
 */
export const getAllURLParams = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    
    console.log('📋 All URL parameters:', params);
    return params;
  } catch (error) {
    console.error('❌ Error extracting URL parameters:', error);
    return {};
  }
};

/**
 * Create dynamic variables object for ElevenLabs
 * ALWAYS returns car_name to prevent "Missing required dynamic variables" error
 * @returns {Object} Dynamic variables object
 */
export const createDynamicVariables = () => {
  const carName = getCarNameFromURL();
  const allParams = getAllURLParams();
  
  // CRITICAL: Always provide car_name since ElevenLabs dashboard references it
  // If no car parameter found, provide empty string (ElevenLabs can handle with conditional blocks)
  const dynamicVars = {
    car_name: carName || '',  // ALWAYS present - required by ElevenLabs
    target_car: carName || '' // Alternative variable name - also always present
  };
  
  // Add any other useful parameters
  if (allParams.customer) {
    dynamicVars.customer_name = allParams.customer.replace(/_/g, ' ');
  }
  
  if (allParams.budget) {
    dynamicVars.budget = allParams.budget;
  }
  
  if (allParams.language || allParams.lang) {
    dynamicVars.language = allParams.language || allParams.lang;
  }
  
  console.log('🔧 Created dynamic variables for ElevenLabs (car_name always present):', dynamicVars);
  
  // Log specifically about car_name status
  if (carName) {
    console.log(`🚗 Car focus: Agent will discuss ${carName}`);
  } else {
    console.log('🚗 No car specified: Agent will use general car sales approach');
  }
  
  return dynamicVars;
};

/**
 * Generate example URLs for testing
 * @returns {Array} Array of example URLs
 */
export const getExampleURLs = () => {
  const baseURL = window.location.origin + window.location.pathname;
  
  return [
    `${baseURL}?car=BMW_X5`,
    `${baseURL}?car=Audi_A4&customer=Hans_Mueller`,
    `${baseURL}?carName=Mercedes_C_Class&budget=50000`,
    `${baseURL}?model=Tesla_Model_3&language=de`,
    `${baseURL}?car=Porsche_911&customer=Maria&budget=120000&language=en`
  ];
};