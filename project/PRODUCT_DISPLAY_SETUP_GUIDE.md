# 🚗 Product Display Setup Guide - Emil Frey Cars

## Overview

This guide explains how to configure your ElevenLabs agent to display car product images and links when users ask about vehicles. The system uses **ElevenLabs Knowledge Base** + **Client Tools** to show interactive product displays.

## 🏗️ How the Product Display System Works

### Architecture Flow:
1. **User Query**: "Show me cars" or "I'm looking for a vehicle"
2. **Agent Processing**: ElevenLabs agent processes query using knowledge base
3. **Tool Execution**: Agent calls `displayProductImage` or `displayProductLink` client tools
4. **Widget Display**: React widget receives tool call and displays product overlay

### Client Tools Integration:
- **`displayProductImage`**: Shows car image with zoom functionality
- **`displayProductLink`**: Shows car details with link to Emil Frey website  
- **`dismissOverlays`**: Clears displayed products

## 📋 Step-by-Step Implementation

### Step 1: Prepare Car Images

**Image Storage Location**: `/project/public/images/cars/`

Create the cars directory and place your images:
```
project/public/images/cars/
├── volvo-xc40-465570.jpg
├── peugeot-5008-479956.jpg
└── opel-astra-481456.jpg
```

**Image Requirements**:
- Format: JPG, PNG, or WebP
- Recommended size: 800x600px to 1200x900px
- Max file size: 2MB each
- Descriptive filenames for easy reference

### Step 2: Configure ElevenLabs Knowledge Base

**Location**: ElevenLabs Dashboard → Your Agent → Knowledge Base

**Add this car inventory data**:

```json
{
  "car_inventory": {
    "dealer": "Emil Frey",
    "cars": [
      {
        "id": "465570",
        "brand": "Volvo",
        "model": "XC40",
        "title": "Volvo XC40 - Premium Compact SUV",
        "description": "Modern compact SUV with Scandinavian design, advanced safety features, and efficient performance.",
        "category": "Compact SUV",
        "price": "Contact for pricing",
        "image_url": "/images/cars/volvo-xc40-465570.jpg",
        "link_url": "https://www.emilfrey.de/auto-kaufen/volvo/xc_40/465570",
        "features": ["All-wheel drive", "Premium interior", "Advanced safety systems"],
        "fuel_type": "Petrol/Hybrid options",
        "year": "2024",
        "availability": "Available now"
      },
      {
        "id": "479956", 
        "brand": "Peugeot",
        "model": "5008",
        "title": "Peugeot 5008 - 7-Seater Family SUV",
        "description": "Spacious 7-seater SUV with French elegance, advanced technology, and family-focused design.",
        "category": "Family SUV",
        "price": "Contact for pricing",
        "image_url": "/images/cars/peugeot-5008-479956.jpg",
        "link_url": "https://www.emilfrey.de/auto-kaufen/peugeot/5008/479956",
        "features": ["7 seats", "Large boot space", "Advanced infotainment"],
        "fuel_type": "Petrol/Diesel options",
        "year": "2024",
        "availability": "Available now"
      },
      {
        "id": "481456",
        "brand": "Opel", 
        "model": "Astra",
        "title": "Opel Astra - Efficient Compact Car",
        "description": "Modern compact car with excellent fuel efficiency, German engineering, and smart technology features.",
        "category": "Compact Car",
        "price": "Contact for pricing", 
        "image_url": "/images/cars/opel-astra-481456.jpg",
        "link_url": "https://www.emilfrey.de/auto-kaufen/opel/astra/481456",
        "features": ["Fuel efficient", "Smart technology", "Comfortable interior"],
        "fuel_type": "Petrol/Electric options",
        "year": "2024",
        "availability": "Available now"
      }
    ]
  }
}
```

### Step 3: Update Agent System Prompt

**Location**: ElevenLabs Dashboard → Your Agent → Settings → System Prompt

**Add this section to your existing system prompt**:

