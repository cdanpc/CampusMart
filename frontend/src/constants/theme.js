/**
 * CampusMart Design System - JavaScript Theme Constants
 * 
 * Use these constants when you need color values in JavaScript logic
 * (e.g., canvas operations, dynamic styling, chart libraries)
 * 
 * For CSS styling, prefer using CSS custom properties from theme.css
 */

export const colors = {
  // Brand Colors
  primary: '#052659',           // Deep Navy - Headers, Navigation, Brand
  primaryActive: '#5483B3',     // Medium Blue - CTA Buttons, Active States
  bgAccent: '#C1E8FF',          // Very Light Blue - Card Backgrounds, Accents
  accent: '#FF7F00',            // Vibrant Orange - NEW badges, Price tags, Trade button
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semantic/Feedback Colors
  success: '#4CAF50',           // Product posted, Email verified
  warning: '#FF9800',           // Warnings, Cautions
  error: '#F44336',             // Invalid login, Deletion, Out of Stock
  danger: '#F44336',            // Alias for error
  info: '#3B82F6',              // Informational messages
};

export const spacing = {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
};

export const fontSize = {
  xs: '0.75rem',    // 12px
  sm: '0.875rem',   // 14px
  base: '1rem',     // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
};

export const fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const borderRadius = {
  sm: '0.25rem',  // 4px
  md: '0.5rem',   // 8px
  lg: '0.75rem',  // 12px
  xl: '1rem',     // 16px
  full: '9999px', // Fully rounded
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
};

export default {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  breakpoints,
  zIndex,
};
