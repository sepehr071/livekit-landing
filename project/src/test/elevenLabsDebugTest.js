/**
 * 🔬 ElevenLabs Dynamic Variables Debug Test
 * Comprehensive debugging for dynamic variables issues
 */

import { createDynamicVariables, getCarNameFromURL, getAllURLParams } from '../utils/urlParams';

/**
 * Test current dynamic variables implementation
 */
export const debugDynamicVariables = () => {
  console.log('🔬 ===== ELEVENLABS DYNAMIC VARIABLES DEBUG =====');
  
  // Test 1: Current URL analysis
  console.log('📍 Current URL:', window.location.href);
  console.log('📍 Search params:', window.location.search);
  
  // Test 2: Parameter extraction
  const carName = getCarNameFromURL();
  const allParams = getAllURLParams();
  const dynamicVars = createDynamicVariables();
  
  console.log('🚗 Car name extracted:', carName);
  console.log('📋 All URL params:', allParams);
  console.log('🔧 Dynamic variables created:', dynamicVars);
  
  // Test 3: Variable validation
  console.log('✅ Variable validation:');
  console.log('  - car_name present:', 'car_name' in dynamicVars);
  console.log('  - car_name value:', JSON.stringify(dynamicVars.car_name));
  console.log('  - car_name type:', typeof dynamicVars.car_name);
  console.log('  - target_car present:', 'target_car' in dynamicVars);
  console.log('  - Empty object check:', Object.keys(dynamicVars).length === 0);
  
  // Test 4: ElevenLabs SDK format check
  console.log('🎯 ElevenLabs SDK format:');
  console.log('  Session config would include:');
  console.log('  dynamic_variables:', JSON.stringify(dynamicVars, null, 2));
  
  // Test 5: ElevenLabs URL parameter formats (as shown in docs)
  console.log('🌐 ElevenLabs URL parameter formats:');
  
  // Method 1: Base64-encoded JSON
  if (Object.keys(dynamicVars).length > 0) {
    const base64Vars = btoa(JSON.stringify(dynamicVars));
    console.log('  Method 1 (Base64):');
    console.log('    Encoded:', base64Vars);
    console.log('    URL example:', `https://elevenlabs.io/app/talk-to?agent_id=YOUR_AGENT_ID&vars=${base64Vars}`);
    
    // Test decode
    try {
      const decoded = JSON.parse(atob(base64Vars));
      console.log('    Decode test:', decoded);
    } catch (e) {
      console.error('    Decode error:', e);
    }
  }
  
  // Method 2: Individual parameters
  console.log('  Method 2 (Individual params):');
  Object.entries(dynamicVars).forEach(([key, value]) => {
    console.log(`    var_${key}=${encodeURIComponent(value)}`);
  });
  
  const params = new URLSearchParams();
  params.append('agent_id', 'YOUR_AGENT_ID');
  Object.entries(dynamicVars).forEach(([key, value]) => {
    params.append(`var_${key}`, encodeURIComponent(value));
  });
  console.log('    Full URL:', `https://elevenlabs.io/app/talk-to?${params.toString()}`);
  
  // Test 6: Common issues check
  console.log('🚨 Common issues check:');
  console.log('  - car_name is string:', typeof dynamicVars.car_name === 'string');
  console.log('  - car_name has value:', dynamicVars.car_name !== '');
  console.log('  - car_name not undefined:', dynamicVars.car_name !== undefined);
  console.log('  - car_name not null:', dynamicVars.car_name !== null);
  console.log('  - Variables object not empty:', Object.keys(dynamicVars).length > 0);
  
  // Test 7: Expected ElevenLabs dashboard variables
  console.log('🤖 Expected in ElevenLabs dashboard:');
  console.log('  System prompt should use: {{#car_name}} and {{^car_name}}');
  console.log('  First message should use: {{#car_name}} and {{^car_name}}');
  console.log('  Never use {{car_name}} directly without conditional blocks');
  
  return {
    currentUrl: window.location.href,
    carName,
    allParams,
    dynamicVars,
    hasCarName: 'car_name' in dynamicVars,
    carNameValue: dynamicVars.car_name,
    base64Encoded: Object.keys(dynamicVars).length > 0 ? btoa(JSON.stringify(dynamicVars)) : null
  };
};

/**
 * Test with different URL scenarios
 */
