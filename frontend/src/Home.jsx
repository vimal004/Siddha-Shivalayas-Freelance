import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  CircularProgress,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import axios from "axios";
import {
  AccountCircle as AccountCircleIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon,
  LocalShipping as LocalShippingIcon,
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import designTokens from "./designTokens";

const { colors, typography, borderRadius, elevation, motion, spacing } =
  designTokens;

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: null,
    productsInStock: null,
    billsGenerated: null,
    pendingOrders: null,
    loading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      fetchStats();
    }
  }, [navigate]);

  const fetchStats = async () => {
    try {
      // Fetch patients count
      const patientsRes = await axios.get(
        "https://siddha-shivalayas-backend.vercel.app/patients"
      );
      const patientsCount = patientsRes.data.length;

      // Fetch stocks count
      const stocksRes = await axios.get(
        "https://siddha-shivalayas-backend.vercel.app/stocks"
      );
      const productsCount = stocksRes.data.length;

      // Fetch bills count
      const billsRes = await axios.get(
        "https://siddha-shivalayas-backend.vercel.app/bills-history"
      );
      const billsCount = billsRes.data.length;

      // Calculate total stock quantity (as a proxy for pending/available)
      const totalStockQty = stocksRes.data.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );

      setStats({
        totalPatients: patientsCount,
        productsInStock: productsCount,
        billsGenerated: billsCount,
        pendingOrders: totalStockQty,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  };

  const menuItems = [
    {
      title: "View Patients",
      description: "Access and review patient information",
      icon: <AccountCircleIcon />,
      path: "/allpatients",
      color: colors.primary.main,
      bgColor: colors.primary.surface,
    },
    {
      title: "Manage Patients",
      description: "Add, edit, or update patient records",
      icon: <PeopleIcon />,
      path: "/managepatients",
      color: colors.secondary.main,
      bgColor: colors.secondary.surface,
    },
    {
      title: "Manage Stocks",
      description: "Update and manage inventory",
      icon: <InventoryIcon />,
      path: "/managestocks",
      color: "#ea8600",
      bgColor: "#fff4e5",
    },
    {
      title: "Generate Bill",
      description: "Create new bills for patients",
      icon: <ReceiptIcon />,
      path: "/generatebill",
      color: "#d93025",
      bgColor: "#fce8e6",
    },
    {
      title: "View Stocks",
      description: "Check current inventory levels",
      icon: <InventoryIcon />,
      path: "/viewstocks",
      color: "#9334e6",
      bgColor: "#f3e8fd",
    },
    {
      title: "Bill History",
      description: "Access previous billing records",
      icon: <HistoryIcon />,
      path: "/billhistory",
      color: "#5f6368",
      bgColor: "#f1f3f4",
    },
    {
      title: "Purchase Entry",
      description: "Enter stock from vendors",
      icon: <LocalShippingIcon />,
      path: "/purchaseentry",
      color: "#1a73e8",
      bgColor: "#e8f0fe",
    },
    {
      title: "Purchase History",
      description: "View all vendor purchase records",
      icon: <HistoryIcon />,
      path: "/purchasehistory",
      color: "#137333",
      bgColor: "#e6f4ea",
    },
  ];

  const statItems = [
    {
      label: "Total Patients",
      value: stats.totalPatients,
      icon: <PeopleIcon />,
      color: colors.primary.main,
      bgColor: colors.primary.surface,
    },
    {
      label: "Products in Stock",
      value: stats.productsInStock,
      icon: <InventoryIcon />,
      color: "#9334e6",
      bgColor: "#f3e8fd",
    },
    {
      label: "Bills Generated",
      value: stats.billsGenerated,
      icon: <ReceiptIcon />,
      color: "#137333",
      bgColor: "#e6f4ea",
    },
    {
      label: "Total Stock Qty",
      value: stats.pendingOrders,
      icon: <TrendingUpIcon />,
      color: "#ea8600",
      bgColor: "#fff4e5",
    },
  ];

  return (
    <PageWrapper>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <HeroSection>
          <HeroTitle>Welcome to your dashboard</HeroTitle>
          <HeroSubtitle>
            Manage your patients, inventory, and billing all in one place.
          </HeroSubtitle>
        </HeroSection>

        {/* Quick Stats Section */}
        <StatsSection>
          <Typography
            variant="h6"
            sx={{
              fontFamily: typography.fontFamily.primary,
              fontWeight: typography.fontWeight.medium,
              color: colors.text.primary,
              mb: 3,
            }}
          >
            Quick Overview
          </Typography>
          <Grid container spacing={2}>
            {statItems.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <StatCard style={{ animationDelay: `${index * 50}ms` }}>
                  <StatIconWrapper style={{ backgroundColor: stat.bgColor }}>
                    {React.cloneElement(stat.icon, {
                      sx: { fontSize: 22, color: stat.color },
                    })}
                  </StatIconWrapper>
                  <StatValue>
                    {stats.loading ? (
                      <CircularProgress size={20} sx={{ color: stat.color }} />
                    ) : (
                      stat.value ?? "0"
                    )}
                  </StatValue>
                  <StatLabel>{stat.label}</StatLabel>
                </StatCard>
              </Grid>
            ))}
          </Grid>
        </StatsSection>

        {/* Menu Grid */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {menuItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.path}>
              <Link to={item.path} style={{ textDecoration: "none" }}>
                <MenuCard
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <CardIconWrapper style={{ backgroundColor: item.bgColor }}>
                    {React.cloneElement(item.icon, {
                      sx: { fontSize: 28, color: item.color },
                    })}
                  </CardIconWrapper>

                  <CardContent>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardContent>

                  <CardArrow>
                    <ArrowForwardIcon
                      sx={{ fontSize: 18, color: colors.text.tertiary }}
                    />
                  </CardArrow>
                </MenuCard>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </PageWrapper>
  );
};

