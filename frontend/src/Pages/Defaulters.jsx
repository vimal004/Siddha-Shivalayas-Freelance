import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  CircularProgress,
  Container,
  TextField,
  Typography,
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

const Defaulters = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ name: "", group: "" });

  useEffect(() => {
    const fetchDefaulters = async () => {
      try {
        const defaultersResponse = await axios.get(
          "https://vcf-backend.vercel.app/group/defaulters"
        );
        const defaulterIds = defaultersResponse.data.map(
          (defaulter) => defaulter.id
        );

        const customersResponse = await axios.get(
          "https://vcf-backend.vercel.app/customers"
        );
        const defaulterCustomers = customersResponse.data.data.filter(
          (customer) => defaulterIds.includes(customer.id)
        );

        setDefaulters(defaulterCustomers);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDefaulters();
  }, []);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredDefaulters = defaulters.filter((defaulter) => {
    return (
      (filter.group === "" || defaulter.group === parseInt(filter.group, 10)) &&
      (filter.name === "" ||
        defaulter.name.toLowerCase().includes(filter.name.toLowerCase()))
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
          <strong>Defaulter Details</strong>
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
            label="Search Defaulter By Name"
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
                  <TableCell>Defaulter Name</TableCell>
                  <TableCell>Phone Number</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Group Number</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDefaulters.length > 0 ? (
                  filteredDefaulters.map((defaulter) => (
                    <TableRow key={defaulter.id}>
                      <TableCell>
                        <Link
                          to={`/customers/${defaulter.id}`}
                          style={{ color: "#3f51b5", textDecoration: "none" }}
                        >
                          {defaulter.id}
                        </Link>
                      </TableCell>
                      <TableCell>{defaulter.name}</TableCell>
                      <TableCell>{defaulter.phno}</TableCell>
                      <TableCell>{defaulter.address}</TableCell>
                      <TableCell>{defaulter.group}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} style={{ textAlign: "center" }}>
                      No Defaulter Record Found
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

export default Defaulters;