```
You are a helpful car dealership assistant for Emil Frey. When customers ask about cars, vehicles, automobiles, or specific car models, you should help them by showing relevant vehicles from our inventory.

AVAILABLE CLIENT TOOLS:
- displayProductImage: Use this to show car images with details
- displayProductLink: Use this to show car information with website links  
- dismissOverlays: Use this to clear displayed cars

CAR INVENTORY GUIDELINES:
- We have 3 featured vehicles: Volvo XC40, Peugeot 5008, and Opel Astra
- When customers ask about cars, show relevant vehicles using the client tools
- Always use the exact image URLs and link URLs from the knowledge base
- Provide helpful information about features, availability, and next steps

EXAMPLE USAGE:
Customer: "What cars do you have?"
→ Show all 3 cars using displayProductImage for each

Customer: "I need a family car"  
→ Show Peugeot 5008 (7-seater family SUV)

Customer: "Show me compact cars"
→ Show Volvo XC40 and Opel Astra

Customer: "I want to see details about that car"
→ Use displayProductLink to show detailed information

Always be helpful and encourage customers to visit our website or contact us for pricing and test drives.
```

### Step 4: Test the Implementation

**Testing Commands**:

1. **Test Image Display**: 
   - "Show me cars"
   - "What vehicles do you have?"
   - "I'm looking for a car"

2. **Test Specific Categories**:
   - "Show me family cars" (should show Peugeot 5008)
   - "I need a compact car" (should show Volvo XC40 or Opel Astra)
   - "Show me SUVs" (should show Volvo XC40 and Peugeot 5008)

3. **Test Link Display**:
   - "Can I get more details about the Volvo?"
   - "Show me the website link for that car"

4. **Test Dismissal**:
   - "Close the car display"
   - "Clear the screen"
   - "Dismiss"

## 🎯 Expected User Experience

### Image Display:
- User asks about cars
- Agent shows car images in overlay with:
  - Car title (e.g., "Volvo XC40 - Premium Compact SUV")
  - Zoomable high-quality image
  - "Say 'close' to dismiss" instruction

### Link Display:
- User asks for details/links
- Agent shows link box with:
  - Car title and description
  - Emil Frey website link
  - Copy link functionality
  - Direct link opening

### Avatar Animation:
- When products are displayed, avatar smoothly transitions to corner
- When dismissed, avatar returns to center with speech bubble

## 🔧 Configuration Verification

**Ensure these are set up in ElevenLabs Dashboard**:

✅ **Client Tools** (3 tools configured):
- `displayProductImage` (imageUrl, title, description parameters)
- `displayProductLink` (linkUrl, title, description parameters)  
- `dismissOverlays` (no parameters)

✅ **Knowledge Base**: Car inventory data uploaded

✅ **System Prompt**: Updated with car dealership context and tool usage

✅ **Agent Settings**: Tools enabled and properly configured

## 📸 Image Management

**Your Images** (you mentioned you'll insert them):
1. **Volvo XC40**: Save as `/project/public/images/cars/volvo-xc40-465570.jpg`
2. **Peugeot 5008**: Save as `/project/public/images/cars/peugeot-5008-479956.jpg`  
3. **Opel Astra**: Save as `/project/public/images/cars/opel-astra-481456.jpg`

**Image Guidelines**:
- High resolution for zoom functionality
- Show the car from an appealing angle
- Good lighting and clear visibility
- Professional dealership quality

## 🚀 Deployment Checklist

- [ ] Create `/project/public/images/cars/` directory
- [ ] Add your 3 car images with correct filenames
- [ ] Upload knowledge base data to ElevenLabs dashboard
- [ ] Update agent system prompt with car dealership context
- [ ] Test all 3 client tools are working
- [ ] Verify image URLs resolve correctly
- [ ] Test user scenarios with different car queries
- [ ] Confirm Emil Frey website links work properly

## 🎉 Ready for Use!

Once configured, your agent will automatically:
- Recognize car-related queries
- Show relevant vehicle images and information
- Provide links to Emil Frey website
- Handle product dismissal naturally

Users can simply ask "What cars do you have?" and see beautiful, interactive product displays right in the widget!