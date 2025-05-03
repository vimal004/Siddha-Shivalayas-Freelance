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
  TextField,
  useMediaQuery,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ViewStocks = () => {
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
    data: groups,
    loading,
    error,
  } = useFetchData("https://siddha-shivalayas-backend.vercel.app/stocks");

  const [searchTerm, setSearchTerm] = React.useState("");
  const filteredStocks = groups.filter((group) =>
    group.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const printnames = (e) => {
    console.log(e.target.value);
    setSearchTerm(e.target.value);
  };

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
            p: isSmallScreen ? 2 : 4,
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Typography
            variant={isSmallScreen ? "h5" : "h4"}
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
              label="Search by Product Name"
              variant="outlined"
              value={searchTerm}
              onChange={printnames}
              fullWidth
              placeholder="Medicine Name"
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
            <Box sx={{ textAlign: "center", mt: 4, color: "error.main" }}>
              Error: {error}
            </Box>
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <TableContainer
                component={Paper}
                sx={{
                  background: "white",
                  borderRadius: 3,
                  boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
                  minWidth: isSmallScreen ? "600px" : "100%", // Ensures table doesn't collapse
                }}
              >
                <Table>
                  <TableHead
                    sx={{
                      backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
                    }}
                  >
                    <TableRow>
                      {[
                        "Product ID",
                        "Product Name",
                        "Quantity",
                        "Price",
                        "Discount",
                        "GST",
                      ].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            color: "white",
                            fontWeight: "bold",
                            fontSize: isSmallScreen ? "0.875rem" : "1rem",
                            textTransform: "uppercase",
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStocks.length > 0 ? (
                      filteredStocks.map((group, index) => (
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
                          <TableCell>{group.productName}</TableCell>
                          <TableCell>{group.quantity}</TableCell>
                          <TableCell>₹{group.price.toFixed(2)}</TableCell>
                          <TableCell>{group.discount}%</TableCell>
                          <TableCell>{group.gst}%</TableCell>
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
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default ViewStocks;
