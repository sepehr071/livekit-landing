# 🚗 Emil Frey Cars - Data Structure & Configuration

## Car Data Structure for Knowledge Base

Copy this JSON structure into your ElevenLabs Agent Knowledge Base:

```json
{
  "dealership": {
    "name": "Emil Frey",
    "website": "https://www.emilfrey.de",
    "description": "Premium automotive dealership with multiple brands",
    "location": "Germany",
    "specialties": ["New cars", "Used cars", "Service", "Parts"]
  },
  "car_inventory": [
    {
      "id": "465570",
      "brand": "Volvo",
      "model": "XC40",
      "full_name": "Volvo XC40",
      "title": "Volvo XC40 - Premium Compact SUV",
      "description": "Modern compact SUV with Scandinavian design, advanced safety features, and efficient performance. Perfect for urban driving with premium comfort.",
      "category": "Compact SUV",
      "body_type": "SUV",
      "size_class": "Compact",
      "price_info": "Contact Emil Frey for current pricing and financing options",
      "image_url": "/images/cars/volvo-xc40-465570.jpg",
      "link_url": "https://www.emilfrey.de/auto-kaufen/volvo/xc_40/465570",
      "features": [
        "All-wheel drive capability",
        "Premium Scandinavian interior design",
        "Advanced safety systems (City Safety, Pilot Assist)",
        "Efficient engine options",
        "Modern infotainment system",
        "Excellent build quality"
      ],
      "fuel_options": ["Petrol", "Hybrid", "Electric (Recharge)"],
      "transmission": "Automatic",
      "year": "2024",
      "availability": "Available now - Contact for test drive",
      "target_customer": "Urban professionals, small families, safety-conscious drivers",
      "selling_points": ["Scandinavian luxury", "City-friendly size", "Advanced safety", "Premium brand"]
    },
    {
      "id": "479956",
      "brand": "Peugeot", 
      "model": "5008",
      "full_name": "Peugeot 5008",
      "title": "Peugeot 5008 - 7-Seater Family SUV",
      "description": "Spacious 7-seater SUV with French elegance, advanced technology, and family-focused design. Ideal for large families and long journeys.",
      "category": "Family SUV",
      "body_type": "SUV",
      "size_class": "Large",
      "price_info": "Contact Emil Frey for current pricing and family financing packages",
      "image_url": "/images/cars/peugeot-5008-479956.jpg",
      "link_url": "https://www.emilfrey.de/auto-kaufen/peugeot/5008/479956",
      "features": [
        "7 individual seats with flexible configuration",
        "Large 952L boot space (with rear seats down)",
        "Peugeot i-Cockpit with 12.3\" digital display",
        "Advanced driver assistance systems",
        "Panoramic sunroof",
        "Premium French interior design"
      ],
      "fuel_options": ["Petrol", "Diesel", "Hybrid"],
      "transmission": "Automatic",
      "year": "2024", 
      "availability": "Available now - Perfect for families",
      "target_customer": "Large families, frequent travelers, those needing maximum space",
      "selling_points": ["7 seats", "Huge space", "French elegance", "Family-friendly"]
    },
    {
      "id": "481456",
      "brand": "Opel",
      "model": "Astra", 
      "full_name": "Opel Astra",
      "title": "Opel Astra - Efficient Compact Car",
      "description": "Modern compact car with excellent fuel efficiency, German engineering, and smart technology features. Perfect for daily commuting and city driving.",
      "category": "Compact Car",
      "body_type": "Hatchback", 
      "size_class": "Compact",
      "price_info": "Contact Emil Frey for competitive pricing and special offers",
      "image_url": "/images/cars/opel-astra-481456.jpg",
      "link_url": "https://www.emilfrey.de/auto-kaufen/opel/astra/481456",
      "features": [
        "Excellent fuel efficiency",
        "Pure Panel digital cockpit",
        "IntelliLux LED matrix headlights",
        "Comfortable ergonomic interior",
        "Advanced connectivity features", 
        "German engineering reliability"
      ],
      "fuel_options": ["Petrol", "Diesel", "Electric (available)"],
      "transmission": "Manual/Automatic",
      "year": "2024",
      "availability": "Available now - Great value proposition", 
      "target_customer": "First-time buyers, commuters, budget-conscious customers",
      "selling_points": ["Fuel efficient", "Affordable", "Reliable", "Smart technology"]
    }
  ],
  "sales_guidance": {
    "when_to_show_cars": [
      "Customer asks about cars, vehicles, automobiles",
      "Customer mentions needing transportation",
      "Customer asks about specific brands (Volvo, Peugeot, Opel)",
      "Customer asks about car types (SUV, compact car, family car)",
      "Customer says 'show me cars' or similar"
    ],
    "how_to_present": {
      "for_families": "Emphasize Peugeot 5008 - 7 seats, space, safety",
      "for_urban_drivers": "Highlight Volvo XC40 - compact, premium, efficient",
      "for_budget_conscious": "Focus on Opel Astra - efficient, reliable, good value",
      "for_safety_focused": "Lead with Volvo XC40 - advanced safety systems",
      "general_inquiry": "Show all three with brief highlights of each"
    }
  }
}
```

