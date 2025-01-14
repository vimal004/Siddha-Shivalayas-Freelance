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
} from "@mui/material";

const BillHistory = () => {
  const [billHistory, setBillHistory] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  useEffect(() => {
    const fetchBillHistory = async () => {
      try {
        const response = await axios.get(
          "https://siddha-shivalayas-backend.vercel.app/bills-history"
        );
        setBillHistory(response.data);
        setFilteredBills(response.data); // Initialize filtered bills
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
      console.log("All bills deleted successfully");
    } catch (error) {
      console.error("Error deleting bills:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom margin={3}>
        Bill History
      </Typography>

      <Grid container spacing={2} marginBottom={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search by Patient Name"
            variant="outlined"
            fullWidth
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search by Bill Date (YYYY-MM-DD)"
            variant="outlined"
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
          />
        </Grid>
      </Grid>

      <Button
        variant="contained"
        color="secondary"
        onClick={handleDeleteAll}
        style={{ marginBottom: "20px" }}
      >
        Delete All Bills
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Bill ID</TableCell>
            <TableCell>Patient Name</TableCell>
            <TableCell>Bill Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredBills.map((bill) => (
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