export const testDifferentScenarios = () => {
  console.log('🧪 ===== TESTING DIFFERENT URL SCENARIOS =====');
  
  const scenarios = [
    '',  // No parameters
    '?car=BMW_X5',  // Basic car parameter
    '?carName=Audi_A4',  // Alternative parameter
    '?model=Tesla_Model_3',  // Model parameter
    '?car=Mercedes_C_Class&customer=John&budget=50000',  // Multiple parameters
    '?car=',  // Empty car parameter
    '?someother=value'  // Unrelated parameters
  ];
  
  scenarios.forEach((search, index) => {
    console.log(`\n📝 Scenario ${index + 1}: "${search}"`);
    
    // Temporarily change URL for testing
    const originalSearch = window.location.search;
    try {
      // Mock the search params for testing
      const mockParams = new URLSearchParams(search);
      Object.defineProperty(window.location, 'search', {
        get: () => search,
        configurable: true
      });
      
      const carName = getCarNameFromURL();
      const dynamicVars = createDynamicVariables();
      
      console.log('  Car name:', carName);
      console.log('  Dynamic vars:', dynamicVars);
      console.log('  car_name present:', 'car_name' in dynamicVars);
      console.log('  car_name value:', JSON.stringify(dynamicVars.car_name));
      
    } finally {
      // Restore original search
      Object.defineProperty(window.location, 'search', {
        get: () => originalSearch,
        configurable: true
      });
    }
  });
};

/**
 * Generate test URLs for the user to try
 */
export const generateTestURLs = () => {
  console.log('🔗 ===== TEST URLS TO TRY =====');
  
  const baseUrl = window.location.origin + window.location.pathname;
  const testUrls = [
    `${baseUrl}?car=BMW_X5`,
    `${baseUrl}?car=Audi_A4&customer=Hans&budget=50000`,
    `${baseUrl}?carName=Mercedes_C_Class`,
    `${baseUrl}?model=Tesla_Model_3`,
    `${baseUrl}  // No parameters - should show general message`
  ];
  
  testUrls.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });
  
  return testUrls;
};

/**
 * Check ElevenLabs connection and variables
 */
export const checkElevenLabsConnection = () => {
  console.log('🔌 ===== ELEVENLABS CONNECTION CHECK =====');
  
  // Check if ElevenLabs SDK is loaded
  console.log('📦 ElevenLabs SDK loaded:', typeof window.ElevenLabs !== 'undefined');
  
  // Check current dynamic variables
  const dynamicVars = createDynamicVariables();
  console.log('🔧 Current dynamic variables:', dynamicVars);
  
  // Simulate what would be sent to ElevenLabs
  const sessionConfig = {
    agentId: 'agent_7401k4hv3j1je1ms4esr4sjnms5t',
    dynamic_variables: dynamicVars
  };
  
  console.log('📤 Would send to ElevenLabs:');
  console.log(JSON.stringify(sessionConfig, null, 2));
  
  // Check for potential issues
  const issues = [];
  
  if (!dynamicVars.car_name && dynamicVars.car_name !== '') {
    issues.push('car_name is missing from dynamic_variables');
  }
  
  if (typeof dynamicVars.car_name !== 'string') {
    issues.push(`car_name should be string, got ${typeof dynamicVars.car_name}`);
  }
  
  if (Object.keys(dynamicVars).length === 0) {
    issues.push('dynamic_variables object is empty');
  }
  
  if (issues.length > 0) {
    console.log('🚨 Potential issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  } else {
    console.log('✅ No obvious issues found with dynamic variables');
  }
  
  return { sessionConfig, issues };
};

/**
 * Run all debug tests
 */
export const runFullDebugSuite = () => {
  console.log('🚀 Running full ElevenLabs debug suite...\n');
  
  const results = {
    basicDebug: debugDynamicVariables(),
    scenarios: testDifferentScenarios(),
    testUrls: generateTestURLs(),
    connection: checkElevenLabsConnection()
  };
  
  console.log('\n📊 ===== DEBUG SUMMARY =====');
  console.log('Current car_name value:', JSON.stringify(results.basicDebug.carNameValue));
  console.log('Has car_name in variables:', results.basicDebug.hasCarName);
  console.log('Issues found:', results.connection.issues.length);
  
  if (results.connection.issues.length > 0) {
    console.log('Issues to fix:');
    results.connection.issues.forEach(issue => console.log(`  ❌ ${issue}`));
  }
  
  console.log('\n🎯 Next steps:');
  console.log('1. Check console for any ElevenLabs SDK errors');
  console.log('2. Verify ElevenLabs dashboard uses {{#car_name}} conditional blocks');
  console.log('3. Test with one of the generated URLs above');
  console.log('4. Check network tab for actual request to ElevenLabs');
  
  return results;
};

// Auto-run in development mode
if (import.meta.env?.DEV) {
  console.log('🔬 Auto-running ElevenLabs debug suite...');
  setTimeout(() => runFullDebugSuite(), 1000);
}

// Make available globally for manual testing
if (typeof window !== 'undefined') {
  window.debugElevenLabs = runFullDebugSuite;
  window.elevenLabsDebug = {
    debugDynamicVariables,
    testDifferentScenarios,
    generateTestURLs,
    checkElevenLabsConnection,
    runFullDebugSuite
  };
  
  console.log('🛠️ ElevenLabs debug tools available:');
  console.log('  window.debugElevenLabs() - Run full debug suite');
  console.log('  window.elevenLabsDebug.* - Individual debug functions');
}