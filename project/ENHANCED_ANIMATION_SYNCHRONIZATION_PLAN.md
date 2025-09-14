# 🎭 Enhanced Rive Animation Synchronization Implementation Plan

## 📋 Overview
This document provides the detailed implementation plan for enhancing Rive animation synchronization with ElevenLabs agent speaking events using improved audio event detection and timeout-based state management.

## 🎯 Implementation Objectives
1. **Enhanced Audio Event Detection**: Utilize ElevenLabs `audio` events for precise speaking detection
2. **Timeout-Based State Management**: Implement smart timeouts to detect when agent stops speaking
3. **Comprehensive Debug Logging**: Add detailed logging for troubleshooting and monitoring
4. **Robust State Management**: Prevent false state changes and improve reliability

---

## 🔧 Phase 1: Enhanced Audio Event Handling

### **File**: `project/src/hooks/useElevenLabsConversation.js`

#### **1.1 Add New State Management Refs**

```javascript
// Add after line 71 (after existing refs)
// Enhanced speaking state management refs
const audioTimeoutRef = useRef(null);
const speakingStateRef = useRef('idle');
const lastAudioTimeRef = useRef(null);
const audioEventCountRef = useRef(0);
const agentResponseTimeRef = useRef(null);
```

#### **1.2 Add Speaking Timeout Constants**

```javascript
// Add after line 21 (after requestMicrophonePermission function)
// Speaking detection timeout constants
const SPEAKING_TIMEOUTS = {
  afterAudio: 500,        // Timeout after last audio chunk (ms)
  afterResponse: 2000,    // Timeout after agent_response without audio (ms)
  maxSpeaking: 30000,     // Maximum speaking duration safety timeout (ms)
  gracePeriod: 200        // Grace period before marking as stopped (ms)
};
```

#### **1.3 Add Enhanced Audio Event Handler**

```javascript
// Add after line 159 (after clientTools object)
// Enhanced audio event handler with timeout management
const handleAudioEvent = useCallback((audioEvent) => {
  audioEventCountRef.current++;
  lastAudioTimeRef.current = Date.now();
  
  console.log('🔊 [Animation Sync] Audio event received:', {
    eventId: audioEvent.event_id,
    totalAudioEvents: audioEventCountRef.current,
    currentSpeakingState: isAgentSpeaking,
    timestamp: new Date().toISOString(),
    uiMode
  });
  
  // Start speaking if not already speaking
  if (!isAgentSpeaking) {
    console.log('🎤 [Animation Sync] Agent started speaking (audio detected)');
    setIsAgentSpeaking(true);
    speakingStateRef.current = 'speaking';
  }
  
  // Clear any existing timeout
  if (audioTimeoutRef.current) {
    clearTimeout(audioTimeoutRef.current);
  }
  
  // Set new timeout for when audio stops
  audioTimeoutRef.current = setTimeout(() => {
    const timeSinceLastAudio = Date.now() - lastAudioTimeRef.current;
    console.log('🔇 [Animation Sync] Audio timeout triggered:', {
      timeSinceLastAudio,
      totalAudioEvents: audioEventCountRef.current,
      wasAgentSpeaking: isAgentSpeaking
    });
    
    if (isAgentSpeaking) {
      console.log('🏁 [Animation Sync] Agent stopped speaking (audio timeout)');
      setIsAgentSpeaking(false);
      speakingStateRef.current = 'idle';
      audioEventCountRef.current = 0;
    }
  }, SPEAKING_TIMEOUTS.afterAudio);
  
}, [isAgentSpeaking, uiMode]);
```

#### **1.4 Add Enhanced Agent Response Handler**

```javascript
// Add after handleAudioEvent function
// Enhanced agent response handler for backup speaking detection
const handleAgentResponse = useCallback((agentResponseEvent) => {
  agentResponseTimeRef.current = Date.now();
  
  console.log('🤖 [Animation Sync] Agent response received:', {
    response: agentResponseEvent.agent_response?.substring(0, 50) + '...',
    currentSpeakingState: isAgentSpeaking,
    hasAudioEvents: audioEventCountRef.current > 0,
    timestamp: new Date().toISOString()
  });
  
  // If not already speaking and no recent audio events, start speaking
  if (!isAgentSpeaking && audioEventCountRef.current === 0) {
    console.log('🎤 [Animation Sync] Agent started speaking (response detected, no audio yet)');
    setIsAgentSpeaking(true);
    speakingStateRef.current = 'speaking';
    
    // Set a longer timeout for agent response without audio
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
    }
    
    audioTimeoutRef.current = setTimeout(() => {
      console.log('🔇 [Animation Sync] Agent response timeout (no audio received)');
      if (isAgentSpeaking && audioEventCountRef.current === 0) {
        setIsAgentSpeaking(false);
        speakingStateRef.current = 'idle';
      }
    }, SPEAKING_TIMEOUTS.afterResponse);
  }
}, [isAgentSpeaking]);
```

#### **1.5 Enhanced onMessage Handler**

Replace the existing `onMessage` function (lines 249-289) with:

