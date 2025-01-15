import React from "react";
import useFetchData from "./FetchData";
import { useEffect } from "react";
import {
  CircularProgress,
  Container,
  Typography,
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ViewStocks = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const {
    data: groups,
    loading,
    error,
  } = useFetchData("https://siddha-shivalayas-backend.vercel.app/stocks");

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
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Stocks
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", mt: 4, color: "error.main" }}>
              Error: {error}
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell>Product ID</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Discount</TableCell>
                    <TableCell>GST</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groups.length > 0 ? (
                    groups.map((group) => (
                      <TableRow key={group.stockId}>
                        <TableCell>{group.stockId}</TableCell>
                        <TableCell>{group.productName}</TableCell>
                        <TableCell>{group.quantity}</TableCell>
                        <TableCell>{group.price}</TableCell>
                        <TableCell>{group.discount}</TableCell>
                        <TableCell>{group.gst}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ textAlign: "center" }}>
                        No Product Stock Record Found
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

export default ViewStocks;
