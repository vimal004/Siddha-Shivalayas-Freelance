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
          borderRadius: "16px",
          width: "100%",
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
                          backgroundColor: "rgba(25, 118, 210, 0.15)",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          color: theme.palette.primary.main,
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
                          ? new Date(customer.date).toLocaleDateString("en-CA")
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
  );
};

export default AllPatients;
