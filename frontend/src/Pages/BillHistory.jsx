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
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewedBillId, setPreviewedBillId] = useState(null);
  const [editingBill, setEditingBill] = useState(null);

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
        
      return matchesName && matchesDate;
    });
    setFilteredBills(filtered);
  }, [searchName, searchDate, billHistory]);

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

    const handleItemChange = (index, field, value) => {
      const updatedItems = [...items];
      updatedItems[index][field] =
        field === 'quantity' || field === 'price' || field === 'GST' ? parseFloat(value) : value;
      setItems(updatedItems);
    };

    const handleAddItem = () => {
      setItems([...items, { description: '', HSN: '', GST: 0, quantity: 1, price: 0 }]);
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
            <Grid container spacing={2} key={index} sx={{ mt: 1 }}>
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
              <Grid item xs={1}>
                <Button color="error" onClick={() => handleRemoveItem(index)}>
                  X
                </Button>
              </Grid>
            </Grid>
          ))}
          <Button onClick={handleAddItem} sx={{ mt: 2 }}>
            Add Item
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
    const itemSubtotal = bill.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    
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

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search by Patient Name"
            fullWidth
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Search by Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={searchDate}
            onChange={e => setSearchDate(e.target.value)}
          />
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
              const itemSubtotal = bill.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
              
              let feeValue = 0;
              if (bill.type === 'Consulting') {
                  feeValue = bill.consultingFee || 0;
              } else if (bill.type === 'Treatment') { // ADDED
                  feeValue = bill.treatmentFee || 0;
              }

              const subtotal = itemSubtotal + feeValue;
              const total = subtotal - (subtotal * (bill.discount || 0)) / 100;

              return (
                <TableRow key={index}>
                  <TableCell>{'B' + (index + 1)}</TableCell>
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