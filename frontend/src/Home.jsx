import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Grid, Typography, useTheme, alpha } from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const menuItems = [
    {
      title: 'View Patients Details',
      icon: <AccountCircleIcon />,
      path: '/allpatients',
      description: 'Access and review patient information',
      color: '#2196F3', // Blue
    },
    {
      title: 'Manage Patient Records',
      icon: <PeopleIcon />,
      path: '/managepatients',
      description: 'Add, edit, or update patient records',
      color: '#4CAF50', // Green
    },
    {
      title: 'Manage Product Stocks',
      icon: <InventoryIcon />,
      path: '/managestocks',
      description: 'Update and manage inventory',
      color: '#FF9800', // Orange
    },
    {
      title: 'Generate Bill',
      icon: <ReceiptIcon />,
      path: '/generatebill',
      description: 'Create new bills for patients',
      color: '#E91E63', // Pink
    },
    {
      title: 'View Product Stocks',
      icon: <InventoryIcon />,
      path: '/viewstocks',
      description: 'Check current inventory levels',
      color: '#9C27B0', // Purple
    },
    {
      title: 'View Bill History',
      icon: <HistoryIcon />,
      path: '/billhistory',
      description: 'Access previous billing records',
      color: '#795548', // Brown
    },
    {
      title: 'Purchase Entry',
      icon: <InventoryIcon />, // Or a different icon like LocalShipping
      path: '/purchaseentry',
      description: 'Enter stock from vendors',
      color: '#607d8b', // Blue Grey
    },
    {
      title: 'Purchase Order History', // Add this block
      icon: <HistoryIcon />,
      path: '/purchasehistory',
      description: 'View all vendor purchase records',
      color: '#795549',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 100%)`,
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          align="center"
          sx={{
            mb: 6,
            fontWeight: 700,
            color: 'primary.main',
            fontFamily: '"Inter", sans-serif',
          }}
        >
          Welcome to Dashboard
        </Typography>

        <Grid container spacing={3}>
          {menuItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.path}>
              <Link to={item.path} style={{ textDecoration: 'none' }}>
                <Box
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderRadius: 2,
                    backgroundColor: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: '50%',
                      backgroundColor: alpha(item.color, 0.1),
                    }}
                  >
                    {React.cloneElement(item.icon, {
                      sx: { fontSize: 40, color: item.color },
                    })}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 1,
                      fontWeight: 600,
                      color: 'text.primary',
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mb: 2,
                    }}
                  >
                    {item.description}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 'auto',
                      bgcolor: item.color,
                      textTransform: 'none',
                      px: 4,
                      '&:hover': {
                        bgcolor: alpha(item.color, 0.9),
                      },
                    }}
                  >
                    Access
                  </Button>
                </Box>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;
