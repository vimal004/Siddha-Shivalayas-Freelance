import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Grid,
  Box,
  useTheme,
  alpha,
  Snackbar,
  TableContainer,
  Paper,
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";

const BillHistory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [billHistory, setBillHistory] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previewedBillId, setPreviewedBillId] = useState(null);

  const togglePreview = (billId) => {
    setPreviewedBillId(previewedBillId === billId ? null : billId);
  };

  const totalCost = (bill) => {
    let total = bill.items.reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0);
    total -= (bill.discount / 100) * total;
    return `₹${total.toFixed(2)}`;
  };

  const BillPreview = ({ bill }) => {
    const subtotal = bill.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );
    const discountAmount = (subtotal * (bill.discount || 0)) / 100;
    const total = subtotal - discountAmount;

    return (
      <Box sx={{ overflowX: "auto", mt: 2 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "1rem",
          }}
        >
          <thead>
            <tr>
              {["Product", "HSN", "GST (%)", "Qty", "Price", "Total"].map(
                (header) => (
                  <th
                    key={header}
                    style={{ border: "1px solid #ccc", padding: "8px" }}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => {
              const quantity = parseInt(item.quantity || 0, 10);
              const price = parseFloat(item.price || 0);
              const total = quantity * price;
              return (
                <tr key={index}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.description}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.HSN}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.GST}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {item.quantity}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    ₹{price.toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    ₹{total.toFixed(2)}
                  </td>
                </tr>
              );
            })}
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "right",
                }}
              >
                Subtotal
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                ₹{subtotal.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "right",
                }}
              >
                Discount ({bill.discount || 0}%)
              </td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                -₹{discountAmount.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Total
              </td>
              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  fontWeight: "bold",
                }}
              >
                ₹{total.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </Box>
    );
  };

  useEffect(() => {
    const fetchBillHistory = async () => {
      try {
        const response = await axios.get(
          "https://siddha-shivalayas-backend.vercel.app/bills-history"
        );
        const updatedBills = response.data.map((bill) => ({
          ...bill,
          downloadLink: `https://siddha-shivalayas-backend.vercel.app/bills/download/${bill._id}`,
        }));
        setBillHistory(updatedBills);
        setFilteredBills(updatedBills);
      } catch (error) {
        console.error("Error fetching bill history:", error);
      }
    };
    fetchBillHistory();
  }, []);

  useEffect(() => {
    const filtered = billHistory.filter((bill) => {
      const matchesName = bill.name
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const matchesDate = searchDate
        ? new Date(bill.createdAt).toLocaleDateString("en-CA") === searchDate
        : true;
      return matchesName && matchesDate;
    });
    setFilteredBills(filtered);
  }, [searchName, searchDate, billHistory]);

  const handleDeleteAll = async () => {
    try {
      await axios.delete("https://siddha-shivalayas-backend.vercel.app/bills");
      setBillHistory([]);
      setFilteredBills([]);
      setSuccessMessage("All bills deleted successfully.");
    } catch (error) {
      console.error("Error deleting bills:", error);
      setErrorMessage("Error deleting bills. Please try again later.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.1
        )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
        py: { xs: 4, sm: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            background: "white",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            borderRadius: 2,
            p: { xs: 2, sm: 3, md: 4 },
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
            },
          }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            align="center"
            sx={{
              mb: { xs: 2, sm: 3, md: 4 },
              fontWeight: 700,
              color: "primary.main",
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Bill History
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Search by Patient Name"
                variant="outlined"
                fullWidth
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Search by Bill Date"
                variant="outlined"
                fullWidth
                type="date"
                InputLabelProps={{ shrink: true }}
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                size={isMobile ? "small" : "medium"}
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAll}
            sx={{ mb: 3, width: { xs: "100%", sm: "auto" } }}
          >
            Delete All Bills
          </Button>

          <TableContainer component={Paper} sx={{ mb: 2, overflow: "auto" }}>
            <Table sx={{ minWidth: isTablet ? 500 : 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Bill ID</TableCell>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Bill Date</TableCell>
                  <TableCell>Download Link</TableCell>
                  <TableCell>Total Cost</TableCell>
                  <TableCell>Preview</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBills.map((bill) => (
                  <React.Fragment key={bill._id}>
                    <TableRow>
                      <TableCell>{bill._id}</TableCell>
                      <TableCell>{bill.name}</TableCell>
                      <TableCell>
                        {new Date(bill.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          href={bill.downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          size={isTablet ? "small" : "medium"}
                        >
                          Download
                        </Button>
                      </TableCell>
                      <TableCell>{totalCost(bill)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size={isTablet ? "small" : "medium"}
                          onClick={() => togglePreview(bill._id)}
                        >
                          {previewedBillId === bill._id ? "Hide" : "Preview"}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {previewedBillId === bill._id && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <BillPreview bill={bill} />
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Snackbar
            open={Boolean(errorMessage)}
            autoHideDuration={3000}
            onClose={() => setErrorMessage("")}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              severity="error"
              onClose={() => setErrorMessage("")}
            >
              {errorMessage}
            </MuiAlert>
          </Snackbar>

          <Snackbar
            open={Boolean(successMessage)}
            autoHideDuration={3000}
            onClose={() => setSuccessMessage("")}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              severity="success"
              onClose={() => setSuccessMessage("")}
            >
              {successMessage}
            </MuiAlert>
          </Snackbar>
        </Box>
      </Container>
    </Box>
  );
};

export default BillHistory;
