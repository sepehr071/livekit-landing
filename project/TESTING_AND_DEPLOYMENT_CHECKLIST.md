# ✅ Testing & Deployment Checklist - Emil Frey Cars

## 🎯 Quick Summary

To show image boxes and link boxes for your Emil Frey cars, you need to:

1. **Configure ElevenLabs Agent** (3 client tools + knowledge base + system prompt)
2. **Add Car Images** (3 images in `/project/public/images/cars/`)
3. **Test the Integration** (verify all functionality works)

## 📋 Pre-Deployment Checklist

### ✅ ElevenLabs Dashboard Configuration

**Knowledge Base Setup:**
- [ ] Log into ElevenLabs Dashboard → Your Agent → Knowledge Base
- [ ] Copy the JSON data from `EMIL_FREY_CARS_CONFIGURATION.md`
- [ ] Paste into Knowledge Base and save
- [ ] Verify data appears correctly

**Client Tools Setup:**
- [ ] Go to Agent Settings → Tools
- [ ] Add Tool 1: `displayProductImage`
  - [ ] Type: Client
  - [ ] Parameters: `imageUrl` (String), `title` (String), `description` (String, optional)
- [ ] Add Tool 2: `displayProductLink`
  - [ ] Type: Client  
  - [ ] Parameters: `linkUrl` (String), `title` (String), `description` (String, optional)
- [ ] Add Tool 3: `dismissOverlays`
  - [ ] Type: Client
  - [ ] No parameters

**System Prompt Update:**
- [ ] Go to Agent Settings → System Prompt
- [ ] Add the automotive sales assistant context from `EMIL_FREY_CARS_CONFIGURATION.md`
- [ ] Include tool usage instructions
- [ ] Save changes

### ✅ Image Assets Setup

**Directory Creation:**
- [ ] Create folder: `/project/public/images/cars/`
- [ ] Ensure folder is accessible via web server

**Image Upload:**
- [ ] Add your Volvo XC40 image as: `volvo-xc40-465570.jpg`
- [ ] Add your Peugeot 5008 image as: `peugeot-5008-479956.jpg`
- [ ] Add your Opel Astra image as: `opel-astra-481456.jpg`
- [ ] Verify image sizes are reasonable (< 2MB each)
- [ ] Test image URLs are accessible: `http://localhost:5173/images/cars/volvo-xc40-465570.jpg`

### ✅ Widget Application Setup

**Dependencies Verification:**
- [ ] Confirm `@elevenlabs/client` v0.6.0 is installed
- [ ] Confirm `@rive-app/canvas` v2.7.3 is installed
- [ ] Check that all imports are working

**Component Verification:**
- [ ] `useElevenLabsConversation` hook is functioning
- [ ] `ProductImageOverlay` component exists and works
- [ ] `ProductLinkBox` component exists and works
- [ ] Client tools are properly registered in the hook

## 🧪 Testing Protocol

### Phase 1: Basic Connection Test
1. **Start the application:**
   ```bash
   cd project
   npm run dev
   ```

2. **Open browser:** `http://localhost:5173`

3. **Test agent connection:**
   - [ ] Click support button
   - [ ] Verify connection to ElevenLabs agent
   - [ ] Send test message: "Hello"
   - [ ] Confirm agent responds

### Phase 2: Car Display Testing

**Test 1: General Car Inquiry**
- [ ] User says: "What cars do you have?"
- [ ] Expected: Agent shows all 3 cars using `displayProductImage`
- [ ] Verify: 3 car images appear with titles and descriptions
- [ ] Verify: Images are clickable and zoomable

**Test 2: Specific Car Categories**
- [ ] User says: "I need a family car"
- [ ] Expected: Agent shows Peugeot 5008
- [ ] Verify: Correct car image appears
- [ ] Verify: Title shows "Peugeot 5008 - 7-Seater Family SUV"

**Test 3: Compact Car Request**
- [ ] User says: "Show me compact cars"
- [ ] Expected: Agent shows Volvo XC40 or Opel Astra (or both)
- [ ] Verify: Appropriate compact cars are displayed

**Test 4: SUV Request**
- [ ] User says: "What SUVs do you have?"
- [ ] Expected: Agent shows Volvo XC40 and Peugeot 5008
- [ ] Verify: Both SUVs are displayed

### Phase 3: Link Display Testing

