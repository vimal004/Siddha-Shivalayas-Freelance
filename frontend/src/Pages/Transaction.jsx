import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Snackbar,
  Grid,
  Typography,
  Container,
  Box,
  CircularProgress,
  useTheme,
  alpha,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Paper,
  TableHead,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableRow,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { Autocomplete } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete'; 
import { use } from 'react';

const Transaction = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    phone: '',
    address: '',
    date: '',
    items: [],
    discount: 0,
    totalAmount: 0,
    type: '', // Bill Type: Consulting, Treatment or Product
    typeOfPayment: '', 
    consultingFee: 0, 
    treatmentFee: 0, // ADDED
  });

  const [filteredBills, setFilteredBills] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [billHistory, setBillHistory] = useState([]);
  const [previewedBillId, setPreviewedBillId] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);

  const togglePreview = billId => {
    setPreviewedBillId(previewedBillId === billId ? null : billId);
  };

  const urlId = window.location.pathname.split('/')[2];
  const isExistingPatientRoute = location.pathname.startsWith('/customers/');

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    axios
      .get('https://siddha-shivalayas-backend.vercel.app/stocks')
      .then(response => {
        setStocks(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isExistingPatientRoute) {
      axios
        .get(`https://siddha-shivalayas-backend.vercel.app/patients/${urlId}`)
        .then(response => {
          setFormData(prev => ({ 
            ...prev, 
            ...response.data,
            date: response.data.date ? response.data.date.split('T')[0] : new Date().toISOString().split('T')[0],
          }));
          fetchBillHistory(response.data.id);
        })
        .catch(error => console.error(error));
    } else {
        setFormData({ 
            id: '', 
            name: '',
            phone: '',
            address: '',
            date: new Date().toISOString().split('T')[0],
            items: [],
            discount: 0,
            totalAmount: 0,
            type: '', 
            typeOfPayment: '', 
            consultingFee: 0,
            treatmentFee: 0, // ADDED
        });
        setFilteredBills([]);
    }
  }, [location.pathname]);
  
  const fetchBillHistory = async (patientId = urlId) => {
    try {
      const response = await axios.get(
        'https://siddha-shivalayas-backend.vercel.app/bills-history'
      );
      const updatedBills = response.data.map(bill => ({
        ...bill,
        downloadLink: `https://siddha-shivalayas-backend.vercel.app/bills/download/${bill._id}`,
      }));
      
      const filtered = isExistingPatientRoute && patientId
        ? updatedBills.filter(bill => bill.id === patientId) 
        : [];
        
      setBillHistory(filtered);
      setFilteredBills(filtered);
    } catch (error) {
      console.error('Error fetching bill history:', error);
    }
  };

  const handleItemSelection = (index, selectedStock) => {
    // Only allow item selection via Autocomplete for Product type
    if (formData.type !== 'Product' && formData.type !== '') return;
    
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      description: selectedStock.productName,
      price: selectedStock.price,
      GST: selectedStock.gst,
      HSN: selectedStock.hsnCode,
      quantity: updatedItems[index].quantity || 1, 
    };
    setFormData({ ...formData, items: updatedItems });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    
    const isProductType = formData.type === 'Product' || formData.type === '';

    // MODIFICATION: For non-product types, only the description matters. 
    // Other fields must be zeroed out for accurate calculations and bill generation.
    if (!isProductType) {
        if (field === 'description') {
            updatedItems[index]['price'] = 0;
            updatedItems[index]['quantity'] = 0;
            updatedItems[index]['HSN'] = '';
            updatedItems[index]['GST'] = 0;
        } else {
            // Prevent changing other fields for non-product types in case they are manually added
            updatedItems[index][field] = field === 'HSN' ? '' : 0;
        }
    }

    if (field === 'quantity') {
      const selectedStock = stocks.find(
        stock => stock.productName === updatedItems[index].description
      );

      if (formData.type === 'Product' && selectedStock && parseInt(value, 10) > selectedStock.quantity) {
        setErrorMessage(
          `Insufficient stock for ${selectedStock.productName}. Available: ${selectedStock.quantity}`
        );
      } else {
        setErrorMessage('');
      }
    }

    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    // Initialize with safe defaults for both types
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', HSN: '', GST: 0, quantity: 0, price: 0 }],
    });
  };

  const removeItem = index => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  // MODIFIED: Calculate total to include consulting fee or treatment fee
  const calculateTotal = () => {
    let subtotal = formData.items.reduce((acc, item) => {
      // Only include items with price/qty > 0 (i.e., product types) in this calculation
      const price = parseFloat(item.price || 0);
      const quantity = parseInt(item.quantity || 0, 10);
      return acc + (price * quantity);
    }, 0);

    if (formData.type === 'Consulting') {
      const fee = parseFloat(formData.consultingFee || 0);
      subtotal += fee;
    } else if (formData.type === 'Treatment') { // ADDED: Treatment fee
      const fee = parseFloat(formData.treatmentFee || 0);
      subtotal += fee;
    }
    
    // Ensure subtotal is not negative before applying discount
    subtotal = Math.max(0, subtotal);

    return subtotal - (subtotal * formData.discount) / 100;
  };

  useEffect(() => {
    const totalAmount = calculateTotal();
    setFormData(prevData => ({ ...prevData, totalAmount }));
  }, [formData.items, formData.discount, formData.type, formData.consultingFee, formData.treatmentFee]); // MODIFIED: ADDED formData.treatmentFee

  const handleDownloadBill = async () => {
    try {
      if (!formData.id || !formData.name || !formData.phone || !formData.address) {
        throw new Error('Patient details (ID, Name, Phone, Address) are required for a new bill.');
      }

      const isProductBill = formData.type === 'Product' || formData.type === '';
      
      if (isProductBill) {
        for (const item of formData.items) {
          const selectedStock = stocks.find(stock => stock.productName === item.description);

          if (selectedStock && item.quantity > selectedStock.quantity) {
            throw new Error(
              `Insufficient stock for ${selectedStock.productName}. Available: ${selectedStock.quantity}`
            );
          }
        }
      }

      if (!formData.typeOfPayment) {
        throw new Error('Type of Payment is required.');
      }

      // Step 1: Update stock quantities (only for Product type)
      if (isProductBill) {
        for (const item of formData.items) {
          const selectedStock = stocks.find(stock => stock.productName === item.description);

          if (selectedStock) {
            const updatedQuantity = selectedStock.quantity - item.quantity;

            await axios.put(
              `https://siddha-shivalayas-backend.vercel.app/stocks/${selectedStock.stockId}`,
              {
                quantity: updatedQuantity,
                updateMode: 'set',
              }
            );
          }
        }
      }

      // Step 2: Generate the bill
      const response = await axios.post(
        'https://siddha-shivalayas-backend.vercel.app/generate-bill',
        formData,
        { responseType: 'blob' }
      );

      // Step 3: Download the bill
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `generated-bill-${formData.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage('Stocks updated and bill generated successfully!');
      if (isExistingPatientRoute) {
          fetchBillHistory();
      } else {
          setFormData(prev => ({ 
            ...prev,
            id: '', 
            name: '',
            phone: '',
            address: '',
            items: [],
            discount: 0,
            totalAmount: 0,
            type: '', 
            typeOfPayment: '', 
            consultingFee: 0,
            treatmentFee: 0,
            date: new Date().toISOString().split('T')[0],
        }));
      }

    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing the request');
    }
  };

  const handleSaveTransaction = async () => {
    try {
        if (!formData.id || !formData.name || !formData.phone || !formData.address) {
            throw new Error('Patient details (ID, Name, Phone, Address) are required for a new bill.');
        }

        const isProductBill = formData.type === 'Product' || formData.type === '';

      if (isProductBill) {
        for (const item of formData.items) {
          const selectedStock = stocks.find(stock => stock.productName === item.description);

          if (selectedStock && item.quantity > selectedStock.quantity) {
            throw new Error(
              `Insufficient stock for ${selectedStock.productName}. Available: ${selectedStock.quantity}`
            );
          }
        }
      }
      
      if (!formData.typeOfPayment) {
        throw new Error('Type of Payment is required.');
      }

      // Step 1: Update stock quantities (only for Product type)
      if (isProductBill) {
        for (const item of formData.items) {
          const selectedStock = stocks.find(stock => stock.productName === item.description);

          if (selectedStock) {
            const updatedQuantity = selectedStock.quantity - item.quantity;

            await axios.put(
              `https://siddha-shivalayas-backend.vercel.app/stocks/${selectedStock.stockId}`,
              {
                quantity: updatedQuantity,
                updateMode: 'set',
              }
            );
          }
        }
      }
      
      await axios.post(
        'https://siddha-shivalayas-backend.vercel.app/generate-bill',
        formData,
        { responseType: 'blob' }
      );

      setSuccessMessage('Transaction saved successfully!');
      if (isExistingPatientRoute) {
          fetchBillHistory();
      } else {
          setFormData(prev => ({ 
            ...prev,
            id: '', 
            name: '',
            phone: '',
            address: '',
            items: [],
            discount: 0,
            totalAmount: 0,
            type: '', 
            typeOfPayment: '', 
            consultingFee: 0,
            treatmentFee: 0,
            date: new Date().toISOString().split('T')[0],
        }));
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing the request');
    }
  };

  const BillPreview = ({ bill }) => {
    const itemSubtotal = bill.items.reduce((acc, item) => acc + (item.quantity || 0) * (item.price || 0), 0);
    
    let feeValue = 0;
    let feeLabel = '';
    
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
              </td>
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

  const isProductBillType = formData.type === 'Product' || formData.type === '';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 100%)`,
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            background: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            borderRadius: 2,
            p: 4,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            },
          }}
        >
          <Typography
            variant="h4"
            align="center"
            sx={{
              mb: 4,
              fontWeight: 700,
              color: 'primary.main',
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Generate Bill
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <form>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Patient ID"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    required
                    InputProps={{ 
                      readOnly: isExistingPatientRoute, 
                      style: isExistingPatientRoute ? { backgroundColor: '#f5f5f5', color: '#757575' } : {},
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Patient Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputProps={{ readOnly: isExistingPatientRoute }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputProps={{ readOnly: isExistingPatientRoute }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date ? formData.date.split('T')[0] : ''}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{
                      shrink: true, 
                    }}
                  />
                </Grid>

                {/* MODIFIED: Bill Type Dropdown to include Treatment */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Bill Type"
                    name="type"
                    value={formData.type}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        type: e.target.value,
                        // Clear fees/items based on new type
                        consultingFee: e.target.value !== 'Consulting' ? 0 : formData.consultingFee,
                        treatmentFee: e.target.value !== 'Treatment' ? 0 : formData.treatmentFee, // MODIFIED
                        items: [], // Reset items when type changes
                      })
                    }
                    variant="outlined"
                    fullWidth
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value=""></option>
                    <option value="Consulting">Consulting</option>
                    <option value="Treatment">Treatment</option> {/* ADDED */}
                    <option value="Product">Product</option>
                  </TextField>
                </Grid>
                {/* END MODIFIED */}

                {/* Type of Payment Field */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Type of Payment"
                    name="typeOfPayment"
                    value={formData.typeOfPayment}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    required
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value=""></option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputProps={{ readOnly: isExistingPatientRoute }}
                  />
                </Grid>
                
                {/* Consulting Fee Field (Conditional) */}
                {formData.type === 'Consulting' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Consulting Fee"
                      name="consultingFee"
                      type="number"
                      value={formData.consultingFee}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                )}

                {/* ADDED: Treatment Fee Field (Conditional) */}
                {formData.type === 'Treatment' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Treatment Fee"
                      name="treatmentFee"
                      type="number"
                      value={formData.treatmentFee}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                )}
                {/* END ADDED */}


                {/* MODIFICATION: Conditional Items Section for all types */}
                {(formData.type === 'Product' || formData.type === 'Consulting' || formData.type === 'Treatment' || formData.type === '') && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      {isProductBillType ? 'Products' : 'Comments/Description'}
                    </Typography>
                    {formData.items.map((item, index) => (
                      <Grid container spacing={2} key={index} marginBottom={2} alignItems="center">
                        {isProductBillType ? (
                          // === PRODUCT FIELDS ===
                          <>
                            <Grid item xs={12} sm={4}>
                              <Autocomplete
                                options={stocks}
                                getOptionLabel={option => option.productName}
                                onChange={(e, selectedStock) => handleItemSelection(index, selectedStock)}
                                renderInput={params => (
                                  <TextField {...params} label="Product" fullWidth />
                                )}
                                value={stocks.find(s => s.productName === item.description) || { productName: item.description || '' }}
                                isOptionEqualToValue={(option, value) => option.productName === value.productName}
                              />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                              <TextField
                                label="HSN"
                                value={item.HSN}
                                onChange={e => handleItemChange(index, 'HSN', e.target.value)}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                              <TextField
                                label="GST"
                                value={item.GST}
                                onChange={e => handleItemChange(index, 'GST', e.target.value)}
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={6} sm={2}>
                              <TextField
                                label="Quantity"
                                type="number"
                                value={item.quantity}
                                onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                fullWidth
                                error={
                                  !!stocks.find(
                                    stock =>
                                      stock.productName === item.description &&
                                      parseInt(item.quantity, 10) > stock.quantity
                                  )
                                }
                                helperText={
                                  stocks.find(
                                    stock =>
                                      stock.productName === item.description &&
                                      parseInt(item.quantity, 10) > stock.quantity
                                  )
                                    ? `Insufficient stock. Available: ${
                                        stocks.find(stock => stock.productName === item.description)
                                          .quantity
                                      }`
                                    : ''
                                }
                              />
                            </Grid>
                            <Grid item xs={6} sm={2}>
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
                          // === COMMENT/DESCRIPTION FIELD ===
                          <Grid item xs={10}>
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

                        <Grid item xs={isProductBillType ? 12 : 2} sm={isProductBillType ? 2 : 2} sx={{ display: 'flex', justifyContent: isProductBillType ? 'flex-start' : 'flex-end' }}>
                            <IconButton onClick={() => removeItem(index)} color="error">
                              <DeleteIcon />
                            </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                    <Button variant="contained" onClick={addItem} sx={{ mt: 2 }} fullWidth>
                      Add {isProductBillType ? 'Product' : 'Comment/Description'}
                    </Button>
                  </Grid>
                )}
                {/* END MODIFICATION */}


                <Grid item xs={12}>
                  <TextField
                    label="Discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sx={{ textAlign: 'right' }}>
                  <Typography variant="h6">
                    Total Amount: ₹{formData.totalAmount.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
              
              {/* MODIFIED: Bill Preview Table Structure */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Bill Preview
                </Typography>
                <Box sx={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      marginBottom: '1rem',
                    }}
                  >
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Product</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>HSN</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>GST (%)</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Qty</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Price</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => {
                        const quantity = parseInt(item.quantity || 0, 10);
                        const price = parseFloat(item.price || 0);
                        const itemTotal = quantity * price;
                        const isProductType = formData.type === 'Product' || formData.type === '';
                        
                        if (!isProductType && !item.description) return null;

                        if (isProductType) {
                          return (
                            <tr key={index}>
                              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                {item.description}
                              </td>
                              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                {item.HSN}
                              </td>
                              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                {item.GST}
                              </td>
                              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                {item.quantity}
                              </td>
                              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                ₹{price.toFixed(2)}
                              </td>
                              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                ₹{itemTotal.toFixed(2)}
                              </td>
                            </tr>
                          );
                        } else {
                             // MODIFICATION: Show comments/description with colspan
                            return (
                                <tr key={index}>
                                    <td colSpan={6} style={{ border: '1px solid #ccc', padding: '8px' }}>
                                        <span style={{ fontWeight: 'bold' }}>Comment/Description:</span> {item.description}
                                    </td>
                                </tr>
                            );
                        }
                      })}
                      {/* Consulting Fee Preview */}
                      {formData.type === 'Consulting' && formData.consultingFee > 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              border: '1px solid #ccc',
                              padding: '8px',
                              textAlign: 'right',
                              fontWeight: 'bold',
                            }}
                          >
                            Consulting Fee
                          </td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            ₹{parseFloat(formData.consultingFee).toFixed(2)}
                          </td>
                        </tr>
                      )}
                      {/* ADDED: Treatment Fee Preview */}
                      {formData.type === 'Treatment' && formData.treatmentFee > 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              border: '1px solid #ccc',
                              padding: '8px',
                              textAlign: 'right',
                              fontWeight: 'bold',
                            }}
                          >
                            Treatment Fee
                          </td>
                          <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                            ₹{parseFloat(formData.treatmentFee).toFixed(2)}
                          </td>
                        </tr>
                      )}
                      {/* END ADDED */}

                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            border: '1px solid #ccc',
                            padding: '8px',
                            textAlign: 'right',
                          }}
                        >
                          Subtotal (Before Discount)
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                          ₹
                          {(
                            formData.items.reduce(
                              (acc, item) =>
                                acc +
                                parseFloat(item.price || 0) * parseInt(item.quantity || 0, 10),
                              0
                            ) + 
                            parseFloat(formData.consultingFee || 0) + // MODIFIED: Include both fees
                            parseFloat(formData.treatmentFee || 0) // MODIFIED: Include both fees
                          ).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            border: '1px solid #ccc',
                            padding: '8px',
                            textAlign: 'right',
                          }}
                        >
                          Discount ({formData.discount || 0}%)
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                          -₹
                          {(
                            ((formData.items.reduce(
                              (acc, item) =>
                                acc +
                                parseFloat(item.price || 0) * parseInt(item.quantity || 0, 10),
                              0
                            ) + 
                            parseFloat(formData.consultingFee || 0) + // MODIFIED: Include both fees
                            parseFloat(formData.treatmentFee || 0)) * // MODIFIED: Include both fees
                              (formData.discount || 0)) /
                            100
                          ).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            border: '1px solid #ccc',
                            padding: '8px',
                            textAlign: 'right',
                            fontWeight: 'bold',
                          }}
                        >
                          Total
                        </td>
                        <td
                          style={{
                            border: '1px solid #ccc',
                            padding: '8px',
                            fontWeight: 'bold',
                          }}
                        >
                          ₹{formData.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                      {/* Payment Type Preview */}
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            border: '1px solid #ccc',
                            padding: '8px',
                            textAlign: 'right',
                            fontWeight: 'bold',
                          }}
                        >
                          Payment Type
                        </td>
                        <td
                          style={{
                            border: '1px solid #ccc',
                            padding: '8px',
                            fontWeight: 'bold',
                          }}
                        >
                          {formData.typeOfPayment || 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </Box>
              </Grid>

              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 4, mr: 2 }}
                onClick={handleDownloadBill}
              >
                Download Bill
              </Button>
              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 4 }}
                onClick={handleSaveTransaction}
              >
                Save Transaction
              </Button>
            </form>
          )}

          <Snackbar
            open={Boolean(errorMessage)}
            autoHideDuration={3000}
            onClose={() => setErrorMessage('')}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              severity="error"
              onClose={() => setErrorMessage('')}
            >
              {errorMessage}
            </MuiAlert>
          </Snackbar>

          <Snackbar
            open={Boolean(successMessage)}
            autoHideDuration={3000}
            onClose={() => setSuccessMessage('')}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              severity="success"
              onClose={() => setSuccessMessage('')}
            >
              {successMessage}
            </MuiAlert>
          </Snackbar>
          
          {isExistingPatientRoute && (
            <TableContainer
              component={Paper}
              sx={{
                mt: 6,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Bill History of {formData.name}
              </Typography>
              <Table>
                <TableHead sx={{ backgroundColor: theme.palette.primary.light }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Bill ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Payment</TableCell> 
                    <TableCell sx={{ fontWeight: 'bold' }}>Edit</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Delete</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Preview</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Download</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBills.map((bill, index) => {
                    // Calculate totals for display
                    const itemSubtotal = bill.items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);
                    
                    let feeValue = 0;
                    if (bill.type === 'Consulting') {
                        feeValue = bill.consultingFee || 0;
                    } else if (bill.type === 'Treatment') {
                        feeValue = bill.treatmentFee || 0;
                    }

                    const subtotal = itemSubtotal + feeValue;
                    const total = subtotal - (subtotal * (bill.discount || 0)) / 100;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{'B' + (index + 1)}</TableCell>
                        <TableCell>{bill.name}</TableCell>
                        <TableCell>
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
                          <Button onClick={() => togglePreview(bill._id)}>
                            {previewedBillId === bill._id ? 'Hide' : 'Preview'}
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
          )}
          {previewedBillId && (
            <BillPreview bill={billHistory.find(bill => bill._id === previewedBillId)} />
          )}
        </Box>
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
    </Box>
  );
};

export default Transaction;