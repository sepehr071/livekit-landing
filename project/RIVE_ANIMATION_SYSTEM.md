# 🎭 Enhanced Rive Animation State Control System

## Overview

This documentation covers the robust animation state management system implemented for controlling the "isSpeaking" animation mode in your Rive character. The system provides cross-mode support, enhanced debugging, health monitoring, and automatic error recovery.

## 🎯 Key Features

### ✅ **Robust State Management**
- **Retry Logic**: Automatic retry on failed state changes (up to 3 attempts)
- **State Verification**: Confirms animation states are actually applied
- **Force State Setting**: Manual override for debugging/recovery scenarios
- **State History Tracking**: Maintains log of recent state changes

### ✅ **Cross-Mode Animation Support**
- **Chat Mode**: Visual speaking animation (no audio interference)
- **Voice Mode**: Full animation control with audio synchronization
- **Seamless Switching**: Animation continues working when switching between modes

### ✅ **Health Monitoring & Diagnostics**
- **Real-time Health Checks**: Continuous monitoring of animation system
- **Comprehensive Diagnostics**: Detailed system status reporting
- **Visual Debug Overlay**: Press `Ctrl+Shift+D` to toggle debug information
- **Error Recovery**: Automatic detection and recovery from animation failures

### ✅ **Enhanced Debugging**
- **Detailed Logging**: Comprehensive console output when debug mode is enabled
- **State Inspection**: Real-time view of animation states and changes
- **Performance Monitoring**: Track state change timing and success rates
- **Visual Indicators**: On-screen health warnings and status displays

## 🔧 Architecture

### Core Components

#### 1. **Enhanced useRive Hook** (`src/hooks/useRive.js`)
```javascript
const {
  // Core functionality
  canvasRef,
  riveInstance,
  isLoaded,
  error,
  
  // Enhanced state management
  setAnimationState,
  getAnimationState,
  forceAnimationState,
  
  // Diagnostics and monitoring
  availableInputs,
  currentAnimationStates,
  isHealthy,
  getAnimationDiagnostics,
  
  // Debug mode
  enableDebug,
  debugLog
} = useRive('/danak.riv', true); // Enable debug mode
```

**Key Features:**
- **Official Rive API Compliance**: Uses official Rive methods like `stateMachineInputs()`, `cleanup()`, and `resizeDrawingSurfaceToCanvas()`
- **Enhanced Event Handling**: Implements official Rive callbacks (`onLoad`, `onLoadError`, `onStateChange`, etc.)
- **Automatic Health Monitoring**: Uses official Rive properties (`isPlaying`, `isPaused`, `isStopped`) for health checks
- **State Verification**: Verifies state changes using official Rive state machine input objects
- **Retry Logic**: Automatically retries failed state changes with proper error handling
- **Comprehensive Logging**: Detailed debug output following Rive best practices

#### 2. **Enhanced ChatAvatar Component** (`src/components/ChatAvatar.jsx`)
```javascript
// Cross-mode animation support
if (mode === "voice") {
  // Voice mode: Full animation control
  setAnimationState("isSpeaking", isAgentSpeaking);
  setAnimationState("IsListening", isUserSpeaking);
} else {
  // Chat mode: Visual feedback for speaking, no listening animation
  setAnimationState("isSpeaking", isAgentSpeaking);
  setAnimationState("IsListening", false);
}
```

**Key Features:**
- **Cross-Mode Support**: Animation works in both chat and voice modes
- **Debug Overlay**: Press `Ctrl+Shift+D` for real-time debug information
- **Health Indicators**: Visual warnings for animation health issues
- **Enhanced Error Handling**: Graceful fallbacks and error recovery

#### 3. **Enhanced RiveAvatarButton Component** (`src/components/RiveAvatarButton.jsx`)
```javascript
// Simple animation state management for button
useEffect(() => {
  if (isLoaded && isHealthy && !error) {
    setAnimationState("isSpeaking", isAgentSpeaking);
    // Handle listening state if available
    if (availableInputs.includes("IsListening")) {
      setAnimationState("IsListening", isUserSpeaking);
    }
  }
}, [isAgentSpeaking, isUserSpeaking, isLoaded, isHealthy, error]);
```

## 🎮 Usage Guide

### Basic Implementation

1. **Import the Enhanced Hook**:
```javascript
import { useRive } from '../hooks/useRive';

const {
  canvasRef,
  setAnimationState,
  isLoaded,
  isHealthy
} = useRive('/danak.riv', true); // Enable debug
```

2. **Control Speaking Animation** (Following Official Rive Patterns):
```javascript
useEffect(() => {
  if (isLoaded && isHealthy) {
    // Uses official Rive StateMachineInput objects under the hood
    setAnimationState("isSpeaking", isAgentSpeaking);
  }
}, [isAgentSpeaking, isLoaded, isHealthy]);
```

3. **Add Canvas to Component** (Official Rive Setup):
```javascript
<canvas ref={canvasRef} className="w-full h-full" />
```

**Note**: The enhanced hook automatically calls `resizeDrawingSurfaceToCanvas()` on load as recommended by Rive documentation for optimal display quality.

### Advanced Features

#### Debug Overlay
Press `Ctrl+Shift+D` in any component using the enhanced system to toggle debug overlay showing:
- Current animation mode (chat/voice)
- Animation load status and health
- Current speaking states
- Available animation inputs
- Real-time state values

#### Force State Setting (Recovery)
```javascript
// For debugging or recovery scenarios
forceAnimationState("isSpeaking", true);
```

