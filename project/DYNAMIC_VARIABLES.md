# 🚗 **Car Name Dynamic Variables - ElevenLabs Integration**

## 📖 **Overview**

This system allows you to pass a car name via URL parameters to personalize your ElevenLabs agent conversation. The agent will receive the car name as a dynamic variable and can focus the conversation on that specific vehicle.

## 🔧 **How It Works**

### **1. URL Parameter Format**
```
https://yoursite.com?car=BMW_X5
https://yoursite.com?carName=Audi_A4_Quattro  
https://yoursite.com?model=Tesla_Model_3
```

### **2. Supported Parameters**
- `car` - Primary parameter for car name
- `carName` - Alternative parameter name
- `model` - Alternative parameter name
- `customer` - Customer name (optional)
- `budget` - Budget amount (optional)  
- `language` - Language preference (optional)

### **3. ElevenLabs Integration**
The extracted car name is automatically passed to ElevenLabs as:
```javascript
dynamic_variables: {
  car_name: "BMW X5",        // Main car name variable
  target_car: "BMW X5",      // Alternative variable name
  customer_name: "Hans",     // Optional customer name
  budget: "50000",           // Optional budget
  language: "de"             // Optional language
}
```

## 🎯 **Usage Examples**

### **Basic Car Focus**
```
URL: yoursite.com?car=BMW_X5
Agent prompt: "Hello! I see you're interested in the {{car_name}}. Let me tell you about this amazing vehicle..."
Result: "Hello! I see you're interested in the BMW X5. Let me tell you about this amazing vehicle..."
```

### **Customer Personalization**
```
URL: yoursite.com?car=Audi_A4&customer=Hans_Mueller&budget=40000
Variables: { car_name: "Audi A4", customer_name: "Hans Mueller", budget: "40000" }
Agent: "Hi {{customer_name}}! With your {{budget}}€ budget, the {{car_name}} is perfect for you!"
Result: "Hi Hans Mueller! With your 40000€ budget, the Audi A4 is perfect for you!"
```

### **Language Setting**
```
URL: yoursite.com?car=Tesla_Model_3&language=de
Variables: { car_name: "Tesla Model 3", language: "de" }
Agent will switch to German language and focus on Tesla Model 3
```

## ⚙️ **Implementation Details**

### **Files Modified:**
1. **`/src/utils/urlParams.js`** - URL parameter extraction utilities
2. **`/src/hooks/useElevenLabsConversation.js`** - ElevenLabs integration
3. **`/src/test/dynamicVariablesTest.js`** - Testing utilities

### **Key Functions:**
- `getCarNameFromURL()` - Extract car name from URL
- `createDynamicVariables()` - Create ElevenLabs variables object
- `getAllURLParams()` - Get all URL parameters

## 🧪 **Testing**

### **Test URLs:**
```bash
# Basic car focus
http://localhost:5173?car=BMW_X5

# Multiple parameters
http://localhost:5173?car=Audi_A4&customer=Hans&budget=50000

# Alternative parameter names
http://localhost:5173?carName=Mercedes_C_Class&language=de

# Model parameter
http://localhost:5173?model=Tesla_Model_3&customer=Maria&budget=70000
```

### **Console Testing:**
The test utility automatically runs in development mode and logs:
- Current URL analysis
- Extracted parameters
- Dynamic variables created
- Example URLs for testing

## 🤖 **ElevenLabs Dashboard Setup**

### **1. Dynamic Variables Configuration**
In your ElevenLabs agent dashboard, add these dynamic variables using **conditional blocks**:

**System Prompt:**
```
You are a professional car sales assistant.
{{#car_name}}
The customer is interested in the {{car_name}}. Focus your conversation on this specific vehicle and its features.
{{/car_name}}
{{^car_name}}
Help the customer find their perfect car by understanding their needs and preferences.
{{/car_name}}
{{#customer_name}}The customer's name is {{customer_name}}.{{/customer_name}}
{{#budget}}Their budget is {{budget}}€.{{/budget}}
```

