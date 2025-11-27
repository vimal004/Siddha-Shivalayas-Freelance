import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Container, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, IconButton, Collapse, Chip
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Delete as DeleteIcon } from '@mui/icons-material';

const Row = ({ row, onDelete }) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">{row.vendorName}</TableCell>
        <TableCell>{row.invoiceNo}</TableCell>
        <TableCell>{new Date(row.invoiceDate).toLocaleDateString('en-IN')}</TableCell>
        <TableCell align="right">₹{row.totals?.grandTotal}</TableCell>
        <TableCell align="center">
            <IconButton color="error" onClick={() => onDelete(row._id)}>
                <DeleteIcon />
            </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div" size="small">
                Items Details
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Batch</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Rate</TableCell>
                    <TableCell align="right">Total (Taxable)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">{item.productName}</TableCell>
                      <TableCell>{item.batchNo || 'N/A'}</TableCell>
                      <TableCell align="right">{item.qty}</TableCell>
                      <TableCell align="right">₹{item.rate}</TableCell>
                      <TableCell align="right">₹{((item.qty * item.rate) - ((item.qty * item.rate) * (item.discountPercent/100))).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get('https://siddha-shivalayas-backend.vercel.app/purchases');
      setPurchases(response.data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
      if(window.confirm("Are you sure? Note: This will NOT revert the stock quantities automatically.")) {
          try {
              await axios.delete(`https://siddha-shivalayas-backend.vercel.app/purchases/${id}`);
              fetchPurchases();
          } catch(err) {
              console.error(err);
          }
      }
  }

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', py: 4, bgcolor: '#f5f5f5' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Purchase History Tracker
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
            <Table aria-label="collapsible table">
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell />
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vendor Name</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Invoice No</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
                  <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchases.length > 0 ? (
                    purchases.map((row) => (
                    <Row key={row._id} row={row} onDelete={handleDelete} />
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} align="center">No purchase records found.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Box>
  );
};

export default PurchaseHistory;