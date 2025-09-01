/**
 * 🎨 Corporate Blue Theme Configuration
 * Professional blue/green theme for corporate clients
 */
export const corporateBlueTheme = {
  name: "Corporate Blue",
  primary: {
    light: "#3b82f6", // Blue 500
    main: "#1d4ed8",  // Blue 700
    dark: "#1e3a8a"   // Blue 800
  },
  secondary: {
    light: "#34d399", // Emerald 400
    main: "#10b981",  // Emerald 500
    dark: "#047857"   // Emerald 700
  },
  status: {
    success: "#10b981", // Emerald 500
    warning: "#f59e0b", // Amber 500
    error: "#ef4444",   // Red 500
    info: "#6b7280"     // Gray 500
  },
  backgrounds: {
    textMode: {
      primary: "from-white/95 via-blue-50/70 to-blue-100/80",
      header: "from-blue-100/60 via-blue-50/40 to-transparent",
      footer: "from-blue-200/60 via-blue-100/40 to-white/10"
    },
    voiceMode: {
      primary: "from-emerald-50/40 via-emerald-25/20 to-emerald-50/30",
      header: "from-blue-100/60 via-blue-50/40 to-transparent",
      footer: "from-emerald-200/60 via-emerald-100/40 to-white/10"
    }
  }
};