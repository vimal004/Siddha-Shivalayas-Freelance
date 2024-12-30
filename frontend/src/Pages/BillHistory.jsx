import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Snackbar, Container, Typography, Grid } from "@mui/material";
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

  // Handle download bill request
  const handleDownloadBill = async (billId) => {
    try {
      // Fetch the bill based on the billId
      const response = await axios.get(
        `https://siddha-shivalayas-backend.vercel.app/bills/${billId}`,
        {
          responseType: "blob", // Make sure the response is a blob
        }
      );

      // Verify the content type of the response
      const contentType = response.headers["content-type"];

      // Adjust file extension based on content type
      let fileExtension = ".docx"; // Default to .docx
      if (contentType === "application/pdf") {
        fileExtension = ".pdf";
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Adjust file name dynamically based on the file type
      link.setAttribute("download", `generated-bill-${billId}${fileExtension}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage("Bill downloaded successfully.");
    } catch (error) {
      console.error("Error downloading the bill:", error);
      setErrorMessage("Error downloading the bill.");
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

        {/* Display bills */}
        <Grid container spacing={3}>
          {billHistory.map((bill) => (
            <Grid item xs={12} sm={6} md={4} key={bill._id}>
              <div
                style={{
                  padding: "16px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <Typography variant="h6">{`Bill ID: ${bill._id}`}</Typography>
                <Typography variant="body1">
                  Patient Name: {bill.name}
                </Typography>
                <Typography variant="body2">Date: {bill.date}</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleDownloadBill(bill._id)}
                  style={{ marginTop: "10px" }}
                >
                  Download Bill
                </Button>
              </div>
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
