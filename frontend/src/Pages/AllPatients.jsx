import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useFetchData from './FetchData';
import {
  TextField,
  CircularProgress,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  useTheme,
  alpha,
  useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AllPatients = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const {
    data: customers,
    loading,
    error,
  } = useFetchData('https://siddha-shivalayas-backend.vercel.app/patients');

  const [filter, setFilter] = useState({ name: '', treatmentOrMedicine: '' });

  const handleFilterChange = e => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredCustomers = customers.filter(customer => {
    const name = customer.name || ''; // fallback for safety
    const treatment = customer.treatmentOrMedicine || ''; // fallback for safety
    return (
      (filter.treatmentOrMedicine === '' ||
        treatment.toLowerCase().includes(filter.treatmentOrMedicine.toLowerCase())) &&
      (filter.name === '' || name.toLowerCase().includes(filter.name.toLowerCase()))
    );
  });

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
        <Box
          sx={{
            background: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            borderRadius: 2,
            p: isSmallScreen ? 2 : 4,
          }}
        >
          <Typography
            variant={isSmallScreen ? 'h5' : 'h4'}
            align="center"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: 'primary.main',
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Patient Records
          </Typography>

          <Box
            sx={{
              display: 'flex',
              flexDirection: isSmallScreen ? 'column' : 'row',
              justifyContent: 'space-between',
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              name="treatmentOrMedicine"
              value={filter.treatmentOrMedicine}
              onChange={handleFilterChange}
              label="Filter by Treatment/Medicine"
              variant="outlined"
              fullWidth
            />
            <TextField
              name="name"
              value={filter.name}
              onChange={handleFilterChange}
              label="Search by Name"
              variant="outlined"
              fullWidth
            />
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography variant="body1" sx={{ textAlign: 'center', mt: 4, color: 'red' }}>
              Error: {error}
            </Typography>
          ) : (
            // --- START: MODIFICATION ---
            // The TableContainer component will handle the scrolling and presentation.
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
                  }}
                >
                  <TableRow>
                    {/* Applied specific widths to each header cell for proper alignment */}
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '10%' }}>
                      ID
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '20%' }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>
                      Phone
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '25%' }}>
                      Address
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>
                      Treatment/Medicine
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>
                      Date
                    </TableCell>
                  </TableRow>
                </TableHead>
                {/* --- END: MODIFICATION --- */}
                <TableBody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer, index) => (
                      <TableRow
                        key={customer.id}
                        sx={{
                          '&:nth-of-type(odd)': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          },
                          '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.15) },
                        }}
                      >
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          <Link
                            to={`/customers/${customer.id}`}
                            style={{
                              textDecoration: 'none',
                              color: theme.palette.primary.main,
                            }}
                          >
                            {customer.id}
                          </Link>
                        </TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.address}</TableCell>
                        <TableCell>{customer.treatmentOrMedicine}</TableCell>
                        <TableCell>
                          {customer.date
                            ? new Date(customer.date).toLocaleDateString('en-CA')
                            : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
                        No Patient Record Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default AllPatients;
