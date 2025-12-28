import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
  Menu,
  MenuItem,
  Container,
  Chip,
} from "@mui/material";
import {
  Person as PersonIcon,
  PeopleAlt as PeopleAltIcon,
  Inventory2 as InventoryIcon,
  ReceiptLong as ReceiptIcon,
  History as HistoryIcon,
  LogoutOutlined as LogoutIcon,
  Menu as MenuIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  AdminPanelSettings as AdminIcon,
  PersonOutline as StaffIcon,
} from "@mui/icons-material";
import logo from "./img/Logo.png";
import { styled, alpha } from "@mui/material/styles";
import designTokens from "./designTokens";
import { logout, getUser, isAdmin } from "./services/authService";

const { colors, typography, borderRadius, elevation, motion, spacing } =
  designTokens;

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const isLoginPage = location.pathname === "/";
  const isHomePage = location.pathname === "/home";
  const user = getUser();

  const [menuAnchorEl, setMenuAnchorEl] = React.useState(null);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const navigationLinks = [
    { to: "/allpatients", icon: <PeopleAltIcon />, label: "Patients" },
    { to: "/managepatients", icon: <PersonIcon />, label: "Manage" },
    { to: "/managestocks", icon: <InventoryIcon />, label: "Stocks" },
    { to: "/viewstocks", icon: <InventoryIcon />, label: "Inventory" },
    { to: "/billhistory", icon: <HistoryIcon />, label: "Bills" },
  ];

  // Don't show header on login page
  if (isLoginPage) {
    return null;
  }

  return (
    <StyledAppBar position="sticky">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, gap: 2 }}>
          {/* Logo and Brand */}
          <LogoContainer>
            <Link
              to="/home"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Logo src={logo} alt="Shivalayas Siddha" />
              <BrandName variant="h6">Shivalayas Siddha</BrandName>
            </Link>
          </LogoContainer>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Navigation - Pill-style tabs */}
          {!isHomePage && !isMobile && (
            <NavContainer>
              {navigationLinks.map((link, index) => (
                <NavPill
                  key={index}
                  component={Link}
                  to={link.to}
                  isActive={location.pathname === link.to}
                >
                  {link.label}
                </NavPill>
              ))}
            </NavContainer>
          )}

          {/* Role Badge and Logout Button */}
          {isHomePage && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {user && (
                <Chip
                  icon={
                    user.role === "admin" ? (
                      <AdminIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <StaffIcon sx={{ fontSize: 16 }} />
                    )
                  }
                  label={user.role === "admin" ? "Admin" : "Staff"}
                  size="small"
                  sx={{
                    backgroundColor:
                      user.role === "admin"
                        ? alpha(colors.primary.main, 0.15)
                        : alpha("#6b7280", 0.15),
                    color:
                      user.role === "admin" ? colors.primary.main : "#6b7280",
                    fontFamily: typography.fontFamily.primary,
                    fontWeight: typography.fontWeight.medium,
                    fontSize: typography.fontSize.xs,
                    textTransform: "capitalize",
                    "& .MuiChip-icon": {
                      color:
                        user.role === "admin" ? colors.primary.main : "#6b7280",
                    },
                  }}
                />
              )}
              <LogoutButton
                onClick={handleLogout}
                variant="outlined"
                startIcon={<LogoutIcon />}
              >
                {!isMobile && "Sign out"}
              </LogoutButton>
            </Box>
          )}

          {/* Mobile Menu Button */}
          {!isHomePage && isMobile && (
            <>
              <MobileMenuButton
                aria-label="navigation menu"
                onClick={handleMenuClick}
              >
                <MenuIcon />
              </MobileMenuButton>
              <StyledMenu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                {navigationLinks.map((link, index) => (
                  <StyledMenuItem
                    key={index}
                    component={Link}
                    to={link.to}
                    onClick={handleMenuClose}
                    isActive={location.pathname === link.to}
                  >
                    <MenuItemIcon>{link.icon}</MenuItemIcon>
                    {link.label}
                  </StyledMenuItem>
                ))}
              </StyledMenu>
            </>
          )}
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

// Styled Components using Design Tokens

const StyledAppBar = styled(AppBar)({
  backgroundColor: colors.surface.background,
  backdropFilter: "blur(12px)",
  borderBottom: `1px solid ${colors.border.light}`,
  boxShadow: "none",
});

const LogoContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
});

const Logo = styled("img")({
  height: "40px",
  width: "40px",
  objectFit: "contain",
  borderRadius: borderRadius.md,
  transition: motion.transition.fast,
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const BrandName = styled(Typography)({
  fontFamily: typography.fontFamily.display,
  fontWeight: typography.fontWeight.medium,
  fontSize: typography.fontSize.xl,
  color: colors.text.primary,
  letterSpacing: "-0.01em",
});

const NavContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "4px",
  padding: "4px",
  backgroundColor: colors.surface.container,
  borderRadius: borderRadius.full,
});

const NavPill = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isActive",
})(({ isActive }) => ({
  padding: "8px 20px",
  borderRadius: borderRadius.full,
  fontFamily: typography.fontFamily.primary,
  fontWeight: typography.fontWeight.medium,
  fontSize: typography.fontSize.sm,
  textTransform: "none",
  color: isActive ? colors.text.primary : colors.text.secondary,
  backgroundColor: isActive ? colors.surface.background : "transparent",
  boxShadow: isActive ? elevation.level1 : "none",
  transition: motion.transition.fast,
  minWidth: "auto",
  "&:hover": {
    backgroundColor: isActive ? colors.surface.background : colors.hover,
    color: colors.text.primary,
  },
}));

const LogoutButton = styled(Button)({
  padding: "8px 20px",
  borderRadius: borderRadius.full,
  fontFamily: typography.fontFamily.primary,
  fontWeight: typography.fontWeight.medium,
  fontSize: typography.fontSize.sm,
  textTransform: "none",
  color: colors.text.secondary,
  borderColor: colors.border.medium,
  transition: motion.transition.fast,
  "&:hover": {
    borderColor: colors.border.dark,
    backgroundColor: colors.hover,
  },
});

const MobileMenuButton = styled(IconButton)({
  color: colors.text.primary,
  padding: "10px",
  borderRadius: borderRadius.full,
  transition: motion.transition.fast,
  "&:hover": {
    backgroundColor: colors.hover,
  },
});

const StyledMenu = styled(Menu)({
  "& .MuiPaper-root": {
    marginTop: "8px",
    borderRadius: borderRadius.menu,
    boxShadow: elevation.dropdown,
    border: `1px solid ${colors.border.light}`,
    minWidth: "200px",
    padding: "4px",
  },
});

const StyledMenuItem = styled(MenuItem, {
  shouldForwardProp: (prop) => prop !== "isActive",
})(({ isActive }) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 16px",
  borderRadius: borderRadius.sm,
  margin: "2px 0",
  fontFamily: typography.fontFamily.primary,
  fontWeight: isActive
    ? typography.fontWeight.medium
    : typography.fontWeight.regular,
  fontSize: typography.fontSize.sm,
  color: isActive ? colors.primary.main : colors.text.primary,
  backgroundColor: isActive ? alpha(colors.primary.main, 0.08) : "transparent",
  transition: motion.transition.fast,
  "&:hover": {
    backgroundColor: isActive ? alpha(colors.primary.main, 0.12) : colors.hover,
  },
}));

const MenuItemIcon = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: colors.text.secondary,
  "& svg": {
    fontSize: "20px",
  },
});

export default Header;
