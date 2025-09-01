# 🚀 Multi-Tenant Deployment Guide

## Overview

This LiveKit voice agent widget has been designed as a **multi-tenant system** that allows easy customization for different companies. All customizable elements (text, colors, themes, assets) are centralized in configuration files, making deployment for multiple companies straightforward.

## 📁 Configuration Structure

```
project/src/config/
├── company.config.js          # Main configuration file (customize this)
├── useCompanyConfig.js        # React hook (do not modify)
├── localization/
│   ├── en.js                 # English translations
│   ├── de.js                 # German translations
│   └── [add-new-language].js # Add more languages as needed
└── themes/
    ├── default.js            # Default theme
    ├── corporate-blue.js     # Corporate blue theme
    └── [add-new-theme].js    # Add custom themes
```

## 🎯 Quick Start for New Company Deployment

### Step 1: Customize Main Configuration

Edit **`project/src/config/company.config.js`**:

```javascript
export const companyConfig = {
  // Company Branding
  company: {
    name: "YOUR_COMPANY_NAME",
    domain: "yourcompany.com",
    industry: "your-industry"
  },

  // Language Selection
  language: "en", // or "de" or add your own language file

  // Theme Selection  
  theme: "default", // or "corporate-blue" or create custom theme

  // Asset Paths (customize your media files)
  assets: {
    riveAnimation: "/animations/your-avatar.riv",
    images: {
      characterBackground: "/images/your-background.png",
      productContainer: "/images/your-container.png"
    }
  }
};
```

### Step 2: Add Your Assets

Replace these files with your company's assets:
- **`/public/animations/your-avatar.riv`** - Your Rive avatar animation
- **`/public/images/your-background.png`** - Character background image
- **`/public/images/your-container.png`** - Product container background

### Step 3: Deploy

Build and deploy the project - all customizations will be applied automatically!

## 🎨 Advanced Customization

### Creating a Custom Theme

1. Create a new theme file: **`project/src/config/themes/your-company-theme.js`**

```javascript
export const yourCompanyTheme = {
  colors: {
    primary: "#YOUR_PRIMARY_COLOR",
    secondary: "#YOUR_SECONDARY_COLOR", 
    primaryDark: "#YOUR_PRIMARY_DARK",
    accent: "#YOUR_ACCENT_COLOR",
    background: "#YOUR_BG_COLOR",
    surface: "#YOUR_SURFACE_COLOR",
    text: {
      primary: "#YOUR_TEXT_COLOR",
      secondary: "#YOUR_SECONDARY_TEXT"
    },
    status: {
      success: "#00C851",
      warning: "#ffbb33", 
      error: "#ff4444",
      info: "#33b5e5"
    }
  },
  gradients: {
    primary: "linear-gradient(135deg, #YOUR_COLOR1, #YOUR_COLOR2)",
    secondary: "linear-gradient(135deg, #YOUR_COLOR3, #YOUR_COLOR4)"
  }
};
```

2. Update **`company.config.js`**:
```javascript
import { yourCompanyTheme } from './themes/your-company-theme.js';

export const companyConfig = {
  // ... other config
  theme: yourCompanyTheme, // Use custom theme directly
  // OR
  theme: "your-company-theme", // Use theme name if you register it
};
```

### Adding a New Language

1. Create **`project/src/config/localization/your-language.js`**:

```javascript
export const yourLanguageLocalization = {
  language: "your-lang-code",
  text: {
    defaultGreeting: {
      text: "Your greeting text here",
      voice: "Your voice greeting here"
    },
    ui: {
      sendMessage: "Your translation",
      activateVoice: "Your translation", 
      // ... copy all keys from en.js and translate
    },
    errors: {
      connectionFailed: "Your translation",
      // ... translate all error messages
    }
  }
};
```

2. Update **`company.config.js`**:
```javascript
export const companyConfig = {
  // ... other config
  language: "your-lang-code",
};
```

## 🏢 Example Company Configurations

