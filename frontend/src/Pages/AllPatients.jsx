import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useFetchData from "./FetchData";
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
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AllPatients = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const {
    data: customers,
    loading,
    error,
  } = useFetchData("https://siddha-shivalayas-backend.vercel.app/patients");

  const [filter, setFilter] = useState({ name: "", treatmentOrMedicine: "" });

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredCustomers = customers.filter((customer) => {
    return (
      (filter.treatmentOrMedicine === "" ||
        customer.treatmentOrMedicine
          .toLowerCase()
          .includes(filter.treatmentOrMedicine.toLowerCase())) &&
      (filter.name === "" ||
        customer.name.toLowerCase().includes(filter.name.toLowerCase()))
    );
  });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 6,
        mb: 4,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          background: "#ffffff",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
          padding: "24px",
          borderRadius: "8px",
          width: "100%",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{
            fontWeight: "bold",
            fontFamily: '"Poppins", sans-serif',
            color: "#1976d2",
          }}
        >
          Patient Details
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            justifyContent: "space-between",
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
            placeholder="e.g., Medicine A, Treatment B"
            sx={{
              borderRadius: "8px",
            }}
          />
          <TextField
            name="name"
            value={filter.name}
            onChange={handleFilterChange}
            label="Search by Name"
            variant="outlined"
            fullWidth
            placeholder="e.g., John Doe"
            sx={{
              borderRadius: "8px",
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              mt: 4,
              color: "red",
            }}
          >
            Error: {error}
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "#f5f5f5",
                }}
              >
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Treatment/Medicine</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      sx={{
                        "&:nth-of-type(odd)": {
                          backgroundColor: "#f9f9f9",
                        },
                        "&:hover": {
                          backgroundColor: "#f1f1f1",
                        },
                      }}
                    >
                      <TableCell>
                        <Link
                          to={`/customers/${customer.id}`}
                          style={{
                            color: "#1976d2",
                            textDecoration: "none",
                          }}
                        >
                          {customer.id}
                        </Link>
                      </TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.address}</TableCell>
                      <TableCell>{customer.treatmentOrMedicine}</TableCell>
                      <TableCell>{customer.date}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: "center" }}>
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
  );
};

export default AllPatients;
