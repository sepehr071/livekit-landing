/**
 * Test utility for ElevenLabs Dynamic Variables
 * Tests car name extraction from URL parameters
 */

import { getCarNameFromURL, getAllURLParams, createDynamicVariables, getExampleURLs } from '../utils/urlParams';

// Test function to validate URL parameter extraction
const testDynamicVariables = () => {
  console.log('\n🧪 DYNAMIC VARIABLES TEST');
  console.log('=========================');

  // Test current URL
  console.log('\n📋 Current URL Analysis:');
  console.log('URL:', window.location.href);
  
  const carName = getCarNameFromURL();
  const allParams = getAllURLParams();
  const dynamicVars = createDynamicVariables();
  
  console.log('Car Name:', carName || 'Not found');
  console.log('All Parameters:', allParams);
  console.log('Dynamic Variables for ElevenLabs:', dynamicVars);

  // Test example URLs
  console.log('\n🔗 Example URLs for Testing:');
  const examples = getExampleURLs();
  examples.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });

  // Simulate different URL scenarios
  console.log('\n🧪 URL Parameter Scenarios:');
  
  const scenarios = [
    { url: '?car=BMW_X5', expected: 'BMW X5' },
    { url: '?carName=Audi_A4_Quattro', expected: 'Audi A4 Quattro' },
    { url: '?model=Tesla_Model_3', expected: 'Tesla Model 3' },
    { url: '?car=Mercedes_C_Class&customer=Hans&budget=50000', expected: 'Mercedes C Class' },
    { url: '', expected: null }
  ];

  scenarios.forEach((scenario, index) => {
    // Temporarily modify URL search for testing
    const originalSearch = window.location.search;
    
    // Mock URLSearchParams for this test
    const mockURLSearchParams = new URLSearchParams(scenario.url);
    const originalURLSearchParams = window.URLSearchParams;
    
    // Temporarily override URLSearchParams
    window.URLSearchParams = function(search) {
      return mockURLSearchParams;
    };
    
    const testCarName = getCarNameFromURL();
    const testDynamicVars = createDynamicVariables();
    
    console.log(`\nScenario ${index + 1}: ${scenario.url || 'No parameters'}`);
    console.log(`Expected: ${scenario.expected || 'null'}`);
    console.log(`Actual: ${testCarName || 'null'}`);
    console.log(`✅ ${testCarName === scenario.expected ? 'PASS' : 'FAIL'}`);
    console.log(`Dynamic Variables:`, testDynamicVars);
    
    // Restore original URLSearchParams
    window.URLSearchParams = originalURLSearchParams;
  });

  // Test ElevenLabs integration format
  console.log('\n🤖 ElevenLabs Integration:');
  console.log('The dynamic variables will be passed to ElevenLabs as:');
  console.log('sessionConfig = {');
  console.log('  agentId: AGENT_ID,');
  console.log('  clientTools,');
  console.log('  dynamic_variables:', dynamicVars);
  console.log('  // ... other config');
  console.log('};');

  // Usage examples
  console.log('\n📚 Usage Examples:');
  console.log('1. Basic car focus:');
  console.log('   URL: yoursite.com?car=BMW_X5');
  console.log('   Agent receives: { car_name: "BMW X5", target_car: "BMW X5" }');
  
  console.log('\n2. Customer personalization:');
  console.log('   URL: yoursite.com?car=Audi_A4&customer=Hans_Mueller&budget=40000');
  console.log('   Agent receives: { car_name: "Audi A4", target_car: "Audi A4", customer_name: "Hans Mueller", budget: "40000" }');
  
  console.log('\n3. Language setting:');
  console.log('   URL: yoursite.com?car=Tesla_Model_3&language=de');
  console.log('   Agent receives: { car_name: "Tesla Model 3", target_car: "Tesla Model 3", language: "de" }');

  console.log('\n✅ Dynamic Variables Test Complete!');
};

// Export for use in other components
export { testDynamicVariables };

// Auto-run test when in development
if (process.env.NODE_ENV === 'development') {
  // Run test after a short delay to ensure DOM is ready
  setTimeout(() => {
    console.log('\n🚗 Auto-running Dynamic Variables Test...');
    testDynamicVariables();
  }, 1000);
}

export default testDynamicVariables;