```javascript
onMessage: (message) => {
  console.log('💬 [Animation Sync] Message received:', {
    type: message.type,
    source: message.source,
    hasAudioEvent: !!(message.type === 'audio' && message.audio_event),
    hasAgentResponse: !!(message.type === 'agent_response'),
    timestamp: new Date().toISOString()
  });

  // Handle the actual ElevenLabs message structure
  if (message.source && message.message) {
    switch (message.source) {
      case 'ai':
        console.log('🤖 Agent message:', message.message);
        setAgentMessage(message.message);
        setAgentInterimMessage('');
        break;
      case 'user':
        console.log('👤 User message:', message.message);
        // Only set user message if it's not just "..."
        if (message.message.trim() !== '...') {
          setUserMessage(message.message);
          setUserInterimMessage('');
        }
        break;
      default:
        console.log('📨 Unknown message source:', message.source);
        break;
    }
  } else if (message.type) {
    // Handle other ElevenLabs event types with enhanced audio detection
    console.log('📨 Event type:', message.type, {
      hasAudioEvent: !!(message.audio_event),
      hasAgentResponse: !!(message.agent_response_event)
    });
    
    // ENHANCED: Handle audio events for precise speaking detection
    if (message.type === 'audio' && message.audio_event) {
      handleAudioEvent(message.audio_event);
      
      // Play audio only if in voice mode and audio not muted
      if (uiMode === 'voice' && !audioOutputMuted) {
        console.log('🔊 Playing audio in voice mode');
        // Audio is automatically handled by the ElevenLabs SDK
      } else {
        console.log('🔇 Audio received but muted (chat mode or audio disabled)');
      }
    }
    
    // ENHANCED: Handle agent response events for backup speaking detection
    if (message.type === 'agent_response' && message.agent_response_event) {
      handleAgentResponse(message.agent_response_event);
    }
    
  } else {
    // Handle any other message formats
    console.log('📨 Other message format:', message);
  }
},
```

#### **1.6 Enhanced Cleanup in Disconnect Function**

Add cleanup code to the `disconnect` function (around line 395):

```javascript
// Add after line 395 (setError(null))
// Enhanced cleanup for speaking state management
if (audioTimeoutRef.current) {
  clearTimeout(audioTimeoutRef.current);
  audioTimeoutRef.current = null;
}
speakingStateRef.current = 'idle';
lastAudioTimeRef.current = null;
audioEventCountRef.current = 0;
agentResponseTimeRef.current = null;

console.log('🧹 [Animation Sync] Speaking state management cleaned up');
```

---

## 🔧 Phase 2: Enhanced Debug Information

### **File**: `project/src/hooks/useElevenLabsConversation.js`

#### **2.1 Add Debug State**

```javascript
// Add after line 62 (after existing state)
// Enhanced debug state for animation synchronization
const [animationDebugInfo, setAnimationDebugInfo] = useState({
  totalAudioEvents: 0,
  lastAudioTime: null,
  lastResponseTime: null,
  speakingDuration: 0,
  timeoutActive: false,
  speakingState: 'idle'
});
```

#### **2.2 Update Debug Info Function**

```javascript
// Add after handleAgentResponse function
// Update debug information
const updateDebugInfo = useCallback(() => {
  setAnimationDebugInfo(prev => ({
    ...prev,
    totalAudioEvents: audioEventCountRef.current,
    lastAudioTime: lastAudioTimeRef.current,
    lastResponseTime: agentResponseTimeRef.current,
    timeoutActive: !!audioTimeoutRef.current,
    speakingState: speakingStateRef.current,
    speakingDuration: lastAudioTimeRef.current && agentResponseTimeRef.current 
      ? lastAudioTimeRef.current - agentResponseTimeRef.current 
      : 0
  }));
}, []);
```

#### **2.3 Add Debug Info to Return Object**

```javascript
// Add to the return object (around line 567)
// Enhanced debug information for animation synchronization
animationDebugInfo,
updateDebugInfo,

// Speaking state management info
getSpeakingDebugInfo: () => ({
  isAgentSpeaking,
  speakingState: speakingStateRef.current,
  audioEventCount: audioEventCountRef.current,
  lastAudioTime: lastAudioTimeRef.current,
  timeoutActive: !!audioTimeoutRef.current,
  timeSinceLastAudio: lastAudioTimeRef.current ? Date.now() - lastAudioTimeRef.current : null
}),
```

---

## 🔧 Phase 3: Enhanced ChatAvatar Debug Display

### **File**: `project/src/components/ChatAvatar.jsx`

#### **3.1 Get Debug Info from Hook**

```javascript
// Add after line 66 (in the useElevenLabsConversation destructuring)
// Get enhanced debug information
animationDebugInfo,
getSpeakingDebugInfo,
```

#### **3.2 Enhanced Debug Overlay**

Replace the existing debug overlay (lines 440-470) with:

