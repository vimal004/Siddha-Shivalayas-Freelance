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
  Box,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AllPatients = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            background: "white",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            borderRadius: 2,
            p: 4,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: "primary.main",
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Patient Records
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
              placeholder="e.g., Surgery, Medicine A"
              sx={{
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
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
                backgroundColor: "#f9f9f9",
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
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: "16px",
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              <Table>
                <TableHead
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
                  }}
                >
                  <TableRow>
                    {[
                      "ID",
                      "Name",
                      "Phone",
                      "Address",
                      "Treatment/Medicine",
                      "Date",
                    ].map((header) => (
                      <TableCell
                        key={header}
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer, index) => (
                      <TableRow
                        key={customer.id}
                        sx={{
                          backgroundColor:
                            index % 2 === 0
                              ? "rgba(25, 118, 210, 0.05)"
                              : "white",
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.15
                            ),
                          },
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            color: theme.palette.primary.dark,
                          }}
                        >
                          <Link
                            to={`/customers/${customer.id}`}
                            style={{
                              textDecoration: "none",
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
                            ? new Date(customer.date).toLocaleDateString(
                                "en-CA"
                              )
                            : ""}
                        </TableCell>
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
    </Box>
  );
};

export default AllPatients;
