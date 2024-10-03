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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const AllCustomers = () => {
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
  } = useFetchData("https://vcf-backend.vercel.app/customers");

  const [filter, setFilter] = useState({ name: "", group: "" });

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredCustomers = customers.filter((customer) => {
    return (
      (filter.group === "" || customer.group === parseInt(filter.group, 10)) &&
      (filter.name === "" ||
        customer.name.toLowerCase().includes(filter.name.toLowerCase()))
    );
  });

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Container
      maxWidth="lg"
      style={{ marginTop: "50px", display: "flex", justifyContent: "center" }}
    >
      <div
        style={{
          background: "#ffffff",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
          padding: "24px",
          borderRadius: "8px",
          width: "100%",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          <strong>Customer Details</strong>
        </Typography>
        <div
          style={{
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <TextField
            name="group"
            value={filter.group}
            onChange={handleFilterChange}
            label="Filter By Group"
            variant="outlined"
            fullWidth
            style={{
              borderRadius: "8px",
              marginRight: isSmallScreen ? "0" : "8px",
              marginBottom: isSmallScreen ? "16px" : "0",
            }}
          />
          <TextField
            name="name"
            value={filter.name}
            onChange={handleFilterChange}
            label="Search Customer By Name"
            variant="outlined"
            fullWidth
            style={{ borderRadius: "8px" }}
          />
        </div>
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <CircularProgress />
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", marginTop: "20px", color: "red" }}>
            Error: {error}
          </div>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead style={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Group Number</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Link
                          to={`/customers/${customer.id}`}
                          style={{ color: "#3f51b5", textDecoration: "none" }}
                        >
                          {customer.id}
                        </Link>
                      </TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.phno}</TableCell>
                      <TableCell>{customer.address}</TableCell>
                      <TableCell>{customer.group}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} style={{ textAlign: "center" }}>
                      No Customer Record Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </Container>
  );
};

export default AllCustomers;