### Example 1: Tech Startup
```javascript
export const companyConfig = {
  company: {
    name: "TechFlow Solutions",
    domain: "techflow.io",
    industry: "technology"
  },
  language: "en",
  theme: "corporate-blue",
  assets: {
    riveAnimation: "/animations/tech-avatar.riv",
    images: {
      characterBackground: "/images/tech-bg.png",
      productContainer: "/images/tech-container.png"
    }
  }
};
```

### Example 2: German Manufacturing Company
```javascript
export const companyConfig = {
  company: {
    name: "Präzision Maschinen GmbH", 
    domain: "praezision-maschinen.de",
    industry: "manufacturing"
  },
  language: "de",
  theme: "default",
  assets: {
    riveAnimation: "/animations/industry-avatar.riv",
    images: {
      characterBackground: "/images/factory-bg.png", 
      productContainer: "/images/industrial-container.png"
    }
  }
};
```

### Example 3: Healthcare Provider
```javascript
import { healthcareTheme } from './themes/healthcare-theme.js';

export const companyConfig = {
  company: {
    name: "MedCare Plus",
    domain: "medcareplus.com", 
    industry: "healthcare"
  },
  language: "en",
  theme: healthcareTheme, // Custom theme
  assets: {
    riveAnimation: "/animations/medical-avatar.riv",
    images: {
      characterBackground: "/images/medical-bg.png",
      productContainer: "/images/medical-container.png"
    }
  },
  behavior: {
    ui: {
      responsiveBreakpoint: 768,
      avatar: {
        mobile: {
          translate: { x: 190, y: -70 },
          scale: 0.95,
          borderRadius: "98%" 
        },
        desktop: {
          translate: { x: 210, y: -110 },
          scale: 0.90,
          borderRadius: "50%"
        }
      }
    }
  }
};
```

## 🔧 Configuration Options Reference

### Company Branding
- **`company.name`** - Your company name (displayed in UI)
- **`company.domain`** - Your website domain
- **`company.industry`** - Industry type for analytics

### Language & Localization  
- **`language`** - Language code ("en", "de", etc.)
- All UI text is automatically translated based on this setting

### Theme & Styling
- **`theme`** - Theme object or theme name
- **Colors**: primary, secondary, accent, text, status colors
- **Gradients**: background gradients

### Assets & Media
- **`assets.riveAnimation`** - Path to your Rive avatar file
- **`assets.images.characterBackground`** - Avatar background image
- **`assets.images.productContainer`** - Product display container image

### Responsive Behavior
- **`behavior.ui.responsiveBreakpoint`** - Mobile/desktop breakpoint (default: 768px)
- **`behavior.ui.avatar.mobile/desktop`** - Avatar positioning and scaling

## 🚀 Deployment Checklist

### For Each New Company:

- [ ] **Update company.config.js** with company details
- [ ] **Choose or create theme** matching company branding  
- [ ] **Select language** (en/de or create new language file)
- [ ] **Replace assets** (Rive animation, background images)
- [ ] **Test responsive behavior** on mobile and desktop
- [ ] **Verify all text** is properly translated/customized
- [ ] **Test color scheme** matches company branding
- [ ] **Build and deploy** the customized version

### Asset Requirements:

- **Rive Animation**: `.riv` file with animation states: `isSpeaking`, `IsListening`
- **Background Images**: PNG/JPG files optimized for web
- **Container Images**: PNG files with transparency support

## 🛠️ Technical Notes

### File Modification Rules:
- ✅ **Safe to modify**: `company.config.js`, language files, theme files
- ❌ **Do not modify**: `useCompanyConfig.js`, component files
- ⚠️ **Add only**: New language files, new theme files

### Performance Tips:
- Keep asset files optimized (< 2MB for images, < 5MB for Rive)
- Test loading performance after customization
- Use appropriate image formats (WebP when possible)

### Browser Support:
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design works on all screen sizes

## 🆘 Troubleshooting

### Common Issues:

1. **Avatar not loading**: Check Rive file path and animation state names
2. **Colors not applied**: Verify theme configuration syntax
3. **Text not translated**: Check language code and translation keys
4. **Images not showing**: Verify asset paths and file locations

### Support:
For technical support or questions about the configuration system, contact the development team.

---

**🎉 You're all set!** This multi-tenant system makes it easy to deploy the same widget for multiple companies with their unique branding and localization.