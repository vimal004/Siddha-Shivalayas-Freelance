import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Snackbar,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const BillHistory = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [billToDelete, setBillToDelete] = useState(null);

  const [billHistory, setBillHistory] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchPaymentMethod, setSearchPaymentMethod] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewedBillId, setPreviewedBillId] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyStats, setMonthlyStats] = useState({
    product: 0,
    consulting: 0,
    treatment: 0,
    total: 0,
    upi: 0,
    cash: 0,
  });

  const togglePreview = billId => {
    setPreviewedBillId(previewedBillId === billId ? null : billId);
  };

  const fetchBillHistory = async () => {
    try {
      const response = await axios.get(
        'https://siddha-shivalayas-backend.vercel.app/bills-history'
      );
      const updatedBills = response.data.map(bill => ({
        ...bill,
        // The download link from the backend will now serve a PDF
        downloadLink: `https://siddha-shivalayas-backend.vercel.app/bills/download/${bill._id}`,
      }));
      setBillHistory(updatedBills);
      setFilteredBills(updatedBills);
    } catch (error) {
      console.error('Error fetching bill history:', error);
    }
  };

  useEffect(() => {
    fetchBillHistory();
  }, []);

  useEffect(() => {
    const filtered = billHistory.filter(bill => {
      const matchesName = bill.name.toLowerCase().includes(searchName.toLowerCase());
      // Filter by comparing date string in 'YYYY-MM-DD' format (from the input type="date")
      const matchesDate = searchDate
        ? (bill.date && bill.date.startsWith(searchDate))
        : true;
      
      // Filter by selected month and year
      const billDate = new Date(bill.date);
      const billMonth = billDate.getMonth() + 1;
      const billYear = billDate.getFullYear();
      const matchesMonth = billMonth === selectedMonth && billYear === selectedYear;
      
      // Filter by payment method
      const matchesPaymentMethod = searchPaymentMethod
        ? bill.typeOfPayment === searchPaymentMethod
        : true;
        
      return matchesName && matchesDate && matchesMonth && matchesPaymentMethod;
    });
    setFilteredBills(filtered);
  }, [searchName, searchDate, billHistory, selectedMonth, selectedYear, searchPaymentMethod]);

  // Calculate monthly statistics
  useEffect(() => {
    const stats = {
      product: 0,
      consulting: 0,
      treatment: 0,
      total: 0,
      upi: 0,
      cash: 0,
    };

    filteredBills.forEach(bill => {
      const itemSubtotal = bill.items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
      
      let feeValue = 0;
      if (bill.type === 'Consulting') {
        feeValue = bill.consultingFee || 0;
      } else if (bill.type === 'Treatment') {
        feeValue = bill.treatmentFee || 0;
      }

      const subtotal = itemSubtotal + feeValue;
      const total = subtotal - (subtotal * (bill.discount || 0)) / 100;

      // Bill type breakdown
      if (bill.type === 'Product' || bill.type === '') {
        stats.product += total;
      } else if (bill.type === 'Consulting') {
        stats.consulting += total;
      } else if (bill.type === 'Treatment') {
        stats.treatment += total;
      }

      // Payment method breakdown
      if (bill.typeOfPayment === 'UPI') {
        stats.upi += total;
      } else if (bill.typeOfPayment === 'Cash') {
        stats.cash += total;
      }

      stats.total += total;
    });

    setMonthlyStats(stats);
  }, [filteredBills]);

  const deleteBill = billId => async () => {
    try {
      console.log('Deleting bill with ID:', billId);
      await axios.delete(`https://siddha-shivalayas-backend.vercel.app/bills/${billId}`);
      fetchBillHistory();
      setSuccessMessage('Bill deleted successfully.');
    } catch (error) {
      console.error('Error deleting bill:', error);
      setErrorMessage('Error deleting bill. Please try again later.');
    }
  };

  const EditBillModal = ({ bill, open, onClose }) => {
    const [items, setItems] = useState(bill.items || []);
    const [discount, setDiscount] = useState(bill.discount || 0);
    const isProductBill = bill.type === 'Product' || bill.type === '';

    const handleItemChange = (index, field, value) => {
      const updatedItems = [...items];
      updatedItems[index][field] = value;
        
      if (isProductBill) {
        if (field === 'quantity' || field === 'price' || field === 'GST') {
            updatedItems[index][field] = parseFloat(value) || 0;
        }
      } else {
        // For non-product bills, preserve only the description
        if (field === 'description') {
            updatedItems[index]['price'] = 0;
            updatedItems[index]['quantity'] = 0;
            updatedItems[index]['HSN'] = '';
            updatedItems[index]['GST'] = 0;
        }
      }
      setItems(updatedItems);
    };

    const handleAddItem = () => {
      // Use defaults suitable for both types, where non-product fields are zeroed.
      setItems([...items, { description: '', HSN: '', GST: 0, quantity: isProductBill ? 1 : 0, price: isProductBill ? 0 : 0 }]);
    };

    const handleRemoveItem = index => {
      setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
      try {
        await axios.put(`https://siddha-shivalayas-backend.vercel.app/bills/${bill._id}`, {
          items,
          discount,
        });
        onClose();
        fetchBillHistory();
        setSuccessMessage('Bill updated successfully.');
      } catch (err) {
        console.error('Failed to update bill', err);
        setErrorMessage('Failed to update bill');
      }
    };

    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Edit Bill</DialogTitle>
        <DialogContent>
          {items.map((item, index) => (
            <Grid container spacing={2} key={index} sx={{ mt: 1 }} alignItems="center">
              {isProductBill ? (
                <>
                  <Grid item xs={3}>
                    <TextField
                      label="Description"
                      value={item.description}
                      onChange={e => handleItemChange(index, 'description', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="HSN"
                      value={item.HSN}
                      onChange={e => handleItemChange(index, 'HSN', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="GST"
                      type="number"
                      value={item.GST}
                      onChange={e => handleItemChange(index, 'GST', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="Qty"
                      type="number"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      label="Price"
                      type="number"
                      value={item.price}
                      onChange={e => handleItemChange(index, 'price', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </>
              ) : (
                <Grid item xs={11}>
                  <TextField
                    label="Comment/Description"
                    multiline
                    rows={2}
                    value={item.description}
                    onChange={e => handleItemChange(index, 'description', e.target.value)}
                    fullWidth
                  />
                </Grid>
              )}
              
              <Grid item xs={isProductBill ? 1 : 1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button color="error" onClick={() => handleRemoveItem(index)}>
                  X
                </Button>
              </Grid>
            </Grid>
          ))}
          <Button onClick={handleAddItem} sx={{ mt: 2 }}>
            Add {isProductBill ? 'Item' : 'Comment'}
          </Button>
          <TextField
            label="Discount (%)"
            type="number"
            value={discount}
            onChange={e => setDiscount(parseFloat(e.target.value))}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  };


  const BillPreview = ({ bill }) => {
    const itemSubtotal = bill.items.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    
    let feeValue = 0; // MODIFIED
    let feeLabel = ''; // ADDED
    
    if (bill.type === 'Consulting') {
        feeValue = bill.consultingFee || 0;
        feeLabel = 'Consulting Fee';
    } else if (bill.type === 'Treatment') { // ADDED
        feeValue = bill.treatmentFee || 0;
        feeLabel = 'Treatment Fee';
    }

    const subtotal = itemSubtotal + feeValue;
    const discountAmount = (subtotal * (bill.discount || 0)) / 100;
    const total = subtotal - discountAmount;
    
    const isProductBill = bill.type === 'Product' || bill.type === '';

    return (
      <Box sx={{ overflowX: 'auto', mt: 2 }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '1rem',
          }}
        >
          <thead>
            <tr>
              {['Product', 'HSN', 'GST (%)', 'Qty', 'Price', 'Total'].map(header => (
                <th key={header} style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => {
              const quantity = parseInt(item.quantity || 0, 10);
              const price = parseFloat(item.price || 0);
              const itemTotal = quantity * price;

              if (isProductBill) {
                  return (
                    <tr key={index}>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.description}</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.HSN}</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.GST}</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.quantity}</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.price}</td>
                      <td style={{ border: '1px solid #ccc', padding: '8px' }}>{itemTotal.toFixed(2)}</td>
                    </tr>
                  );
              } else if (item.description) {
                  // MODIFICATION: Show comments as a single row spanning all columns
                  return (
                      <tr key={index}>
                          <td colSpan={6} style={{ border: '1px solid #ccc', padding: '8px' }}>
                              <span style={{ fontWeight: 'bold' }}>Comment/Description:</span> {item.description}
                          </td>
                      </tr>
                  );
              }
              return null;
            })}
            {/* MODIFIED: Combine Consulting/Treatment Fee row */}
            {(bill.type === 'Consulting' || bill.type === 'Treatment') && feeValue > 0 && (
              <tr>
                <td colSpan={5} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                  {feeLabel}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>
                  ₹{feeValue.toFixed(2)}
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={5} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>
                Subtotal (Before Discount)
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>₹{subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colSpan={5} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>
                Discount ({bill.discount || 0}%)
              </td >
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                -₹{discountAmount.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan={5} style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold', textAlign: 'right' }}>
                Total
              </td >
              <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>₹{total.toFixed(2)}</td>
            </tr>
            {/* Payment Type Preview Row */}
            <tr>
              <td colSpan={5} style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'right' }}>
                Payment Type
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{bill.typeOfPayment || 'N/A'}</td>
            </tr>
          </tbody>
        </table>
      </Box>
    );
  };

  return (
    <Container>
      <Typography variant="h4" align="center" sx={{ mb: 4 }}>
        Bill History
      </Typography>

      {/* Month and Year Selector */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Month</InputLabel>
            <Select
              value={selectedMonth}
              label="Month"
              onChange={e => setSelectedMonth(e.target.value)}
            >
              <MenuItem value={1}>January</MenuItem>
              <MenuItem value={2}>February</MenuItem>
              <MenuItem value={3}>March</MenuItem>
              <MenuItem value={4}>April</MenuItem>
              <MenuItem value={5}>May</MenuItem>
              <MenuItem value={6}>June</MenuItem>
              <MenuItem value={7}>July</MenuItem>
              <MenuItem value={8}>August</MenuItem>
              <MenuItem value={9}>September</MenuItem>
              <MenuItem value={10}>October</MenuItem>
              <MenuItem value={11}>November</MenuItem>
              <MenuItem value={12}>December</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedYear}
              label="Year"
              onChange={e => setSelectedYear(e.target.value)}
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Monthly Statistics Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Monthly Statistics - {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Typography>
          <Divider sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                  Product Bills
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ₹{monthlyStats.product.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                  Consulting Bills
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ₹{monthlyStats.consulting.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                  Treatment Bills
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ₹{monthlyStats.treatment.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, border: '2px solid rgba(255,255,255,0.3)' }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, fontWeight: 600 }}>
                  Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ₹{monthlyStats.total.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Method Statistics Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            Payment Method Breakdown - {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Typography>
          <Divider sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                  UPI Payments
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ₹{monthlyStats.upi.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                  Cash Payments
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ₹{monthlyStats.cash.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2, border: '2px solid rgba(255,255,255,0.3)' }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, fontWeight: 600 }}>
                  Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  ₹{monthlyStats.total.toFixed(2)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Search Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Search by Patient Name"
            fullWidth
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Search by Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={searchDate}
            onChange={e => setSearchDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={searchPaymentMethod}
              label="Payment Method"
              onChange={e => setSearchPaymentMethod(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Bill ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Payment</TableCell> 
              <TableCell>Edit</TableCell>
              <TableCell>Delete</TableCell>
              <TableCell>Download</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBills.map((bill, index) => {
              // Calculate totals for display
              const itemSubtotal = bill.items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
              
              let feeValue = 0;
              if (bill.type === 'Consulting') {
                  feeValue = bill.consultingFee || 0;
              } else if (bill.type === 'Treatment') { // ADDED
                  feeValue = bill.treatmentFee || 0;
              }

              const subtotal = itemSubtotal + feeValue;
              const total = subtotal - (subtotal * (bill.discount || 0)) / 100;
              const billNumber = index + 1;
                const paddedNumber = billNumber.toString().padStart(3, '0');
                const displayId = `B${paddedNumber}`;

              return (
                <TableRow key={index}>
                  <TableCell>{displayId}</TableCell>
                  <TableCell>{bill.name}</TableCell>
                  <TableCell>{bill.type || ''}</TableCell>
                  <TableCell>
                    {/* Indian date format dd/mm/yyyy */}
                    {new Date(bill.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    ₹{total.toFixed(2)} 
                  </TableCell>
                  <TableCell>{bill.typeOfPayment || 'N/A'}</TableCell> 
                  <TableCell>
                    <Button onClick={() => setEditingBill(bill)}>Edit</Button>
                  </TableCell>
                  <TableCell>
                    <Button color="error" onClick={() => setBillToDelete(bill)}>
                      Delete
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      href={bill.downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {previewedBillId && (
        <BillPreview bill={billHistory.find(bill => bill._id === previewedBillId)} />
      )}

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
      >
        <MuiAlert elevation={6} variant="filled" severity="success">
          {successMessage}
        </MuiAlert>
      </Snackbar>

      <Snackbar open={!!errorMessage} autoHideDuration={3000} onClose={() => setErrorMessage('')}>
        <MuiAlert elevation={6} variant="filled" severity="error">
          {errorMessage}
        </MuiAlert>
      </Snackbar>

      <Dialog open={!!billToDelete} onClose={() => setBillToDelete(null)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the bill for <strong>{billToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBillToDelete(null)}>Cancel</Button>
          <Button
            color="error"
            onClick={async () => {
              await deleteBill(billToDelete._id)();
              setBillToDelete(null);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {editingBill && (
        <EditBillModal
          bill={editingBill}
          open={!!editingBill}
          onClose={() => setEditingBill(null)}
        />
      )}
    </Container>
  );
};

export default BillHistory;