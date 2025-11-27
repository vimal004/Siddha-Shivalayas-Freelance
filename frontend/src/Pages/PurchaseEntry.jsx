import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Divider,
  useTheme,
  alpha,
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';

const PurchaseEntry = () => {
  const theme = useTheme();

  // --- State for Invoice Header Details ---
  const [invoiceDetails, setInvoiceDetails] = useState({
    vendorName: '',
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    gstin: '',
  });

  // --- State for Line Items (Rows) ---
  const [items, setItems] = useState([
    {
      productName: '',
      batchNo: '',
      hsnCode: '',
      expiryDate: '',
      mrp: 0,
      rate: 0,
      qty: 0,
      discountPercent: 0,
      gstPercent: 5,
    },
  ]);

  // --- State for Data & UI ---
  const [existingStocks, setExistingStocks] = useState([]);
  const [totals, setTotals] = useState({
    taxableAmount: 0,
    cgst: 0,
    sgst: 0,
    roundOff: 0,
    grandTotal: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ open: false, text: '', severity: 'success' });

  // --- Load Existing Stocks on Mount ---
  useEffect(() => {
    axios.get('https://siddha-shivalayas-backend.vercel.app/stocks')
      .then(res => setExistingStocks(res.data))
      .catch(err => console.error("Failed to load stocks", err));
  }, []);

  // --- Calculate Totals whenever items change ---
  useEffect(() => {
    calculateInvoiceTotals();
  }, [items]);

  // --- Handlers ---
  const handleHeaderChange = e => {
    setInvoiceDetails({ ...invoiceDetails, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  // Handle Autocomplete Selection
  const handleProductSelect = (index, value) => {
    const newItems = [...items];
    if (typeof value === 'string') {
        // User typed a new name
        newItems[index].productName = value;
    } else if (value && value.productName) {
        // User selected existing stock
        newItems[index].productName = value.productName;
        newItems[index].hsnCode = value.hsnCode || '';
        newItems[index].gstPercent = value.gst || 5;
        newItems[index].mrp = value.price || 0; // Assuming selling price is MRP for now
    } else {
        newItems[index].productName = '';
    }
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        productName: '',
        batchNo: '',
        hsnCode: '',
        expiryDate: '',
        mrp: 0,
        rate: 0,
        qty: 0,
        discountPercent: 0,
        gstPercent: 5,
      },
    ]);
  };

  const removeItemRow = index => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  // --- Calculation Logic ---
  const calculateInvoiceTotals = () => {
    let totalTaxable = 0;
    let totalTax = 0;

    items.forEach(item => {
      const quantity = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.rate) || 0;
      const discount = parseFloat(item.discountPercent) || 0;
      const gst = parseFloat(item.gstPercent) || 0;

      const baseAmount = quantity * rate;
      const discountAmount = baseAmount * (discount / 100);
      const taxable = baseAmount - discountAmount;
      const taxAmount = taxable * (gst / 100);

      totalTaxable += taxable;
      totalTax += taxAmount;
    });

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const rawTotal = totalTaxable + totalTax;
    const roundedTotal = Math.round(rawTotal);
    const roundOff = roundedTotal - rawTotal;

    setTotals({
      taxableAmount: totalTaxable.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      roundOff: roundOff.toFixed(2),
      grandTotal: roundedTotal.toFixed(2),
    });
  };

  // --- Submit Logic ---
  const handleSubmit = async () => {
    setLoading(true);

    if (!invoiceDetails.invoiceNo || !invoiceDetails.vendorName) {
      setMessage({ open: true, text: 'Please fill Invoice No and Vendor Name', severity: 'error' });
      setLoading(false);
      return;
    }

    try {
      // 1. Save Purchase Record
      const purchasePayload = {
        ...invoiceDetails,
        items,
        totals,
      };
      await axios.post('https://siddha-shivalayas-backend.vercel.app/purchases', purchasePayload);

      // 2. Update Stocks
      const stockUpdatePromises = items.map(item => {
        // Find if stock exists by Name
        const existingStock = existingStocks.find(
            s => s.productName.toLowerCase() === item.productName.toLowerCase()
        );

        if (existingStock) {
            // UPDATE existing stock (Add Quantity)
            return axios.put(`https://siddha-shivalayas-backend.vercel.app/stocks/${existingStock.stockId}`, {
                quantity: item.qty,
                price: item.mrp > 0 ? item.mrp : existingStock.price, // Update price if provided
                updateMode: 'add'
            });
        } else {
            // CREATE new stock
            // Generate a simple ID if not provided logic (e.g., first 3 letters + random)
            const newStockId = (item.productName.substring(0, 3) + Math.floor(1000 + Math.random() * 9000)).toUpperCase();
            return axios.post('https://siddha-shivalayas-backend.vercel.app/stocks', {
                stockId: newStockId,
                productName: item.productName,
                quantity: item.qty,
                price: item.mrp || item.rate, // Selling price
                hsnCode: item.hsnCode,
                discount: 0,
                gst: item.gstPercent
            });
        }
      });

      await Promise.all(stockUpdatePromises);

      // Refresh local stocks for next entry
      const res = await axios.get('https://siddha-shivalayas-backend.vercel.app/stocks');
      setExistingStocks(res.data);

      setMessage({ open: true, text: 'Purchase Saved & Stocks Updated!', severity: 'success' });
      
      // Reset Form
      setTimeout(() => {
        setItems([{
            productName: '', batchNo: '', hsnCode: '', expiryDate: '',
            mrp: 0, rate: 0, qty: 0, discountPercent: 0, gstPercent: 5,
        }]);
        setInvoiceDetails({ ...invoiceDetails, invoiceNo: '' });
      }, 1500);

    } catch (error) {
      console.error(error);
      setMessage({ open: true, text: 'Error saving purchase', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
          Wholesale Purchase Entry
        </Typography>

        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Vendor Name"
                  name="vendorName"
                  value={invoiceDetails.vendorName}
                  onChange={handleHeaderChange}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Invoice Number"
                  name="invoiceNo"
                  value={invoiceDetails.invoiceNo}
                  onChange={handleHeaderChange}
                  fullWidth
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Invoice Date"
                  type="date"
                  name="invoiceDate"
                  value={invoiceDetails.invoiceDate}
                  onChange={handleHeaderChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <TableContainer component={Paper} sx={{ mb: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>#</TableCell>
                <TableCell sx={{ color: 'white', width: '25%' }}>Product Name</TableCell>
                <TableCell sx={{ color: 'white' }}>Batch</TableCell>
                <TableCell sx={{ color: 'white' }}>Expiry</TableCell>
                <TableCell sx={{ color: 'white' }}>HSN</TableCell>
                <TableCell sx={{ color: 'white' }}>Qty</TableCell>
                <TableCell sx={{ color: 'white' }}>Rate (₹)</TableCell>
                <TableCell sx={{ color: 'white' }}>Disc %</TableCell>
                <TableCell sx={{ color: 'white' }}>Taxable</TableCell>
                <TableCell sx={{ color: 'white' }}>GST %</TableCell>
                <TableCell sx={{ color: 'white' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, index) => {
                const base = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
                const disc = base * ((parseFloat(item.discountPercent) || 0) / 100);
                const taxable = base - disc;

                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Autocomplete
                        freeSolo
                        options={existingStocks}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.productName}
                        value={item.productName}
                        onChange={(event, newValue) => handleProductSelect(index, newValue)}
                        onInputChange={(event, newInputValue) => {
                            // Handle raw input change
                            handleItemChange(index, 'productName', newInputValue);
                        }}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                placeholder="Item Name" 
                                variant="standard"
                                fullWidth
                            />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.batchNo}
                        onChange={e => handleItemChange(index, 'batchNo', e.target.value)}
                        size="small"
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.expiryDate}
                        onChange={e => handleItemChange(index, 'expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        size="small"
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.hsnCode}
                        onChange={e => handleItemChange(index, 'hsnCode', e.target.value)}
                        size="small"
                        variant="standard"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.qty}
                        onChange={e => handleItemChange(index, 'qty', e.target.value)}
                        size="small"
                        variant="standard"
                        sx={{ width: '60px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.rate}
                        onChange={e => handleItemChange(index, 'rate', e.target.value)}
                        size="small"
                        variant="standard"
                        sx={{ width: '80px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.discountPercent}
                        onChange={e => handleItemChange(index, 'discountPercent', e.target.value)}
                        size="small"
                        variant="standard"
                        sx={{ width: '50px' }}
                      />
                    </TableCell>
                    <TableCell>{taxable.toFixed(2)}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.gstPercent}
                        onChange={e => handleItemChange(index, 'gstPercent', e.target.value)}
                        size="small"
                        variant="standard"
                        sx={{ width: '50px' }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => removeItemRow(index)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <Box sx={{ p: 2 }}>
            <Button startIcon={<AddIcon />} onClick={addItemRow} variant="outlined" size="small">
              Add Item
            </Button>
          </Box>
        </TableContainer>

        {/* Footer Summary */}
        <Grid container spacing={2} justifyContent="flex-end">
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ backgroundColor: '#f9f9f9' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Taxable Amount:</Typography>
                  <Typography variant="body1" fontWeight="bold">₹{totals.taxableAmount}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">CGST:</Typography>
                  <Typography variant="body1">₹{totals.cgst}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">SGST:</Typography>
                  <Typography variant="body1">₹{totals.sgst}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Round Off:</Typography>
                  <Typography variant="body1">₹{totals.roundOff}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Typography variant="h6" color="primary">Grand Total:</Typography>
                  <Typography variant="h6" color="primary">₹{totals.grandTotal}</Typography>
                </Box>
              </CardContent>
            </Card>

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{ mt: 2, py: 1.5, fontSize: '1.1rem' }}
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Purchase Entry'}
            </Button>
          </Grid>
        </Grid>

        <Snackbar
          open={message.open}
          autoHideDuration={4000}
          onClose={() => setMessage({ ...message, open: false })}
        >
          <Alert severity={message.severity} variant="filled">
            {message.text}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default PurchaseEntry;