```javascript
{/* Enhanced Animation Debug Overlay */}
{showAnimationDebug && (
  <div className="absolute top-2 left-2 bg-black bg-opacity-90 text-white text-xs p-3 rounded-lg z-50 max-w-sm">
    <div className="font-bold mb-2 text-yellow-300">🎭 Animation Sync Debug</div>
    
    {/* Basic State Info */}
    <div className="mb-2 border-b border-gray-600 pb-2">
      <div>Mode: <span className="text-blue-300">{mode}</span></div>
      <div>Loaded: {isLoaded ? '✅' : '❌'}</div>
      <div>Healthy: {isHealthy ? '✅' : '⚠️'}</div>
      <div>Error: {error || 'None'}</div>
    </div>
    
    {/* Speaking State Info */}
    <div className="mb-2 border-b border-gray-600 pb-2">
      <div>Agent Speaking: {isAgentSpeaking ? '🗣️ YES' : '💤 NO'}</div>
      <div>Animation State: {currentAnimationStates?.isSpeaking ? '🎬 SPEAKING' : '😴 IDLE'}</div>
      <div>Target Animation: <span className="text-green-300">{isAgentSpeaking ? 'speaking abass' : 'idle abass'}</span></div>
    </div>
    
    {/* Audio Event Info */}
    {getSpeakingDebugInfo && (
      <div className="mb-2 border-b border-gray-600 pb-2">
        <div>Audio Events: <span className="text-purple-300">{getSpeakingDebugInfo().audioEventCount}</span></div>
        <div>Last Audio: <span className="text-purple-300">{
          getSpeakingDebugInfo().lastAudioTime 
            ? `${Math.round((Date.now() - getSpeakingDebugInfo().lastAudioTime) / 1000)}s ago`
            : 'None'
        }</span></div>
        <div>Timeout Active: {getSpeakingDebugInfo().timeoutActive ? '⏰ YES' : '❌ NO'}</div>
        <div>Speaking State: <span className="text-yellow-300">{getSpeakingDebugInfo().speakingState}</span></div>
      </div>
    )}
    
    {/* Animation States */}
    {currentAnimationStates && (
      <div className="mb-2">
        <div className="font-semibold text-cyan-300">Animation States:</div>
        {Object.entries(currentAnimationStates).map(([key, value]) => (
          <div key={key} className="ml-2 text-xs">
            {key}: {typeof value === 'boolean' ? (value ? '✅' : '❌') : value}
          </div>
        ))}
      </div>
    )}
    
    <div className="mt-2 text-xs opacity-70 border-t border-gray-600 pt-2">
      Press Ctrl+Shift+D to toggle
    </div>
  </div>
)}
```

---

## 🧪 Phase 4: Testing Strategy

### **4.1 Console Log Verification**
1. **Monitor Console**: Watch for `[Animation Sync]` prefixed logs
2. **Audio Events**: Verify audio events are being received and counted
3. **Timeout Behavior**: Confirm timeouts are firing correctly
4. **State Changes**: Validate `isAgentSpeaking` changes match audio activity

### **4.2 Debug Overlay Testing**
1. **Enable Debug**: Press `Ctrl+Shift+D` in ChatAvatar
2. **Monitor Real-time**: Watch state changes during agent speech
3. **Verify Timing**: Check that animation responds immediately to audio
4. **Timeout Validation**: Confirm animation stops shortly after audio ends

### **4.3 Animation Validation**
1. **Speaking Animation**: Verify `'speaking abass'` plays when agent talks
2. **Idle Animation**: Confirm `'idle abass'` plays when agent stops
3. **Smooth Transitions**: Check for natural animation transitions
4. **No False Triggers**: Ensure animation doesn't trigger without speech

---

## 📊 Expected Improvements

### **Before Implementation**
- ❌ Animation triggered only by `onModeChange` events
- ❌ Imprecise timing with agent speech
- ❌ No detection of when agent stops speaking
- ❌ Limited debugging information

### **After Implementation**
- ✅ Animation triggered by actual `audio` events
- ✅ Precise timing with 500ms timeout after last audio
- ✅ Automatic detection of speaking start/stop
- ✅ Comprehensive debug logging and monitoring
- ✅ Backup detection via `agent_response` events
- ✅ Robust state management with cleanup

---

## 🎯 Success Criteria

1. **Responsive Animation**: Animation starts within 100ms of agent speech
2. **Accurate Timing**: Animation stops within 500ms of speech ending
3. **Reliable Detection**: 95%+ accuracy in speaking state detection
4. **Debug Visibility**: Clear console logs and debug overlay information
5. **No False Positives**: Animation only triggers during actual speech
6. **Cross-Mode Support**: Works in both chat and voice modes

---

## 🔄 Next Steps

1. **Implement Changes**: Apply all code modifications as detailed above
2. **Test Thoroughly**: Use debug overlay and console logs to validate behavior
3. **Fine-tune Timeouts**: Adjust timeout values based on testing results
4. **Monitor Performance**: Ensure changes don't impact overall performance
5. **Gather Feedback**: Test with real conversations to validate improvements

This implementation will provide significantly more accurate and responsive Rive animation synchronization with ElevenLabs agent speech events.