**First Message:**
```
{{#car_name}}
Hello! I see you're interested in the {{car_name}}. I'm here to help you learn everything about this amazing vehicle!
{{/car_name}}
{{^car_name}}
Hello! Welcome to our car showroom. How can I help you find your perfect car today?
{{/car_name}}
```

### **2. CRITICAL: Conditional Block Syntax**
- `{{#car_name}}...{{/car_name}}` - Show content ONLY if car_name has value
- `{{^car_name}}...{{/car_name}}` - Show content ONLY if car_name is empty
- This prevents errors when car_name is empty string but still required by ElevenLabs

### **3. Variable Names:**
- `car_name` - The main car name (e.g., "BMW X5") - **ALWAYS PROVIDED** (empty string if no URL param)
- `target_car` - Alternative variable (same value as car_name) - **ALWAYS PROVIDED**
- `customer_name` - Customer's name if provided
- `budget` - Budget amount if provided
- `language` - Language preference if provided

### **4. Important Notes:**
- **`car_name` is ALWAYS provided** to prevent ElevenLabs "Missing required dynamic variables" error
- When no URL parameter exists, `car_name = ""` (empty string)
- Use conditional blocks `{{#car_name}}` and `{{^car_name}}` to handle both cases
- Never use `{{car_name}}` directly without conditional blocks in dashboard

## 🔄 **How Variables Are Processed**

### **1. URL Processing:**
```javascript
// URL: ?car=BMW_X5_M_Sport
// Becomes: "BMW X5 M Sport" (underscores → spaces)
```

### **2. Parameter Priority:**
1. `car` parameter (highest priority)
2. `carName` parameter  
3. `model` parameter (lowest priority)

### **3. Variable Creation:**
```javascript
// Input: ?car=BMW_X5&customer=Hans&budget=50000
// Output:
{
  car_name: "BMW X5",
  target_car: "BMW X5",
  customer_name: "Hans",
  budget: "50000"
}

// Input: No URL parameters
// Output:
{
  car_name: "",        // Empty but present - prevents ElevenLabs error
  target_car: ""       // Empty but present
}
```

## 🎛️ **Integration Code**

### **ElevenLabs Session Config:**
```javascript
import { createDynamicVariables } from '../utils/urlParams';

const dynamicVariables = createDynamicVariables();

const sessionConfig = {
  agentId: AGENT_ID,
  clientTools,
  // CRITICAL: Always pass dynamic_variables (car_name always present)
  dynamic_variables: dynamicVariables,
  // ... other config
};
```

## 🚀 **Benefits**

### **1. Personalized Experience**
- Agent immediately knows which car the customer is interested in
- Conversation flows naturally around the target vehicle
- No need to ask "which car are you looking for?"

### **2. Marketing Integration**  
- Link directly to specific car discussions from ads
- Track which cars generate most interest
- Create targeted landing pages per vehicle

### **3. Sales Efficiency**
- Pre-qualified leads with known car interest
- Faster conversation flow
- Better conversion rates

## 🔧 **Troubleshooting**

### **Variables Not Working?**
1. Check browser console for extraction logs
2. Verify URL parameter format
3. Ensure ElevenLabs dashboard has matching variable names

### **Car Name Not Displaying?**
1. Check that URL contains supported parameters (`car`, `carName`, `model`)
2. Verify ElevenLabs prompt uses `{{car_name}}` syntax
3. Test with simple car names first (e.g., `?car=BMW`)

### **Debug Mode:**
Run the test utility in browser console:
```javascript
import { testDynamicVariables } from './src/test/dynamicVariablesTest.js';
testDynamicVariables();
```

---

**🎯 Result:** Your ElevenLabs agent now automatically focuses on the car specified in the URL, creating a personalized and targeted conversation experience!