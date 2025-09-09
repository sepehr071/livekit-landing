/**
 * 🔬 ElevenLabs Overrides Debug Test
 * Comprehensive testing for override functionality
 */

import { getCarNameFromURL } from '../utils/urlParams';

/**
 * Test different override formats to see what works
 */
export const testOverrideFormats = () => {
  console.log('🔬 ===== ELEVENLABS OVERRIDE FORMATS TEST =====');
  
  const carName = getCarNameFromURL() || 'BMW X5'; // Default for testing
  
  // Format 1: Current implementation (from docs)
  const format1 = {
    agent: {
      first_message: `Hello! I see you're interested in the ${carName}. I'm here to help you learn everything about this amazing vehicle!`,
      prompt: {
        prompt: `You are a professional car sales assistant. The customer is interested in the ${carName}. Focus your conversation on this specific vehicle and its features.`
      },
      language: "en"
    }
  };
  
  // Format 2: Simplified structure
  const format2 = {
    agent: {
      first_message: `Hello! I see you're interested in the ${carName}. How can I help?`,
      prompt: `You are a car sales assistant helping with the ${carName}.`
    }
  };
  
  // Format 3: Direct properties (alternative)
  const format3 = {
    first_message: `Hello! I see you're interested in the ${carName}. What would you like to know?`,
    system_prompt: `You are a car sales assistant. The customer wants to know about the ${carName}.`
  };
  
  // Format 4: Match exact documentation structure
  const format4 = {
    agent: {
      prompt: {
        prompt: `You are a professional car sales assistant. The customer is interested in the ${carName}. Focus on this vehicle.`
      },
      first_message: `Hello! I see you're interested in the ${carName}. How can I assist you?`,
      language: "en"
    }
  };
  
  console.log('📝 Testing override formats:');
  console.log('Format 1 (Current):', JSON.stringify(format1, null, 2));
  console.log('Format 2 (Simplified):', JSON.stringify(format2, null, 2));
  console.log('Format 3 (Direct):', JSON.stringify(format3, null, 2));
  console.log('Format 4 (Docs Match):', JSON.stringify(format4, null, 2));
  
  return { format1, format2, format3, format4 };
};

/**
 * Validate override structure against ElevenLabs requirements
 */
