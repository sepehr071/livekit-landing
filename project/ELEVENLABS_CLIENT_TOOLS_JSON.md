# 🔧 ElevenLabs Client Tools - JSON Configuration

## Corrections to Your Configuration

Your `displayProductImage` tool configuration has one issue:
- **`description` parameter should be optional** (not required), as cars might not always have descriptions

## Complete JSON Configuration for All 3 Tools

Copy these exact JSON configurations into your ElevenLabs dashboard:

### Tool 1: displayProductImage

```json
{
  "type": "client",
  "name": "displayProductImage",
  "description": "Display a car image with title and description to the customer",
  "disable_interruptions": true,
  "force_pre_tool_speech": "auto",
  "assignments": [],
  "expects_response": true,
  "response_timeout_secs": 1,
  "parameters": [
    {
      "id": "imageUrl",
      "type": "string",
      "value_type": "llm_prompt",
      "description": "URL path to the car image (e.g., '/images/cars/volvo-xc40-465570.jpg')",
      "dynamic_variable": "",
      "constant_value": "",
      "required": true
    },
    {
      "id": "title",
      "type": "string",
      "value_type": "llm_prompt",
      "description": "Car title (e.g., 'Volvo XC40 - Premium Compact SUV')",
      "dynamic_variable": "",
      "constant_value": "",
      "required": true
    },
    {
      "id": "description",
      "type": "string",
      "value_type": "llm_prompt",
      "description": "Brief car description or key features",
      "dynamic_variable": "",
      "constant_value": "",
      "required": false
    }
  ],
  "dynamic_variables": {
    "dynamic_variable_placeholders": {}
  }
}
```

### Tool 2: displayProductLink

```json
{
  "type": "client",
  "name": "displayProductLink",
  "description": "Display car details with link to Emil Frey website",
  "disable_interruptions": true,
  "force_pre_tool_speech": "auto",
  "assignments": [],
  "expects_response": true,
  "response_timeout_secs": 1,
  "parameters": [
    {
      "id": "linkUrl",
      "type": "string",
      "value_type": "llm_prompt",
      "description": "Emil Frey website URL for the specific car (e.g., 'https://www.emilfrey.de/auto-kaufen/volvo/xc_40/465570')",
      "dynamic_variable": "",
      "constant_value": "",
      "required": true
    },
    {
      "id": "title",
      "type": "string",
      "value_type": "llm_prompt",
      "description": "Car title (e.g., 'Volvo XC40 - Premium Compact SUV')",
      "dynamic_variable": "",
      "constant_value": "",
      "required": true
    },
    {
      "id": "description",
      "type": "string",
      "value_type": "llm_prompt",
      "description": "Detailed car description with features and benefits",
      "dynamic_variable": "",
      "constant_value": "",
      "required": false
    }
  ],
  "dynamic_variables": {
    "dynamic_variable_placeholders": {}
  }
}
```

### Tool 3: dismissOverlays

```json
{
  "type": "client",
  "name": "dismissOverlays",
  "description": "Clear all displayed car images and information overlays",
  "disable_interruptions": true,
  "force_pre_tool_speech": "auto",
  "assignments": [],
  "expects_response": true,
  "response_timeout_secs": 1,
  "parameters": [],
  "dynamic_variables": {
    "dynamic_variable_placeholders": {}
  }
}
```

## Key Configuration Notes

### Important Settings Explained:

1. **`"expects_response": true`** - The widget will send a response back to the agent
2. **`"response_timeout_secs": 1`** - Wait 1 second for the client response
3. **`"disable_interruptions": true`** - Prevent user interruption during tool execution
4. **`"force_pre_tool_speech": "auto"`** - Let ElevenLabs decide on pre-tool speech

### Parameter Details:

**For displayProductImage:**
- `imageUrl` (required): Path to car image file
- `title` (required): Car name and type
- `description` (optional): Brief car details

**For displayProductLink:**
- `linkUrl` (required): Emil Frey website URL
- `title` (required): Car name and type  
- `description` (optional): Detailed car information

**For dismissOverlays:**
- No parameters required

## 🔧 How to Apply These Configurations

### Method 1: Dashboard UI (Recommended)
1. Go to ElevenLabs Dashboard → Your Agent → Tools
2. Click "Add Tool" for each tool
3. Select "Client" as tool type
4. Copy the settings from the JSON above
5. Fill in each field manually

### Method 2: JSON Import (If Available)
1. Look for "Import JSON" or "Advanced" option in tools section
2. Paste the complete JSON configuration
3. Verify all settings are applied correctly

## ✅ Validation Checklist

After adding each tool, verify:

- [ ] **Tool Type**: Set to "Client" 
- [ ] **Tool Name**: Exactly matches (`displayProductImage`, `displayProductLink`, `dismissOverlays`)
- [ ] **Parameters**: All required parameters present with correct types
- [ ] **Description Parameter**: Set to optional (not required) for image and link tools
- [ ] **Response Settings**: `expects_response: true` and `response_timeout_secs: 1`

## 🧪 Testing Commands

Once tools are configured, test with:

**Test displayProductImage:**
- "Show me the Volvo XC40"
- "Display the Peugeot 5008 image"

**Test displayProductLink:**  
- "I want details about the Opel Astra"
- "Show me the website link for that car"

**Test dismissOverlays:**
- "Close the car display"
- "Clear the screen"
- "Dismiss"

## 🚨 Troubleshooting

**If tools don't trigger:**
- Verify tool names are exact (case-sensitive)
- Check that agent system prompt includes tool usage instructions
- Ensure knowledge base contains car data

**If tools fail:**
- Check parameter names match exactly
- Verify `expects_response` is set to `true`
- Confirm timeout settings are reasonable

**If images don't display:**
- Verify image files exist in `/project/public/images/cars/`
- Check image URLs are accessible
- Confirm file permissions allow web access

These JSON configurations will ensure your Emil Frey car display system works perfectly with ElevenLabs! 🚗✨