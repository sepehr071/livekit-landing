/**
 * Simple test to verify URL parameter functionality
 * Place this in your browser console to test
 */

import { getCarNameFromURL, createDynamicVariables } from '../utils/urlParams';

export const testURLParameters = () => {
  console.log('\n🧪 URL PARAMETER TEST');
  console.log('====================');
  
  // Test current URL
  console.log('Current URL:', window.location.href);
  console.log('Search params:', window.location.search);
  
  // Extract car name
  const carName = getCarNameFromURL();
  console.log('Extracted car name:', carName);
  
  // Create dynamic variables
  const dynamicVars = createDynamicVariables();
  console.log('Dynamic variables for ElevenLabs:', dynamicVars);
  
  // Test navigation preservation
  console.log('\n🔗 Navigation Test:');
  console.log('When you click the widget, it should navigate to:');
  console.log(`/chat${window.location.search}`);
  
  // Instructions
  console.log('\n📋 Testing Instructions:');
  console.log('1. Visit: http://localhost:5173?car=BMW_X5');
  console.log('2. Open browser console and run: testURLParameters()');
  console.log('3. Click the chat widget');
  console.log('4. Check that URL is: http://localhost:5173/chat?car=BMW_X5');
  console.log('5. Check console for "Dynamic variables extracted" messages');
  
  return {
    carName,
    dynamicVars,
    currentURL: window.location.href,
    expectedChatURL: `/chat${window.location.search}`
  };
};

// Make it globally available for console testing
if (typeof window !== 'undefined') {
  window.testURLParameters = testURLParameters;
}

export default testURLParameters;