## ElevenLabs Agent System Prompt Update

Add this section to your agent's system prompt:

```
ROLE: You are a helpful automotive sales assistant for Emil Frey dealership in Germany.

INVENTORY: You have 3 featured vehicles available:
1. Volvo XC40 - Premium compact SUV (ID: 465570)
2. Peugeot 5008 - 7-seater family SUV (ID: 479956)  
3. Opel Astra - Efficient compact car (ID: 481456)

WHEN CUSTOMERS ASK ABOUT CARS/VEHICLES:
- Use displayProductImage to show relevant car images
- Use displayProductLink to provide detailed information and website links
- Match recommendations to customer needs:
  * Families → Peugeot 5008 (7 seats, space)
  * Urban/Premium → Volvo XC40 (compact luxury)
  * Efficient/Budget → Opel Astra (fuel efficient, reliable)

CLIENT TOOLS USAGE:
- displayProductImage(imageUrl, title, description) - Show car images
- displayProductLink(linkUrl, title, description) - Show car details with website links
- dismissOverlays() - Clear displayed cars when requested

EXAMPLE INTERACTIONS:
Customer: "What cars do you have?"
→ Show all 3 cars using displayProductImage for each

Customer: "I need a family car"
→ displayProductImage("/images/cars/peugeot-5008-479956.jpg", "Peugeot 5008 - 7-Seater Family SUV", "Spacious 7-seater SUV perfect for families...")

Customer: "Show me details about the Volvo"
→ displayProductLink("https://www.emilfrey.de/auto-kaufen/volvo/xc_40/465570", "Volvo XC40 - Premium Compact SUV", "Modern compact SUV with Scandinavian design...")

Always be helpful, provide accurate information from the knowledge base, and encourage customers to visit Emil Frey for test drives and detailed consultations.
```

## Image Setup Instructions

1. **Create directory**: `/project/public/images/cars/`

2. **Add your car images with these exact filenames**:
   - `volvo-xc40-465570.jpg` (Volvo XC40)
   - `peugeot-5008-479956.jpg` (Peugeot 5008)
   - `opel-astra-481456.jpg` (Opel Astra)

3. **Image specifications**:
   - Format: JPG, PNG, or WebP
   - Recommended size: 1200x800px
   - Max file size: 2MB per image
   - Professional quality dealership photos

## Client Tools Configuration (ElevenLabs Dashboard)

### Tool 1: displayProductImage
- **Type**: Client
- **Name**: `displayProductImage`
- **Description**: `Display a car image to the customer with title and description`
- **Parameters**:
  - `imageUrl` (String, Required): "URL path to the car image"
  - `title` (String, Required): "Car title (e.g., 'Volvo XC40 - Premium Compact SUV')"
  - `description` (String, Optional): "Brief car description"

### Tool 2: displayProductLink  
- **Type**: Client
- **Name**: `displayProductLink`
- **Description**: `Display car details with link to Emil Frey website`
- **Parameters**:
  - `linkUrl` (String, Required): "Emil Frey website URL for the specific car"
  - `title` (String, Required): "Car title"
  - `description` (String, Optional): "Detailed car description"

### Tool 3: dismissOverlays
- **Type**: Client  
- **Name**: `dismissOverlays`
- **Description**: `Clear all displayed car images and information`
- **Parameters**: None

## Testing Scenarios

### Test Image Display:
- "What cars do you have available?"
- "Show me your vehicle inventory"
- "I'm looking for a car"

### Test Specific Requests:
- "I need a family car" → Should show Peugeot 5008
- "Show me compact cars" → Should show Volvo XC40 and/or Opel Astra
- "What SUVs do you have?" → Should show Volvo XC40 and Peugeot 5008

### Test Link Display:
- "Can I get more details about the Volvo?"
- "Show me the website for that Peugeot"
- "I want to see the full information"

### Test Dismissal:
- "Close the car display"
- "Clear the screen"
- "Dismiss" or "Remove"

## Ready for Implementation! 🚀

Once you've:
1. ✅ Added the JSON data to ElevenLabs Knowledge Base
2. ✅ Updated the agent system prompt
3. ✅ Configured the 3 client tools
4. ✅ Added your car images to `/project/public/images/cars/`

Your users will be able to ask about cars and see beautiful, interactive displays with your Emil Frey vehicle inventory!