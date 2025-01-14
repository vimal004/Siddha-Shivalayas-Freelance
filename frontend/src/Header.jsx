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
} from "@mui/material";
import {
  Person as PersonIcon,
  PeopleAlt as PeopleAltIcon,
  Inventory2 as InventoryIcon,
  ReceiptLong as ReceiptIcon,
  History as HistoryIcon,
  LogoutOutlined as LogoutIcon,
} from "@mui/icons-material";
import logo from "./img/Logo.svg";
import { styled } from "@mui/system";

const Header = () => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname === "/home";

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <StyledAppBar position="static" elevation={0}>
      <Toolbar sx={{ minHeight: { xs: 80 } }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent={isHome ? "center" : "space-between"}
          width="100%"
          flexDirection={isSm ? "row" : "column"}
          gap={2}
        >
          <HeaderLogoAndTitle isSm={isSm} isHome={isHome}>
            <Link
              to="/home"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Logo src={logo} alt="Logo" />
              <Typography
                variant="h5"
                sx={{
                  ml: 2,
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 600,
                  background: "linear-gradient(45deg, #1976d2, #2196f3)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.5px",
                }}
              >
                Customer Database Management
              </Typography>
            </Link>
          </HeaderLogoAndTitle>

          {location.pathname === "/home" && (
            <LogoutButton
              onClick={handleLogout}
              variant="contained"
              startIcon={<LogoutIcon />}
            >
              Logout
            </LogoutButton>
          )}

          {!isHome && (
            <Navigation isSm={isSm}>
              <NavButton
                component={Link}
                to="/allpatients"
                startIcon={<PeopleAltIcon />}
              >
                View Patients
              </NavButton>
              <NavButton
                component={Link}
                to="/managepatients"
                startIcon={<PersonIcon />}
              >
                Manage Patients
              </NavButton>
              <NavButton
                component={Link}
                to="/managestocks"
                startIcon={<InventoryIcon />}
              >
                Manage Stocks
              </NavButton>
              <NavButton
                component={Link}
                to="/viewstocks"
                startIcon={<InventoryIcon />}
              >
                View Stocks
              </NavButton>
              <NavButton
                component={Link}
                to="/billhistory"
                startIcon={<HistoryIcon />}
              >
                Bill History
              </NavButton>
            </Navigation>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  padding: "4px 0",
}));

const HeaderLogoAndTitle = styled(Box)(({ isSm, isHome }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: isHome ? "center" : isSm ? "flex-start" : "center",
  transition: "all 0.3s ease",
}));

const Logo = styled("img")({
  height: "48px",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
});

const Navigation = styled("nav")(({ isSm }) => ({
  display: isSm ? "flex" : "block",
  alignItems: "center",
  textAlign: isSm ? "initial" : "center",
  gap: "8px",
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: "#2c3e50",
  fontWeight: 500,
  padding: "10px 20px",
  borderRadius: "12px",
  textTransform: "none",
  fontSize: "0.95rem",
  fontFamily: '"Poppins", sans-serif',
  transition: "all 0.2s ease",
  backgroundColor: "transparent",
  border: "1px solid transparent",
  "&:hover": {
    backgroundColor: "rgba(25, 118, 210, 0.08)",
    transform: "translateY(-2px)",
    border: "1px solid rgba(25, 118, 210, 0.1)",
  },
  "& .MuiButton-startIcon": {
    color: "#1976d2",
  },
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #1976d2, #2196f3)",
  color: "white",
  padding: "10px 24px",
  borderRadius: "12px",
  textTransform: "none",
  fontSize: "0.95rem",
  fontWeight: 600,
  fontFamily: '"Poppins", sans-serif',
  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
  transition: "all 0.2s ease",
  border: "none",
  "&:hover": {
    background: "linear-gradient(45deg, #1565c0, #1976d2)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 16px rgba(25, 118, 210, 0.2)",
  },
}));

export default Header;
