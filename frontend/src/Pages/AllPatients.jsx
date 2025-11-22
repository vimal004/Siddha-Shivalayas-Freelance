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

  // --- MODIFICATION: Simplified state to only handle name filter ---
  const [nameFilter, setNameFilter] = useState('');

  const handleFilterChange = e => {
    setNameFilter(e.target.value);
  };

  // --- MODIFICATION: Simplified filtering logic ---
  const filteredCustomers = customers.filter(customer => {
    const name = customer.name || ''; // fallback for safety
    return name.toLowerCase().includes(nameFilter.toLowerCase());
  });

  // 💡 HELPER FUNCTION FOR DATE FORMATTING (dd-mm-yyyy)
  const formatDateToIndian = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // Use 'en-IN' locale for dd/mm/yyyy format and replace / with -
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-'); 
  };

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

          {/* --- MODIFICATION: Removed the extra search box --- */}
          <Box sx={{ mb: 3 }}>
            <TextField
              name="name"
              value={nameFilter}
              onChange={handleFilterChange}
              label="Search by Patient Name"
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
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="patient table">
                <TableHead
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
                  }}
                >
                  {/* --- MODIFICATION: Removed 'Treatment/Medicine' and adjusted widths --- */}
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '10%' }}>
                      ID
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '25%' }}>
                      Name
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '20%' }}>
                      Phone
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '30%' }}>
                      Address
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', width: '15%' }}>
                      Date
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(customer => (
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
                        {/* --- MODIFICATION: Removed 'Treatment/Medicine' cell --- */}
                        <TableCell>
                          {
                            // ⭐ MODIFIED DATE FORMATTING LOGIC
                            formatDateToIndian(customer.date)
                          }
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      {/* --- MODIFICATION: Adjusted colSpan --- */}
                      <TableCell colSpan={5} sx={{ textAlign: 'center' }}>
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