export const validateOverrideStructure = (overrides) => {
  console.log('✅ ===== OVERRIDE STRUCTURE VALIDATION =====');
  
  const issues = [];
  const warnings = [];
  
  if (!overrides) {
    issues.push('Overrides object is null/undefined');
    return { valid: false, issues, warnings };
  }
  
  // Check main structure
  if (!overrides.agent) {
    issues.push('Missing "agent" property in overrides');
  } else {
    // Check agent properties
    if (!overrides.agent.first_message) {
      issues.push('Missing "first_message" in agent object');
    } else if (typeof overrides.agent.first_message !== 'string') {
      issues.push('first_message must be a string');
    } else if (overrides.agent.first_message.length === 0) {
      warnings.push('first_message is empty string');
    }
    
    // Check prompt structure
    if (!overrides.agent.prompt) {
      warnings.push('Missing "prompt" object in agent');
    } else if (!overrides.agent.prompt.prompt) {
      warnings.push('Missing "prompt" property inside prompt object');
    } else if (typeof overrides.agent.prompt.prompt !== 'string') {
      issues.push('prompt.prompt must be a string');
    }
    
    // Check language
    if (overrides.agent.language && typeof overrides.agent.language !== 'string') {
      issues.push('language must be a string');
    }
  }
  
  const valid = issues.length === 0;
  
  console.log(`🔍 Validation result: ${valid ? '✅ VALID' : '❌ INVALID'}`);
  if (issues.length > 0) {
    console.log('🚨 Issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }
  if (warnings.length > 0) {
    console.log('⚠️ Warnings:');
    warnings.forEach(warning => console.log(`  - ${warning}`));
  }
  
  return { valid, issues, warnings };
};

/**
 * Test ElevenLabs SDK version and capabilities
 */
export const testSDKCapabilities = () => {
  console.log('📦 ===== ELEVENLABS SDK CAPABILITIES TEST =====');
  
  // Check SDK imports
  console.log('Conversation import:', typeof Conversation);
  console.log('ConversationInitiationData import:', typeof ConversationInitiationData);
  
  // Check SDK version if available
  if (window.ElevenLabs) {
    console.log('ElevenLabs global object:', window.ElevenLabs);
  }
  
  // Try to create a test ConversationInitiationData
  try {
    const testConfig = new ConversationInitiationData({
      conversation_config_override: {
        agent: {
          first_message: "Test message",
          prompt: { prompt: "Test prompt" }
        }
      }
    });
    console.log('✅ ConversationInitiationData creation successful');
    console.log('Test config:', testConfig);
  } catch (error) {
    console.error('❌ ConversationInitiationData creation failed:', error);
  }
  
  // Check startSession method signature
  console.log('Conversation.startSession:', typeof Conversation.startSession);
  
  return {
    conversationAvailable: typeof Conversation !== 'undefined',
    initiationDataAvailable: typeof ConversationInitiationData !== 'undefined',
    startSessionAvailable: typeof Conversation.startSession === 'function'
  };
};

/**
 * Generate different override configurations for testing
 */
export const generateTestOverrides = () => {
  console.log('🧪 ===== GENERATING TEST OVERRIDE CONFIGURATIONS =====');
  
  const carName = getCarNameFromURL() || 'BMW X5';
  
  const testConfigs = {
    minimal: {
      agent: {
        first_message: `Hi! You're looking at the ${carName}.`
      }
    },
    
    withPrompt: {
      agent: {
        first_message: `Hello! I see you're interested in the ${carName}.`,
        prompt: {
          prompt: `You are helping with the ${carName}.`
        }
      }
    },
    
    withLanguage: {
      agent: {
        first_message: `Hello! I see you're interested in the ${carName}.`,
        prompt: {
          prompt: `You are helping with the ${carName}.`
        },
        language: "en"
      }
    },
    
    alternative: {
      first_message: `Hello! You're interested in the ${carName}.`,
      system_prompt: `Help with the ${carName}.`
    }
  };
  
  Object.entries(testConfigs).forEach(([name, config]) => {
    console.log(`📝 ${name.toUpperCase()} CONFIG:`, JSON.stringify(config, null, 2));
    validateOverrideStructure(config);
  });
  
  return testConfigs;
};

/**
 * Full debug suite for overrides
 */
export const debugOverrides = () => {
  console.log('🚀 ===== FULL ELEVENLABS OVERRIDES DEBUG =====');
  
  const results = {
    formats: testOverrideFormats(),
    sdk: testSDKCapabilities(),
    testConfigs: generateTestOverrides(),
    currentUrl: window.location.href,
    carName: getCarNameFromURL()
  };
  
  console.log('\n📊 ===== DEBUG SUMMARY =====');
  console.log('Car name:', results.carName);
  console.log('SDK working:', results.sdk.conversationAvailable && results.sdk.initiationDataAvailable);
  console.log('Current URL:', results.currentUrl);
  
  console.log('\n🎯 NEXT DEBUGGING STEPS:');
  console.log('1. Check browser Network tab for actual request to ElevenLabs');
  console.log('2. Look for any ElevenLabs SDK errors in console');
  console.log('3. Verify agent ID is correct');
  console.log('4. Try minimal override first');
  
  return results;
};

// Auto-run in development mode
if (import.meta.env?.DEV) {
  console.log('🔬 Auto-running ElevenLabs overrides debug...');
  setTimeout(() => debugOverrides(), 1500);
}

// Make available globally
if (typeof window !== 'undefined') {
  window.debugOverrides = debugOverrides;
  window.elevenLabsOverrideDebug = {
    testOverrideFormats,
    validateOverrideStructure,
    testSDKCapabilities,
    generateTestOverrides,
    debugOverrides
  };
  
  console.log('🛠️ ElevenLabs override debug tools available:');
  console.log('  window.debugOverrides() - Full debug suite');
  console.log('  window.elevenLabsOverrideDebug.* - Individual functions');
}