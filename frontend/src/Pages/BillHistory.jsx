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
  const [formData, setFormData] = useState({
    id: "001",
    name: "vimal",
    phone: "7603832537",
    address: "lmao",
    treatmentOrMedicine: "nah",
    date: "",
    items: [],
    discount: 0,
    totalAmount: 0, // New field for total amount
  });

  useEffect(() => {
    const fetchBillHistory = async () => {
      try {
        const response = await axios.get(
          "https://siddha-shivalayas-backend.vercel.app/bills-history"
        );
        setBillHistory(response.data);
        console.log(response.data[0]);
      } catch (error) {
        console.error("Error fetching bill history:", error);
      }
    };
    fetchBillHistory();
  }, []);

  const del = () => {
    axios
      .delete("https://siddha-shivalayas-backend.vercel.app/bills")
      .then((res) => {
        console.log(res);
      })
      .catch((er) => {
        console.log(er);
      });
  };

  const handleDownloadBill = async () => {
    try {
      // Step 1: Generate the bill
      const response = await axios.post(
        "https://siddha-shivalayas-backend.vercel.app/generate-bill",
        formData,
        { responseType: "blob" }
      );
      // Step 2: Download the bill
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `generated-bill-${formData.id}.docx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Success message
      setSuccessMessage("Bill retrieved successfully");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Error processing the request");
    }
  };

  return (
    <Container>
      <Typography variant="h4">Bill History</Typography>
      <button onClick={del}>delete</button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bill ID</TableCell>
            <TableCell>Patient Name</TableCell>
            <TableCell>Bill Date</TableCell>
            <TableCell>Download Links</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {billHistory.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell>{bill._id}</TableCell>
              <TableCell>{bill.name}</TableCell>
              <TableCell>{new Date(bill.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  href={bill.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDownloadBill}
                >
                  Download Bill
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
};

export default BillHistory;
