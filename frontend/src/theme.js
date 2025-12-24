/**
 * Material Design 3 (Material You) MUI Theme
 * Styled to match Google Store / Pixel product pages
 */

import { createTheme, alpha } from "@mui/material/styles";
import designTokens from "./designTokens";

const { colors, typography, spacing, borderRadius, elevation, motion } =
  designTokens;

const theme = createTheme({
  // Palette
  palette: {
    mode: "light",
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: colors.primary.onPrimary,
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
      contrastText: "#ffffff",
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      contrastText: colors.success.onSuccess,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      contrastText: colors.error.onError,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      contrastText: colors.warning.onWarning,
    },
    info: {
      main: colors.info.main,
      light: colors.info.light,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
    background: {
      default: colors.surface.container,
      paper: colors.surface.background,
    },
    divider: colors.divider,
    action: {
      hover: colors.hover,
      selected: colors.focus,
      focus: colors.focus,
    },
  },

  // Typography
  typography: {
    fontFamily: typography.fontFamily.primary,

    // Display styles
    h1: {
      fontFamily: typography.fontFamily.display,
      fontSize: typography.styles.displayLarge.fontSize,
      fontWeight: typography.styles.displayLarge.fontWeight,
      lineHeight: typography.styles.displayLarge.lineHeight,
      letterSpacing: typography.styles.displayLarge.letterSpacing,
      color: colors.text.primary,
    },
    h2: {
      fontFamily: typography.fontFamily.display,
      fontSize: typography.styles.displayMedium.fontSize,
      fontWeight: typography.styles.displayMedium.fontWeight,
      lineHeight: typography.styles.displayMedium.lineHeight,
      letterSpacing: typography.styles.displayMedium.letterSpacing,
      color: colors.text.primary,
    },
    h3: {
      fontFamily: typography.fontFamily.display,
      fontSize: typography.styles.headlineLarge.fontSize,
      fontWeight: typography.styles.headlineLarge.fontWeight,
      lineHeight: typography.styles.headlineLarge.lineHeight,
      color: colors.text.primary,
    },
    h4: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.styles.headlineMedium.fontSize,
      fontWeight: typography.styles.headlineMedium.fontWeight,
      lineHeight: typography.styles.headlineMedium.lineHeight,
      color: colors.text.primary,
    },
    h5: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.styles.headlineSmall.fontSize,
      fontWeight: typography.styles.headlineSmall.fontWeight,
      lineHeight: typography.styles.headlineSmall.lineHeight,
      color: colors.text.primary,
    },
    h6: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.styles.titleLarge.fontSize,
      fontWeight: typography.styles.titleLarge.fontWeight,
      lineHeight: typography.styles.titleLarge.lineHeight,
      color: colors.text.primary,
    },
    subtitle1: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.styles.titleMedium.fontSize,
      fontWeight: typography.styles.titleMedium.fontWeight,
      lineHeight: typography.styles.titleMedium.lineHeight,
      color: colors.text.primary,
    },
    subtitle2: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.styles.titleSmall.fontSize,
      fontWeight: typography.styles.titleSmall.fontWeight,
      lineHeight: typography.styles.titleSmall.lineHeight,
      color: colors.text.secondary,
    },
    body1: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.styles.bodyLarge.fontSize,
      fontWeight: typography.styles.bodyLarge.fontWeight,
      lineHeight: typography.styles.bodyLarge.lineHeight,
      letterSpacing: typography.styles.bodyLarge.letterSpacing,
      color: colors.text.primary,
    },
    body2: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.styles.bodyMedium.fontSize,
      fontWeight: typography.styles.bodyMedium.fontWeight,
      lineHeight: typography.styles.bodyMedium.lineHeight,
      letterSpacing: typography.styles.bodyMedium.letterSpacing,
      color: colors.text.secondary,
    },
    caption: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.styles.labelMedium.fontSize,
      fontWeight: typography.styles.labelMedium.fontWeight,
      lineHeight: typography.styles.labelMedium.lineHeight,
      letterSpacing: typography.styles.labelMedium.letterSpacing,
      color: colors.text.tertiary,
    },
    overline: {
      fontFamily: typography.fontFamily.primary,
      fontSize: typography.styles.labelSmall.fontSize,
      fontWeight: typography.styles.labelSmall.fontWeight,
      lineHeight: typography.styles.labelSmall.lineHeight,
      letterSpacing: typography.styles.labelSmall.letterSpacing,
      textTransform: "uppercase",
      color: colors.text.tertiary,
    },
    button: {
      fontFamily: typography.fontFamily.primary,
      fontWeight: typography.fontWeight.medium,
      fontSize: typography.styles.labelLarge.fontSize,
      letterSpacing: typography.styles.labelLarge.letterSpacing,
      textTransform: "none",
    },
  },

  // Shape
  shape: {
    borderRadius: 12,
  },

  // Spacing (8px base)
  spacing: 8,

  // Breakpoints
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },

  // Component overrides
  components: {
    // Global CSS baseline
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.surface.container,
          color: colors.text.primary,
          fontFamily: typography.fontFamily.primary,
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        "*": {
          boxSizing: "border-box",
        },
        "::selection": {
          backgroundColor: alpha(colors.primary.main, 0.2),
          color: colors.primary.dark,
        },
      },
    },

    // App Bar
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface.background,
          color: colors.text.primary,
          boxShadow: "none",
          borderBottom: `1px solid ${colors.border.light}`,
          backdropFilter: "blur(10px)",
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },

    // Toolbar
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: "64px",
          "@media (min-width: 600px)": {
            minHeight: "72px",
          },
        },
      },
    },

    // Button - Pill-shaped for primary
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.button,
          padding: "10px 24px",
          fontWeight: typography.fontWeight.medium,
          fontSize: typography.fontSize.sm,
          textTransform: "none",
          transition: motion.transition.normal,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: elevation.buttonHover,
          },
          "&:active": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: colors.primary.main,
          color: colors.primary.onPrimary,
          "&:hover": {
            backgroundColor: colors.primary.dark,
          },
        },
        outlined: {
          borderColor: colors.border.medium,
          borderWidth: "1px",
          "&:hover": {
            backgroundColor: colors.hover,
            borderColor: colors.border.dark,
          },
        },
        outlinedPrimary: {
          borderColor: colors.primary.main,
          color: colors.primary.main,
          "&:hover": {
            backgroundColor: alpha(colors.primary.main, 0.04),
            borderColor: colors.primary.dark,
          },
        },
        text: {
          "&:hover": {
            backgroundColor: colors.hover,
          },
        },
        textPrimary: {
          color: colors.primary.main,
          "&:hover": {
            backgroundColor: alpha(colors.primary.main, 0.04),
          },
        },
        sizeLarge: {
          padding: "14px 32px",
          fontSize: typography.fontSize.base,
        },
        sizeSmall: {
          padding: "6px 16px",
          fontSize: typography.fontSize.sm,
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },

    // Icon Button
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.full,
          transition: motion.transition.fast,
          "&:hover": {
            backgroundColor: colors.hover,
          },
        },
      },
    },

    // Card
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.card,
          boxShadow: elevation.card,
          backgroundColor: colors.surface.background,
          border: "none",
          transition: motion.transition.normal,
          "&:hover": {
            boxShadow: elevation.cardHover,
          },
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: spacing.cardPaddingLg,
          "&:last-child": {
            paddingBottom: spacing.cardPaddingLg,
          },
        },
      },
    },

    // Paper
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: colors.surface.background,
        },
        rounded: {
          borderRadius: borderRadius.lg,
        },
        elevation1: {
          boxShadow: elevation.level1,
        },
        elevation2: {
          boxShadow: elevation.level2,
        },
        elevation3: {
          boxShadow: elevation.level3,
        },
        elevation4: {
          boxShadow: elevation.level4,
        },
      },
      defaultProps: {
        elevation: 0,
      },
    },

    // Text Field
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: borderRadius.input,
            backgroundColor: colors.surface.background,
            transition: motion.transition.fast,
            "& fieldset": {
              borderColor: colors.border.medium,
              borderWidth: "1px",
              transition: motion.transition.fast,
            },
            "&:hover fieldset": {
              borderColor: colors.border.dark,
            },
            "&.Mui-focused fieldset": {
              borderColor: colors.primary.main,
              borderWidth: "2px",
            },
            "&.Mui-focused": {
              backgroundColor: colors.surface.container,
            },
          },
          "& .MuiInputLabel-root": {
            fontFamily: typography.fontFamily.primary,
            fontWeight: typography.fontWeight.regular,
            color: colors.text.secondary,
            "&.Mui-focused": {
              color: colors.primary.main,
            },
          },
          "& .MuiInputBase-input": {
            fontFamily: typography.fontFamily.primary,
            padding: "14px 16px",
          },
        },
      },
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.input,
        },
      },
    },

    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: `${borderRadius.input} ${borderRadius.input} 0 0`,
          backgroundColor: colors.surface.container,
          "&:hover": {
            backgroundColor: colors.surface.containerHigh,
          },
          "&.Mui-focused": {
            backgroundColor: colors.surface.containerHigh,
          },
        },
      },
    },

    // Autocomplete
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.menu,
          boxShadow: elevation.dropdown,
          marginTop: "4px",
        },
        listbox: {
          padding: "4px",
        },
        option: {
          borderRadius: borderRadius.sm,
          margin: "2px 4px",
          padding: "10px 12px",
          "&[aria-selected='true']": {
            backgroundColor: alpha(colors.primary.main, 0.08),
          },
          "&:hover": {
            backgroundColor: colors.hover,
          },
        },
      },
    },

    // Table
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.lg,
          boxShadow: "none",
          border: `1px solid ${colors.border.light}`,
          overflow: "hidden",
        },
      },
    },

    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface.background,
        },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface.container,
          "& .MuiTableCell-head": {
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            fontSize: typography.fontSize.sm,
            borderBottom: `1px solid ${colors.border.light}`,
            padding: "16px 24px",
            textTransform: "none",
          },
        },
      },
    },

    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root": {
            transition: motion.transition.fast,
            "&:hover": {
              backgroundColor: colors.hover,
            },
            "&:last-child .MuiTableCell-body": {
              borderBottom: "none",
            },
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: typography.fontFamily.primary,
          fontSize: typography.fontSize.sm,
          padding: "14px 24px",
          borderBottom: `1px solid ${colors.border.light}`,
          color: colors.text.primary,
        },
        head: {
          fontWeight: typography.fontWeight.medium,
          backgroundColor: colors.surface.container,
          color: colors.text.primary,
        },
      },
    },

    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: alpha(colors.primary.main, 0.08),
            "&:hover": {
              backgroundColor: alpha(colors.primary.main, 0.12),
            },
          },
        },
      },
    },

    // Menu
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.menu,
          boxShadow: elevation.dropdown,
          border: `1px solid ${colors.border.light}`,
        },
        list: {
          padding: "4px",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          margin: "2px 4px",
          padding: "10px 16px",
          fontFamily: typography.fontFamily.primary,
          fontSize: typography.fontSize.sm,
          transition: motion.transition.fast,
          "&:hover": {
            backgroundColor: colors.hover,
          },
          "&.Mui-selected": {
            backgroundColor: alpha(colors.primary.main, 0.08),
            "&:hover": {
              backgroundColor: alpha(colors.primary.main, 0.12),
            },
          },
        },
      },
    },

    // Dialog
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: borderRadius.dialog,
          boxShadow: elevation.modal,
          padding: "8px",
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.fontWeight.medium,
          fontSize: typography.styles.headlineSmall.fontSize,
          padding: "24px 24px 16px",
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "0 24px 24px",
        },
      },
    },

    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "16px 24px 24px",
          gap: "12px",
        },
      },
    },

    // Chip
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.chip,
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.fontWeight.medium,
          fontSize: typography.fontSize.sm,
          transition: motion.transition.fast,
        },
        filled: {
          backgroundColor: colors.surface.containerHigh,
          "&:hover": {
            backgroundColor: colors.surface.container,
          },
        },
        outlined: {
          borderColor: colors.border.medium,
        },
        colorPrimary: {
          backgroundColor: alpha(colors.primary.main, 0.1),
          color: colors.primary.main,
          "&:hover": {
            backgroundColor: alpha(colors.primary.main, 0.15),
          },
        },
      },
    },

    // Tabs - Pill style like Google Store
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: "48px",
          backgroundColor: colors.surface.container,
          borderRadius: borderRadius.full,
          padding: "4px",
        },
        indicator: {
          display: "none",
        },
        flexContainer: {
          gap: "4px",
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: "40px",
          borderRadius: borderRadius.full,
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.fontWeight.medium,
          fontSize: typography.fontSize.sm,
          textTransform: "none",
          color: colors.text.secondary,
          padding: "8px 20px",
          transition: motion.transition.fast,
          "&:hover": {
            color: colors.text.primary,
            backgroundColor: colors.hover,
          },
          "&.Mui-selected": {
            color: colors.text.primary,
            backgroundColor: colors.surface.background,
            boxShadow: elevation.level1,
          },
        },
      },
    },

    // Alert
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.md,
          fontFamily: typography.fontFamily.primary,
        },
        standardSuccess: {
          backgroundColor: colors.success.surface,
          color: colors.success.dark,
        },
        standardError: {
          backgroundColor: colors.error.surface,
          color: colors.error.main,
        },
        standardWarning: {
          backgroundColor: colors.warning.surface,
          color: colors.warning.main,
        },
        standardInfo: {
          backgroundColor: colors.info.surface,
          color: colors.info.main,
        },
      },
    },

    // Snackbar
    MuiSnackbar: {
      styleOverrides: {
        root: {
          "& .MuiAlert-root": {
            borderRadius: borderRadius.md,
          },
        },
      },
    },

    // Tooltip
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.text.primary,
          color: colors.text.onDark,
          fontSize: typography.fontSize.sm,
          fontFamily: typography.fontFamily.primary,
          borderRadius: borderRadius.tooltip,
          padding: "8px 12px",
        },
        arrow: {
          color: colors.text.primary,
        },
      },
    },

    // Circular Progress
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: colors.primary.main,
        },
      },
    },

    // Linear Progress
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.full,
          backgroundColor: alpha(colors.primary.main, 0.12),
        },
        bar: {
          borderRadius: borderRadius.full,
        },
      },
    },

    // Radio & Checkbox
    MuiRadio: {
      styleOverrides: {
        root: {
          color: colors.border.dark,
          "&.Mui-checked": {
            color: colors.primary.main,
          },
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colors.border.dark,
          borderRadius: borderRadius.sm,
          "&.Mui-checked": {
            color: colors.primary.main,
          },
        },
      },
    },

    // Form Control Label
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontFamily: typography.fontFamily.primary,
          fontSize: typography.fontSize.sm,
          color: colors.text.primary,
        },
      },
    },

    // Form Label
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontFamily: typography.fontFamily.primary,
          fontSize: typography.fontSize.sm,
          color: colors.text.secondary,
          "&.Mui-focused": {
            color: colors.primary.main,
          },
        },
      },
    },

    // Container
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: "24px",
          paddingRight: "24px",
          "@media (min-width: 600px)": {
            paddingLeft: "48px",
            paddingRight: "48px",
          },
        },
      },
    },

    // Divider
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.border.light,
        },
      },
    },

    // Avatar
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.fontWeight.medium,
          backgroundColor: colors.primary.surface,
          color: colors.primary.main,
        },
      },
    },

    // Badge
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.fontWeight.medium,
          fontSize: typography.fontSize.xs,
        },
      },
    },

    // Link
    MuiLink: {
      styleOverrides: {
        root: {
          fontFamily: typography.fontFamily.primary,
          color: colors.primary.main,
          textDecoration: "none",
          transition: motion.transition.fast,
          "&:hover": {
            textDecoration: "underline",
            color: colors.primary.dark,
          },
        },
      },
    },

    // List
    MuiList: {
      styleOverrides: {
        root: {
          padding: "4px",
        },
      },
    },

    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: borderRadius.sm,
          transition: motion.transition.fast,
          "&:hover": {
            backgroundColor: colors.hover,
          },
          "&.Mui-selected": {
            backgroundColor: alpha(colors.primary.main, 0.08),
            "&:hover": {
              backgroundColor: alpha(colors.primary.main, 0.12),
            },
          },
        },
      },
    },
  },
});

export default theme;
