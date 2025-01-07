import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Snackbar,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Paper,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";

const BillHistory = () => {
  const [billHistory, setBillHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch bill history on component mount
  useEffect(() => {
    const fetchBillHistory = async () => {
      try {
        const response = await axios.get(
          "https://siddha-shivalayas-backend.vercel.app/bills-history"
        );
        setBillHistory(response.data);
        console.log("Bill history:", response.data[0]);
      } catch (error) {
        setErrorMessage("Error fetching bill history.");
      }
    };

    fetchBillHistory();
  }, []);

  // Handle delete bill request
  const handleDeleteBill = async (billId) => {
    try {
      await axios.delete(
        `https://siddha-shivalayas-backend.vercel.app/bills/${billId}`
      );
      setBillHistory(billHistory.filter((bill) => bill._id !== billId));
      setSuccessMessage("Bill deleted successfully.");
    } catch (error) {
      console.error("Error deleting the bill:", error);
      setErrorMessage("Error deleting the bill.");
    }
  };

  // Handle generate bill request (to generate and download the bill)
  const handleGenerateBill = async (billId) => {
    const billToSend = billHistory.find((bill) => bill._id === billId);
    console.log("Bill to send:", billToSend);
    if (!billToSend) {
      setErrorMessage("Bill not found.");
      return;
    }

    try {
      console.log("Bill to send:", billToSend);
      // Fill missing fields with "0"
      const response = await axios.post(
        "https://siddha-shivalayas-backend.vercel.app/generate-bill",
        {
          id: "",
          name: "",
          phone: "",
          address: "",
          treatmentOrMedicine: "",
          date: "",
          items: [],
          discount: 0,
          totalAmount: 0, // New field for total amount
        },
        { responseType: "blob" }
      );

      // Trigger download of the generated bill
      const file = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const fileURL = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = fileURL;
      a.download = `generated-bill-${billId}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setSuccessMessage("Bill generated and downloaded successfully.");
    } catch (error) {
      console.error("Error generating the bill:", error);
      setErrorMessage("Error generating the bill.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Box
        sx={{
          backgroundColor: "#ffffff",
          boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.1)",
          padding: 5,
          borderRadius: "12px",
          border: "1px solid #e0e0e0",
        }}
      >
        <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 600 }}>
          Bill History
        </Typography>

        {/* Display bills as cards */}
        <Grid container spacing={4}>
          {billHistory.map((bill) => (
            <Grid item xs={12} sm={6} md={4} key={bill._id}>
              <Card
                sx={{
                  borderRadius: "12px",
                  boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: "0px 12px 30px rgba(0, 0, 0, 0.15)",
                    transform: "translateY(-10px)",
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <strong>Bill ID:</strong> {bill._id}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Patient Name:</strong> {bill.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Bill Date:</strong> {bill.date}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Treatment / Medicine:</strong>{" "}
                    {bill.treatmentOrMedicine}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Subtotal:</strong> ₹{bill.subtotal}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Total GST:</strong> ₹{bill.totalGST}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Discount:</strong> ₹{bill.discount}
                  </Typography>
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    <strong>Total Amount:</strong> ₹{bill.total}
                  </Typography>

                  <Paper
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: "8px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Table size="small" sx={{ tableLayout: "fixed" }}>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                          >
                            Item
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                          >
                            Quantity
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                          >
                            Price
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                          >
                            Total
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bill.items &&
                          bill.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell sx={{ fontSize: "0.875rem" }}>
                                {item.description}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontSize: "0.875rem" }}
                              >
                                {item.quantity}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontSize: "0.875rem" }}
                              >
                                ₹{item.price}
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontSize: "0.875rem" }}
                              >
                                ₹{(item.quantity * item.price).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </CardContent>
                <CardActions sx={{ justifyContent: "space-between", p: 2 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteBill(bill._id)}
                    sx={{
                      borderRadius: "8px",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#ff3333",
                        color: "#fff",
                      },
                    }}
                  >
                    Delete Bill
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleGenerateBill(bill._id)}
                    sx={{
                      borderRadius: "8px",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#0069d9",
                      },
                    }}
                  >
                    Generate Bill
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Error and Success Notifications */}
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={3000}
        onClose={() => setErrorMessage("")}
      >
        <MuiAlert elevation={6} variant="filled" severity="error">
          {errorMessage}
        </MuiAlert>
      </Snackbar>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage("")}
      >
        <MuiAlert elevation={6} variant="filled" severity="success">
          {successMessage}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};

export default BillHistory;
