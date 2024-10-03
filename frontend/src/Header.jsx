import React from "react";
import { Link, useLocation } from "react-router-dom";
import img3 from "./img/img4.avif";
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
  Group as GroupIcon,
  ReportProblem as ReportProblemIcon,
} from "@mui/icons-material";
import logo from "./img/logo.png";
import { styled } from "@mui/system";

const Header = () => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.up("sm"));
  const location = useLocation();
  const isHome = location.pathname === "/" || location.pathname == "/home"; // Check if current route is "/"
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <StyledAppBar position="static" color="default" elevation={2}>
      <Toolbar>
        <Box
          display="flex"
          alignItems="center"
          justifyContent={isHome ? "center" : "space-between"} // Center when on home
          width="100%"
          flexDirection={isSm ? "row" : "column"}
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
                variant="h6"
                color="inherit"
                sx={{ ml: 2, fontWeight: 600 }}
              >
                Customer Database Management
              </Typography>
            </Link>
          </HeaderLogoAndTitle>
          {location.pathname == "/home" && (
            <Button onClick={handleLogout} variant="outlined" sx={{ ml: 2 }}>
              Logout
            </Button>
          )}

          {/* Hide buttons when on the home page */}
          {!isHome && (
            <Navigation isSm={isSm}>
              <AnimatedButton
                component={Link}
                to="/allcustomers"
                startIcon={<PeopleAltIcon />}
              >
                View Customers
              </AnimatedButton>
              <AnimatedButton
                component={Link}
                to="/managecustomers"
                startIcon={<PersonIcon />}
              >
                Manage Customers
              </AnimatedButton>
              <AnimatedButton
                component={Link}
                to="/managegroups"
                startIcon={<GroupIcon />}
              >
                Manage Groups
              </AnimatedButton>
              <AnimatedButton
                component={Link}
                to="/viewgroups"
                startIcon={<GroupIcon />}
              >
                View Groups
              </AnimatedButton>
              <AnimatedButton
                component={Link}
                to="/defaulters"
                startIcon={<ReportProblemIcon />}
              >
                View Defaulters
              </AnimatedButton>
            </Navigation>
          )}
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundImage: `url(${img3})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
  borderRadius: "8px",
}));

const HeaderLogoAndTitle = styled(Box)(({ isSm, isHome }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: isHome ? "center" : isSm ? "flex-start" : "center", // Center on home page
}));

const Logo = styled("img")({
  height: "40px",
});

const Navigation = styled("nav")(({ isSm }) => ({
  display: isSm ? "flex" : "block",
  alignItems: "center",
  textAlign: isSm ? "initial" : "center",
}));

const AnimatedButton = styled(Button)({
  color: "#1976d2",
  fontWeight: 500,
  padding: "8px 16px",
  borderRadius: "8px",
  textTransform: "none",
  margin: "0 8px",
  "&:hover": {
    backgroundColor: "#f0f0f0",
  },
});

export default Header;
