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
    try {
      const response = await axios.post(
        "https://siddha-shivalayas-backend.vercel.app/generate-bill",
        { id: billId } // Assuming you are passing just the bill ID for generation
      );

      // Trigger download
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
    <Container maxWidth="lg" style={{ marginTop: "50px" }}>
      <div
        style={{
          background: "#ffffff",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
          padding: "40px",
          borderRadius: "12px",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          <strong>Bill History</strong>
        </Typography>

        {/* Display bills as cards */}
        <Grid container spacing={3}>
          {billHistory.map((bill) => (
            <Grid item xs={12} sm={6} md={4} key={bill._id}>
              <Card
                style={{
                  padding: "16px",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
                }}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <strong>Bill ID:</strong> {bill._id}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Patient Name:</strong> {bill.name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Bill Date:</strong> {bill.date}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Treatment / Medicine:</strong>{" "}
                    {bill.treatmentOrMedicine}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Subtotal:</strong> {bill.subtotal}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Total GST:</strong> {bill.totalGST}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Discount:</strong> {bill.discount}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    <strong>Total Amount:</strong> {bill.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Address:</strong> {bill.address || "N/A"}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Contact:</strong> {bill.contact || "N/A"}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDeleteBill(bill._id)}
                    style={{ marginRight: "10px" }}
                  >
                    Delete Bill
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleGenerateBill(bill._id)}
                  >
                    Generate Bill
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>

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
