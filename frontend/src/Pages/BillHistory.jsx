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

  useEffect(() => {
    const fetchBillHistory = async () => {
      try {
        const response = await axios.get(
          "https://siddha-shivalayas-backend.vercel.app/bills-history"
        );
        setBillHistory(response.data);
      } catch (error) {
        console.error("Error fetching bill history:", error);
      }
    };
    fetchBillHistory();
  }, []);

  return (
    <Container>
      <Typography variant="h4">Bill History</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bill ID</TableCell>
            <TableCell>Patient Name</TableCell>
            <TableCell>Bill Date</TableCell>
            <TableCell>Generated At</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {billHistory.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell>{bill.id}</TableCell>
              <TableCell>{bill.name}</TableCell>
              <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(bill.createdAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  href={bill.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
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
