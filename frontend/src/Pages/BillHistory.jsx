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
} from "@mui/material";

import MuiAlert from "@mui/material/Alert";

const BillHistory = () => {
  const theme = useTheme();
  const [billHistory, setBillHistory] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 
  const [successMessage, setSuccessMessage] = useState("");

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
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteAll}
            sx={{ mb: 3 }}
          >
            Delete All Bills
          </Button>

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
              {filteredBills.map((bill) => (
                <TableRow key={bill.id}>
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
                    >
                      Download Bill
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
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
      </Container>
    </Box>
  );
};

export default BillHistory;
