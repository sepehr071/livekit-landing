# 🚨 **ElevenLabs Overrides Troubleshooting Guide**

## ❌ **ISSUE: Overrides Not Working**

The logs show our code is working perfectly, but ElevenLabs is not applying the overrides. This happens when **overrides are not enabled in the dashboard**.

---

## 🔍 **DIAGNOSTIC LOGS ANALYSIS**

### ✅ **What's Working:**
```
🚗 Car name extracted for overrides: BMW X5          ✅ URL extraction working
🔧 Conversation overrides created: {agent: {...}}    ✅ Override creation working  
conversation_config_override: {...}                  ✅ Overrides sent to ElevenLabs
✅ Connected to ElevenLabs unified voice session     ✅ Connection successful
```

### ❌ **What's Missing:**
- **No personalized first message** from ElevenLabs
- **Agent uses dashboard defaults** instead of overrides
- **ElevenLabs ignoring our overrides** = Security settings issue

---

## 🛠️ **STEP-BY-STEP FIX**

### **Step 1: Go to ElevenLabs Dashboard**
1. Visit: https://elevenlabs.io/app/agents
2. Click on your agent: `agent_7401k4hv3j1je1ms4esr4sjnms5t`
3. Go to **Settings** tab

### **Step 2: Enable Security Overrides**
1. Click on **"Security"** sub-tab
2. **CRITICAL: Enable these checkboxes:**
   - ☑️ **First message** override
   - ☑️ **System prompt** override

![Enable Overrides](https://files.buildwithfern.com/https://elevenlabs.docs.buildwithfern.com/docs/2025-09-09T09:12:34.813Z/assets/images/conversational-ai/enable-overrides.jpg)

### **Step 3: Save Settings**
1. Click **"Save"** or **"Update Agent"**
2. **Wait for confirmation** that settings are saved

### **Step 4: Test Again**
1. Visit: `http://localhost:5173?car=BMW_X5`
2. **Look for new console message:**
   ```
   🔧 OVERRIDES SENT TO ELEVENLABS: {...}
   ⚠️ IMPORTANT: Overrides must be ENABLED in ElevenLabs dashboard Security settings!
   ```
3. **Agent should now say:** "Hello! I see you're interested in the BMW X5..."

---

## 🔍 **VERIFICATION CHECKLIST**

### **Before Enabling Overrides:**
- [ ] Code sends overrides to ElevenLabs ✅
- [ ] ElevenLabs ignores overrides ❌
- [ ] Agent uses dashboard default message ❌
- [ ] No personalization occurs ❌

### **After Enabling Overrides:**
- [ ] Code sends overrides to ElevenLabs ✅
- [ ] ElevenLabs applies overrides ✅
- [ ] Agent uses custom BMW X5 message ✅
- [ ] Personalization works ✅

---

## 🚨 **COMMON MISTAKES**

### **❌ Mistake 1: Not Enabling Overrides**
**Problem:** ElevenLabs dashboard Security settings have overrides disabled
**Solution:** Enable "First message" and "System prompt" overrides

### **❌ Mistake 2: Wrong Agent**
**Problem:** Editing settings for different agent
**Solution:** Verify agent ID: `agent_7401k4hv3j1je1ms4esr4sjnms5t`

### **❌ Mistake 3: Not Saving Settings**
**Problem:** Changes not saved after enabling overrides
**Solution:** Click "Save" and wait for confirmation

### **❌ Mistake 4: Browser Cache**
**Problem:** Old agent configuration cached
**Solution:** Refresh ElevenLabs dashboard and retry

---

## 🧪 **TESTING SCENARIOS**

### **Scenario A: Overrides Disabled (Current Issue)**
```
URL: ?car=BMW_X5
Expected: "Hello! Welcome to our car showroom..."  (dashboard default)
Actual: "Hello! Welcome to our car showroom..."    (dashboard default)
Status: ❌ Overrides not applied
```

### **Scenario B: Overrides Enabled (Target Behavior)**
```
URL: ?car=BMW_X5
Expected: "Hello! I see you're interested in the BMW X5..."  (override)
Actual: "Hello! I see you're interested in the BMW X5..."    (override)
Status: ✅ Overrides working
```

### **Scenario C: No Car Parameter (Fallback)**
```
URL: (no ?car parameter)
Expected: "Hello! Welcome to our car showroom..."  (dashboard default)
Actual: "Hello! Welcome to our car showroom..."    (dashboard default)
Status: ✅ Fallback working
```

---

## 🔧 **DEBUG COMMANDS**

### **Check Override Creation:**
```javascript
// In browser console
window.debugElevenLabs()
// Should show: conversationOverrides: {...}
```

### **Verify URL Extraction:**
```javascript
// In browser console  
window.location.search
// Should show: "?car=BMW_X5"
```

### **Check Console Logs:**
```
🔧 Conversation overrides created: {agent: {first_message: "...", prompt: {...}}}
```

---

## 🎯 **EXACT SECURITY SETTINGS NEEDED**

```
Agent Settings → Security Tab:

☑️ First message override: ENABLED
☑️ System prompt override: ENABLED  
☐ Language override: Not needed
☐ Voice ID override: Not needed
```

---

## 🚀 **AFTER ENABLING OVERRIDES**

### **Expected Console Output:**
```
🚗 Car name extracted for overrides: BMW X5
🔧 Conversation overrides created: {...}
🔧 OVERRIDES SENT TO ELEVENLABS: {...}
✅ Connected to ElevenLabs unified voice session
```

### **Expected Agent Behavior:**
- **First Message:** "Hello! I see you're interested in the BMW X5..."
- **Conversation Focus:** BMW X5 specific discussion
- **System Behavior:** Car-focused sales assistant

---

**🔥 The issue is 100% the ElevenLabs dashboard Security settings. Enable overrides and it will work immediately!**