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
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Product Stocks
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
            <TableContainer
              component={Paper}
              sx={{
                background: "white",
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Table>
                <TableHead
                  sx={{
                    backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
                  }}
                >
                  <TableRow>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Product ID
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Product Name
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Quantity
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Price
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Discount
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        textTransform: "uppercase",
                      }}
                    >
                      GST
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groups.length > 0 ? (
                    groups.map((group, index) => (
                      <TableRow
                        key={group.stockId}
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
                          {group.stockId}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                          }}
                        >
                          {group.productName}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {group.quantity}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                          }}
                        >
                          ₹{group.price.toFixed(2)}
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {group.discount}%
                        </TableCell>
                        <TableCell
                          sx={{
                            color: theme.palette.text.primary,
                          }}
                        >
                          {group.gst}%
                        </TableCell>
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