// Styled Components

const PageWrapper = styled(Box)({
  minHeight: "100vh",
  backgroundColor: colors.surface.container,
  paddingTop: spacing[12],
  paddingBottom: spacing[16],
});

const HeroSection = styled(Box)({
  textAlign: "center",
  marginBottom: spacing[8],
  animation: "fadeInUp 0.6s cubic-bezier(0, 0, 0, 1)",
});

const HeroTitle = styled(Typography)({
  fontFamily: typography.fontFamily.display,
  fontSize: "clamp(2rem, 5vw, 3rem)",
  fontWeight: typography.fontWeight.regular,
  color: colors.text.primary,
  marginBottom: spacing[3],
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
});

const HeroSubtitle = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.regular,
  color: colors.text.secondary,
  maxWidth: "500px",
  margin: "0 auto",
  lineHeight: 1.6,
});

const StatsSection = styled(Box)({
  marginBottom: spacing[8],
  padding: spacing[6],
  backgroundColor: colors.surface.background,
  borderRadius: borderRadius.cardLg,
  boxShadow: elevation.level1,
  animation: "fadeInUp 0.5s cubic-bezier(0, 0, 0, 1) 0.1s backwards",
});

const StatCard = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: spacing[5],
  backgroundColor: colors.surface.container,
  borderRadius: borderRadius.lg,
  textAlign: "center",
  transition: motion.transition.fast,
  animation: "fadeInUp 0.5s cubic-bezier(0, 0, 0, 1) backwards",
  "&:hover": {
    backgroundColor: colors.surface.containerHigh,
    transform: "translateY(-2px)",
  },
});

const StatIconWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "44px",
  height: "44px",
  borderRadius: borderRadius.md,
  marginBottom: spacing[3],
});

const StatValue = styled(Typography)({
  fontFamily: typography.fontFamily.display,
  fontSize: typography.fontSize["2xl"],
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
  marginBottom: spacing[1],
  minHeight: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const StatLabel = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.regular,
  color: colors.text.secondary,
});

const MenuCard = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  padding: spacing.cardPaddingLg,
  backgroundColor: colors.surface.background,
  borderRadius: borderRadius.card,
  boxShadow: elevation.card,
  transition: motion.transition.normal,
  cursor: "pointer",
  height: "100%",
  position: "relative",
  animation: "fadeInUp 0.5s cubic-bezier(0, 0, 0, 1) backwards",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: elevation.cardHover,
    "& .card-arrow": {
      opacity: 1,
      transform: "translateX(0)",
    },
  },
});

const CardIconWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "56px",
  height: "56px",
  borderRadius: borderRadius.lg,
  marginBottom: spacing[4],
  transition: motion.transition.fast,
});

const CardContent = styled(Box)({
  flex: 1,
});

const CardTitle = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
  marginBottom: spacing[1],
  lineHeight: 1.4,
});

const CardDescription = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.regular,
  color: colors.text.secondary,
  lineHeight: 1.5,
});

const CardArrow = styled(Box)({
  position: "absolute",
  top: spacing[6],
  right: spacing[6],
  opacity: 0,
  transform: "translateX(-8px)",
  transition: motion.transition.fast,
});

CardArrow.defaultProps = {
  className: "card-arrow",
};

export default Home;