**Test 5: Link Request**
- [ ] User says: "Can I get more details about the Volvo?"
- [ ] Expected: Agent calls `displayProductLink`
- [ ] Verify: Link box appears with Emil Frey URL
- [ ] Verify: "Open Link" button works correctly
- [ ] Verify: Link opens `https://www.emilfrey.de/auto-kaufen/volvo/xc_40/465570`

**Test 6: Copy Link Functionality**
- [ ] In link box, click "Copy" button
- [ ] Verify: "✓ Link copied to clipboard!" message appears
- [ ] Verify: Link is actually copied to clipboard

### Phase 4: Dismissal Testing

**Test 7: Product Dismissal**
- [ ] User says: "Close the car display"
- [ ] Expected: Agent calls `dismissOverlays`
- [ ] Verify: All product displays disappear
- [ ] Verify: Avatar returns to center position

**Test 8: Manual Dismissal**
- [ ] Display a car image
- [ ] Click outside the overlay
- [ ] Verify: Image overlay closes
- [ ] Press ESC key while overlay is open
- [ ] Verify: Overlay closes

### Phase 5: Avatar Animation Testing

**Test 9: Avatar Transitions**
- [ ] Start with no products displayed
- [ ] Verify: Avatar is centered with speech bubble
- [ ] Display a car image
- [ ] Verify: Avatar smoothly transitions to corner
- [ ] Dismiss the car
- [ ] Verify: Avatar returns to center

**Test 10: Responsive Behavior**
- [ ] Test on desktop (> 768px width)
- [ ] Verify: Avatar positioning works correctly
- [ ] Test on mobile (< 768px width)
- [ ] Verify: Avatar positioning adapts for mobile

## 🐛 Troubleshooting Guide

### Common Issues & Solutions

**Issue: Cars not displaying when requested**
- ✅ Check: Client tools are configured correctly in ElevenLabs dashboard
- ✅ Check: Tool names match exactly: `displayProductImage`, `displayProductLink`, `dismissOverlays`
- ✅ Check: Agent system prompt includes tool usage instructions
- ✅ Check: Knowledge base contains car data

**Issue: Images not loading**
- ✅ Check: Image files exist in `/project/public/images/cars/`
- ✅ Check: Filenames match exactly (case-sensitive)
- ✅ Check: Images are accessible via URL
- ✅ Check: File sizes are reasonable (< 2MB)

**Issue: Links not opening**
- ✅ Check: Emil Frey URLs are correct and accessible
- ✅ Check: `displayProductLink` tool has correct parameters
- ✅ Check: Browser is not blocking pop-ups

**Issue: Agent doesn't understand car requests**
- ✅ Check: Knowledge base data was uploaded correctly
- ✅ Check: System prompt includes automotive context
- ✅ Check: Agent has access to knowledge base

**Issue: Overlays not dismissing**
- ✅ Check: `dismissOverlays` tool is configured
- ✅ Check: Tool has no parameters
- ✅ Check: Agent prompt includes dismissal instructions

## 🚀 Production Deployment

### Pre-Production Checklist
- [ ] All tests pass successfully
- [ ] Images are optimized for web (compressed, appropriate format)
- [ ] Emil Frey URLs are verified and working
- [ ] Agent responses are natural and helpful
- [ ] Error handling works properly
- [ ] Mobile responsiveness is confirmed

### Go-Live Steps
1. [ ] Deploy widget to production environment
2. [ ] Verify all image URLs work in production
3. [ ] Test agent functionality in production
4. [ ] Monitor for any errors or issues
5. [ ] Document any production-specific configuration

## 📞 Support Information

**For ElevenLabs Issues:**
- Check ElevenLabs dashboard for agent status
- Verify API limits and usage
- Review agent logs for errors

**For Widget Issues:**
- Check browser console for JavaScript errors
- Verify network requests are successful
- Test in different browsers

**For Image Issues:**
- Confirm image hosting is working
- Check image file permissions
- Verify file paths are correct

## 🎉 Success Criteria

Your implementation is successful when:

✅ **Users can ask "What cars do you have?" and see all 3 Emil Frey cars**
✅ **Users can request family cars and see the Peugeot 5008**
✅ **Users can get detailed links to Emil Frey website**
✅ **All images load quickly and are zoomable**
✅ **Avatar animations work smoothly**
✅ **Product displays can be dismissed easily**
✅ **The experience works on both mobile and desktop**

Once all these criteria are met, your Emil Frey car showcase is ready for customer use! 🚗✨