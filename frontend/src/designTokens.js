/**
 * Material Design 3 (Material You) Design Tokens
 * Inspired by Google Store / Pixel product pages
 *
 * This file contains all design tokens used throughout the application.
 * Import these tokens in your components for consistent styling.
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const colors = {
  // Primary - Google Blue
  primary: {
    main: "#1a73e8",
    light: "#4285f4",
    dark: "#1557b0",
    surface: "#e8f0fe",
    onPrimary: "#ffffff",
  },

  // Secondary - Subtle Teal
  secondary: {
    main: "#137333",
    light: "#1e8e3e",
    dark: "#0d5626",
    surface: "#e6f4ea",
  },

  // Text Colors
  text: {
    primary: "#202124",
    secondary: "#5f6368",
    tertiary: "#80868b",
    disabled: "#bdc1c6",
    onDark: "#ffffff",
    onLight: "#202124",
  },

  // Surface Colors
  surface: {
    background: "#ffffff",
    elevated: "#ffffff",
    container: "#f8f9fa",
    containerHigh: "#f1f3f4",
    containerLow: "#fafafa",
    overlay: "rgba(32, 33, 36, 0.6)",
  },

  // Semantic Colors
  success: {
    main: "#1e8e3e",
    light: "#34a853",
    surface: "#e6f4ea",
    onSuccess: "#ffffff",
  },

  warning: {
    main: "#f9ab00",
    light: "#fbbc04",
    surface: "#fef7e0",
    onWarning: "#202124",
  },

  error: {
    main: "#d93025",
    light: "#ea4335",
    surface: "#fce8e6",
    onError: "#ffffff",
  },

  info: {
    main: "#1a73e8",
    light: "#4285f4",
    surface: "#e8f0fe",
  },

  // Border Colors
  border: {
    light: "#e8eaed",
    medium: "#dadce0",
    dark: "#bdc1c6",
  },

  // Special
  divider: "#e0e0e0",
  hover: "rgba(32, 33, 36, 0.04)",
  focus: "rgba(26, 115, 232, 0.12)",
  pressed: "rgba(32, 33, 36, 0.1)",
};

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  // Font Family - Google Sans with fallbacks
  fontFamily: {
    primary:
      '"Google Sans", "Product Sans", "Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    display:
      '"Google Sans Display", "Google Sans", "Product Sans", "Roboto", sans-serif',
    mono: '"Google Sans Mono", "Roboto Mono", "SF Mono", Monaco, Consolas, monospace',
  },

  // Font Weights - Prefer lighter weights for MD3
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700, // Use sparingly
  },

  // Font Sizes - Following MD3 type scale
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tight: "-0.02em",
    normal: "0em",
    wide: "0.01em",
    wider: "0.02em",
  },

  // Predefined Text Styles
  styles: {
    displayLarge: {
      fontSize: "3.5rem",
      fontWeight: 400,
      lineHeight: 1.125,
      letterSpacing: "-0.02em",
    },
    displayMedium: {
      fontSize: "2.75rem",
      fontWeight: 400,
      lineHeight: 1.15,
      letterSpacing: "-0.015em",
    },
    displaySmall: {
      fontSize: "2.25rem",
      fontWeight: 400,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    headlineLarge: {
      fontSize: "2rem",
      fontWeight: 400,
      lineHeight: 1.25,
      letterSpacing: "0em",
    },
    headlineMedium: {
      fontSize: "1.75rem",
      fontWeight: 400,
      lineHeight: 1.3,
      letterSpacing: "0em",
    },
    headlineSmall: {
      fontSize: "1.5rem",
      fontWeight: 400,
      lineHeight: 1.35,
      letterSpacing: "0em",
    },
    titleLarge: {
      fontSize: "1.375rem",
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: "0em",
    },
    titleMedium: {
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: "0.01em",
    },
    titleSmall: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.45,
      letterSpacing: "0.01em",
    },
    bodyLarge: {
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: "0.01em",
    },
    bodyMedium: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.45,
      letterSpacing: "0.02em",
    },
    bodySmall: {
      fontSize: "0.75rem",
      fontWeight: 400,
      lineHeight: 1.35,
      letterSpacing: "0.03em",
    },
    labelLarge: {
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: 1.45,
      letterSpacing: "0.01em",
    },
    labelMedium: {
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: 1.35,
      letterSpacing: "0.04em",
    },
    labelSmall: {
      fontSize: "0.6875rem",
      fontWeight: 500,
      lineHeight: 1.3,
      letterSpacing: "0.04em",
    },
  },
};

// =============================================================================
// SPACING (8dp Grid System)
// =============================================================================

export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
  40: "10rem", // 160px
  48: "12rem", // 192px

  // Semantic spacing
  pageMargin: "1.5rem",
  pageMarginLg: "3rem",
  sectionGap: "4rem",
  cardPadding: "1.5rem",
  cardPaddingLg: "2rem",
  inputPadding: "0.875rem 1rem",
  buttonPadding: "0.75rem 1.5rem",
  buttonPaddingLg: "1rem 2rem",
};

// =============================================================================
// BORDER RADIUS (MD3 uses larger, rounder corners)
// =============================================================================

export const borderRadius = {
  none: "0",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "28px",
  full: "9999px",

  // Semantic
  button: "9999px", // Pill-shaped for primary buttons
  buttonRect: "8px", // For secondary buttons
  card: "20px",
  cardLg: "28px",
  input: "8px",
  chip: "8px",
  dialog: "28px",
  menu: "12px",
  tooltip: "8px",
};

// =============================================================================
// ELEVATION / SHADOWS (Subtle MD3 shadows)
// =============================================================================

export const elevation = {
  none: "none",

  // Level 1 - Subtle
  level1:
    "0 1px 2px rgba(60, 64, 67, 0.1), 0 1px 3px 1px rgba(60, 64, 67, 0.06)",

  // Level 2 - Cards at rest
  level2:
    "0 1px 3px rgba(60, 64, 67, 0.1), 0 4px 8px 3px rgba(60, 64, 67, 0.06)",

  // Level 3 - Elevated cards
  level3:
    "0 4px 8px 3px rgba(60, 64, 67, 0.1), 0 1px 3px rgba(60, 64, 67, 0.08)",

  // Level 4 - Dialogs, modals
  level4:
    "0 6px 10px 4px rgba(60, 64, 67, 0.1), 0 2px 3px rgba(60, 64, 67, 0.1)",

  // Level 5 - High elevation
  level5:
    "0 8px 12px 6px rgba(60, 64, 67, 0.1), 0 4px 4px rgba(60, 64, 67, 0.1)",

  // Semantic
  card: "0 1px 3px rgba(60, 64, 67, 0.1), 0 4px 8px 3px rgba(60, 64, 67, 0.06)",
  cardHover:
    "0 4px 8px 3px rgba(60, 64, 67, 0.12), 0 1px 3px rgba(60, 64, 67, 0.1)",
  dropdown:
    "0 4px 8px 3px rgba(60, 64, 67, 0.1), 0 1px 3px rgba(60, 64, 67, 0.08)",
  modal:
    "0 8px 12px 6px rgba(60, 64, 67, 0.15), 0 4px 4px rgba(60, 64, 67, 0.1)",
  button: "0 1px 2px rgba(60, 64, 67, 0.08)",
  buttonHover:
    "0 1px 3px rgba(60, 64, 67, 0.12), 0 4px 8px rgba(26, 115, 232, 0.1)",
};

// =============================================================================
// TRANSITIONS / MOTION (Material motion)
// =============================================================================

export const motion = {
  // Durations
  duration: {
    instant: "0ms",
    fast: "150ms",
    normal: "200ms",
    slow: "300ms",
    slower: "400ms",
  },

  // Easing curves (MD3 standard)
  easing: {
    standard: "cubic-bezier(0.2, 0, 0, 1)",
    decelerate: "cubic-bezier(0, 0, 0, 1)",
    accelerate: "cubic-bezier(0.3, 0, 1, 1)",
    linear: "linear",
    // For emphasis
    emphasized: "cubic-bezier(0.2, 0, 0, 1)",
    emphasizedDecelerate: "cubic-bezier(0.05, 0.7, 0.1, 1)",
    emphasizedAccelerate: "cubic-bezier(0.3, 0, 0.8, 0.15)",
  },

  // Common transitions
  transition: {
    fast: `all 150ms cubic-bezier(0.2, 0, 0, 1)`,
    normal: `all 200ms cubic-bezier(0.2, 0, 0, 1)`,
    slow: `all 300ms cubic-bezier(0.2, 0, 0, 1)`,
    transform: `transform 200ms cubic-bezier(0.2, 0, 0, 1)`,
    opacity: `opacity 200ms cubic-bezier(0.2, 0, 0, 1)`,
    color: `color 150ms cubic-bezier(0.2, 0, 0, 1)`,
    background: `background-color 150ms cubic-bezier(0.2, 0, 0, 1)`,
    shadow: `box-shadow 200ms cubic-bezier(0.2, 0, 0, 1)`,
  },
};

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  xs: "0px",
  sm: "600px",
  md: "900px",
  lg: "1200px",
  xl: "1536px",
};

// =============================================================================
// Z-INDEX
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  backdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
};

// =============================================================================
// COMPONENT-SPECIFIC TOKENS
// =============================================================================

export const components = {
  // Cards
  card: {
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    paddingLg: spacing.cardPaddingLg,
    background: colors.surface.background,
    shadow: elevation.card,
    shadowHover: elevation.cardHover,
  },

  // Buttons
  button: {
    borderRadius: borderRadius.button,
    padding: spacing.buttonPadding,
    paddingLg: spacing.buttonPaddingLg,
    fontWeight: typography.fontWeight.medium,
    fontSize: typography.fontSize.sm,
    transition: motion.transition.normal,
  },

  // Text Fields
  textField: {
    borderRadius: borderRadius.input,
    padding: spacing.inputPadding,
    borderColor: colors.border.medium,
    focusBorderColor: colors.primary.main,
    background: colors.surface.background,
    backgroundFocus: colors.surface.container,
  },

  // Tables
  table: {
    headerBackground: colors.surface.container,
    rowHover: colors.hover,
    cellPadding: `${spacing[4]} ${spacing[6]}`,
    borderColor: colors.border.light,
  },

  // Navigation
  nav: {
    height: "64px",
    heightMobile: "56px",
    background: colors.surface.background,
    borderColor: colors.border.light,
    itemPadding: `${spacing[2]} ${spacing[4]}`,
    itemBorderRadius: borderRadius.full,
    activeBackground: colors.primary.surface,
    activeColor: colors.primary.main,
  },

  // Tabs (Pill-style like Google Store)
  tabs: {
    borderRadius: borderRadius.full,
    padding: `${spacing[2]} ${spacing[4]}`,
    background: colors.surface.container,
    activeBackground: colors.surface.background,
    activeShadow: elevation.level1,
  },
};

// =============================================================================
// EXPORT DEFAULT THEME OBJECT
// =============================================================================

const designTokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  elevation,
  motion,
  breakpoints,
  zIndex,
  components,
};

export default designTokens;
