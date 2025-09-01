/**
 * 🎨 Default Theme Configuration
 * Orange/Blue theme for RD Leuchten AG
 */
export const defaultTheme = {
  name: "RD Leuchten Default",
  primary: {
    light: "#fb923c", // Orange 400
    main: "#f97316",  // Orange 500
    dark: "#ea580c"   // Orange 600
  },
  secondary: {
    light: "#60a5fa", // Blue 400
    main: "#3b82f6",  // Blue 500
    dark: "#2563eb"   // Blue 600
  },
  status: {
    success: "#10b981", // Green 500
    warning: "#f59e0b", // Amber 500
    error: "#ef4444",   // Red 500
    info: "#6b7280"     // Gray 500
  },
  backgrounds: {
    textMode: {
      primary: "from-white/95 via-orange-50/70 to-orange-100/80",
      header: "from-[#dbbe9b]/60 via-[#f5e6d3]/40 to-transparent",
      footer: "from-orange-200/60 via-orange-100/40 to-white/10"
    },
    voiceMode: {
      primary: "from-blue-50/40 via-blue-25/20 to-blue-50/30",
      header: "from-[#dbbe9b]/60 via-[#f5e6d3]/40 to-transparent",
      footer: "from-blue-200/60 via-blue-100/40 to-white/10"
    }
  }
};