#### Get Diagnostics
```javascript
const diagnostics = getAnimationDiagnostics();
console.log('Animation Status:', diagnostics);
```

#### Health Monitoring
```javascript
if (!isHealthy) {
  console.warn('Animation health issues detected');
  // Implement recovery logic if needed
}
```

## 🧪 Testing

### Comprehensive Test Suite
Use the provided test component (`src/test/animationStateTest.js`) to validate:

1. **Basic Loading & Health**: Animation loads correctly and maintains health
2. **State Management**: Setting and getting animation states works reliably
3. **Cross-Mode Support**: Animation works in both chat and voice modes
4. **Diagnostics**: All diagnostic functions return expected data
5. **Stress Testing**: Rapid state changes are handled correctly

### Running Tests
```javascript
import AnimationStateTest from '../test/animationStateTest';

// Use in development to validate animation system
<AnimationStateTest />
```

## 🔍 Debug Information

### Console Logging
When debug mode is enabled, you'll see detailed logs:
```
🎭 [useRive Debug] 🚀 Starting Rive animation load { src: '/danak.riv' }
🎭 [useRive Debug] ✅ Rive instance loaded, setting up controls
🎭 [useRive Debug] 🔍 Detecting state machine inputs { totalInputs: 2 }
🎭 [useRive Debug] 📋 Found input: "isSpeaking" { type: 'SMIBool', value: false }
🎭 [useRive Debug] 🎯 isSpeaking state detected and ready { currentValue: false }
🎭 [useRive Debug] 🎬 Setting animation state: isSpeaking = true
🎭 [useRive Debug] ✅ Animation state set successfully
```

### Visual Debug Overlay
The debug overlay shows:
- **Mode**: Current UI mode (chat/voice)
- **Loaded**: Animation load status
- **Healthy**: Animation health status
- **Error**: Any error messages
- **Speaking States**: Real-time speaking status
- **Available Inputs**: All detected animation states
- **Current Values**: Real-time state values

## 🚨 Troubleshooting

### Common Issues

#### 1. Animation Not Loading
**Symptoms**: Canvas shows loading spinner indefinitely
**Solutions**:
- Check Rive file path is correct
- Ensure file is accessible in public directory
- Verify Rive file has "StateMachine" state machine
- Check browser console for import errors

#### 2. isSpeaking State Not Found
**Symptoms**: Warning "Animation state 'isSpeaking' not found"
**Solutions**:
- Verify your Rive file has "isSpeaking" boolean input
- Check state machine name is "StateMachine"
- Use debug overlay to see available inputs
- Ensure animation fully loaded before setting states

#### 3. Animation Unhealthy
**Symptoms**: Health indicator shows warning
**Solutions**:
- Check console for detailed error messages
- Verify Rive file integrity
- Restart animation by refreshing page
- Use force state setting if needed

#### 4. States Not Updating
**Symptoms**: Animation doesn't respond to state changes
**Solutions**:
- Enable debug mode to see state change attempts
- Check if states are being set before animation loads
- Verify state names match exactly (case-sensitive)
- Try force state setting for immediate override

### Debug Commands

```javascript
// Check current state
console.log('Current isSpeaking:', getAnimationState('isSpeaking'));

// Force set state
forceAnimationState('isSpeaking', true);

// Get full diagnostics
console.log('Diagnostics:', getAnimationDiagnostics());

// Check available inputs
console.log('Available inputs:', availableInputs);
```

## 🔄 State Flow Diagram

```
ElevenLabs Agent Speaking Event
           ↓
    isAgentSpeaking = true
           ↓
      Mode Check
     ↙         ↘
Voice Mode    Chat Mode
     ↓             ↓
Full Control   Visual Only
     ↓             ↓
setAnimationState("isSpeaking", true)
     ↓
Rive Animation: Talking
     ↓
Agent Stops Speaking
     ↓
setAnimationState("isSpeaking", false)
     ↓
Rive Animation: Idle
```

## 📊 Performance Considerations

### Optimizations Implemented
- **Health Check Interval**: 2-second intervals to minimize performance impact
- **State History Limit**: Keep only last 10 state changes to prevent memory bloat
- **Retry Throttling**: Maximum 3 retries per state change to prevent infinite loops
- **Debug Mode Toggle**: Debug logging only when explicitly enabled

### Best Practices
- Enable debug mode only during development
- Monitor health status for production deployments
- Use state history for debugging animation issues
- Implement graceful fallbacks for animation failures

## 🎯 Integration with ElevenLabs

The animation system seamlessly integrates with your ElevenLabs conversation:

```javascript
// In useElevenLabsConversation.js
onModeChange: (modeData) => {
  if (mode === 'speaking') {
    setIsAgentSpeaking(true);  // Triggers animation
  } else if (mode === 'listening') {
    setIsUserSpeaking(true);   // Triggers listening animation
  } else {
    setIsAgentSpeaking(false); // Returns to idle
    setIsUserSpeaking(false);
  }
}
```

## 🔮 Future Enhancements

Potential improvements for the animation system:
- **Multiple Character Support**: Support for different Rive characters
- **Animation Presets**: Pre-defined animation sequences
- **Performance Metrics**: Detailed timing and performance analytics
- **Remote Health Monitoring**: Send health data to monitoring service
- **Advanced Recovery**: Automatic animation restart on critical failures

---

This enhanced animation system ensures your "isSpeaking" animation control is robust, debuggable, and works reliably across all modes of your application.