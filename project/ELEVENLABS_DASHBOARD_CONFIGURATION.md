# 🤖 **ElevenLabs Dashboard Configuration Guide**

## ❌ **THE PROBLEM**
You're getting: `"Missing required dynamic variables in first message: {'car_name'}"`

## ✅ **THE SOLUTION**
Use **conditional blocks** in your ElevenLabs dashboard to handle both cases:
- When `car_name` has a value (e.g., "BMW X5")
- When `car_name` is empty string `""`

---

## 🎯 **EXACT DASHBOARD CONFIGURATION**

### **1. System Prompt**
Copy this EXACT text into your ElevenLabs agent's system prompt:

```
You are a professional car sales assistant. 
{{#car_name}}
The customer is interested in the {{car_name}}. Focus your conversation on this specific vehicle, its features, specifications, and benefits. Provide detailed information about the {{car_name}} and help them understand why it's the perfect choice.
{{/car_name}}
{{^car_name}}
Help the customer find their perfect car by understanding their needs, preferences, and budget. Ask about their requirements and recommend suitable vehicles.
{{/car_name}}
{{#customer_name}}The customer's name is {{customer_name}}. Address them personally.{{/customer_name}}
{{#budget}}Their budget is {{budget}}€. Keep recommendations within this range.{{/budget}}
Be helpful, knowledgeable, and enthusiastic about cars.
```

### **2. First Message**
Copy this EXACT text into your ElevenLabs agent's first message:

```
{{#car_name}}
Hello! I see you're interested in the {{car_name}}. I'm here to help you learn everything about this amazing vehicle! What specific aspects of the {{car_name}} would you like to know more about?
{{/car_name}}
{{^car_name}}
Hello! Welcome to our car showroom. I'm here to help you find your perfect car. What type of vehicle are you looking for today?
{{/car_name}}
```

---

## 🔑 **CRITICAL SYNTAX RULES**

### **Conditional Block Syntax:**
- `{{#car_name}}...{{/car_name}}` = Show content ONLY if car_name has a value
- `{{^car_name}}...{{/car_name}}` = Show content ONLY if car_name is empty
- `{{car_name}}` = Shows the actual value (only use inside conditional blocks)

### **❌ NEVER DO THIS:**
```
Hello! I see you're interested in the {{car_name}}.
```
☝️ This will fail when car_name is empty!

### **✅ ALWAYS DO THIS:**
```
{{#car_name}}
Hello! I see you're interested in the {{car_name}}.
{{/car_name}}
{{^car_name}}
Hello! Welcome to our car showroom.
{{/car_name}}
```

---

## 🧪 **HOW TO TEST**

### **Test 1: With Car Parameter**
URL: `http://localhost:5173?car=BMW_X5`
Expected:
- Variables: `{ car_name: "BMW X5", target_car: "BMW X5" }`
- Agent says: "Hello! I see you're interested in the BMW X5..."

### **Test 2: Without Car Parameter**
URL: `http://localhost:5173`
Expected:
- Variables: `{ car_name: "", target_car: "" }`
- Agent says: "Hello! Welcome to our car showroom..."

---

## 🔧 **VARIABLE NAMES TO USE**

Your dynamic variables object will always contain:
```javascript
{
  car_name: "BMW X5",        // OR "" if no URL param
  target_car: "BMW X5",      // OR "" if no URL param
  customer_name: "John",     // Only if ?customer=John
  budget: "50000",           // Only if ?budget=50000
  language: "de"             // Only if ?language=de
}
```

---

## 🚨 **COMMON MISTAKES TO AVOID**

### **Mistake 1: Using {{car_name}} directly**
```
❌ Hello! I see you're interested in the {{car_name}}.
```
**Why it fails:** When car_name is empty, this shows "interested in the ."

### **Mistake 2: Missing conditional blocks**
```
❌ System Prompt: "Focus on the {{car_name}} vehicle."
```
**Why it fails:** ElevenLabs requires car_name but shows nothing when empty.

### **Mistake 3: Wrong conditional syntax**
```
❌ {{#car_name}}{{car_name}}{{#car_name}}  (wrong closing tag)
❌ {{car_name?}}...{{/car_name?}}         (wrong syntax)
```

---

## 🎯 **ADVANCED EXAMPLES**

### **Multiple Conditions:**
```
{{#car_name}}
{{#customer_name}}
Hi {{customer_name}}! I see you're interested in the {{car_name}}.
{{/customer_name}}
{{^customer_name}}
Hello! I see you're interested in the {{car_name}}.
{{/customer_name}}
{{/car_name}}
{{^car_name}}
{{#customer_name}}
Hi {{customer_name}}! Welcome to our showroom.
{{/customer_name}}
{{^customer_name}}
Hello! Welcome to our car showroom.
{{/customer_name}}
{{/car_name}}
```

### **Budget Integration:**
```
{{#car_name}}
The {{car_name}} is an excellent choice! 
{{#budget}}With your {{budget}}€ budget, this vehicle fits perfectly.{{/budget}}
{{/car_name}}
```

---

## 📝 **STEP-BY-STEP SETUP**

1. **Go to your ElevenLabs agent dashboard**
2. **Navigate to the agent configuration**
3. **Replace the System Prompt** with the text from section 1 above
4. **Replace the First Message** with the text from section 2 above
5. **Save the configuration**
6. **Test with:** `http://localhost:5173?car=BMW_X5`
7. **Test without:** `http://localhost:5173`

---

## 🔍 **DEBUGGING CHECKLIST**

If still getting errors:

- [ ] Check browser console for `🚗 Dynamic variables extracted`
- [ ] Verify car_name is always present (even if empty string)
- [ ] Ensure conditional blocks use correct syntax `{{#car_name}}` and `{{^car_name}}`
- [ ] Check network tab for the actual request to ElevenLabs
- [ ] Test with the debug tool: `window.debugElevenLabs()`

---

## ✅ **SUCCESS CRITERIA**

You'll know it's working when:
1. **With URL param:** Agent mentions the specific car name
2. **Without URL param:** Agent gives general welcome message
3. **No more "Missing required dynamic variables" errors**
4. **Console shows successful variable extraction**

---

**🎉 This configuration will handle ALL scenarios and eliminate the dynamic variables error!**