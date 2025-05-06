import React, { useState, useEffect } from "react";
import axios from "axios";
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
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Autocomplete } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete"; // Import the delete icon

const Transaction = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
    date: "",
    items: [],
    discount: 0,
    totalAmount: 0,
  });

  const [filteredBills, setFilteredBills] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [billHistory, setBillHistory] = useState([]);
  const [previewedBillId, setPreviewedBillId] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);

  const togglePreview = (billId) => {
    setPreviewedBillId(previewedBillId === billId ? null : billId);
  };

  const id = window.location.pathname.split("/")[2];

  const deleteBill = (billId) => async () => {
    try {
      console.log("Deleting bill with ID:", billId);
      await axios.delete(
        `https://siddha-shivalayas-backend.vercel.app/bills/${billId}`
      );
      fetchBillHistory();
      setSuccessMessage("Bill deleted successfully.");
    } catch (error) {
      console.error("Error deleting bill:", error);
      setErrorMessage("Error deleting bill. Please try again later.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    axios
      .get("https://siddha-shivalayas-backend.vercel.app/stocks")
      .then((response) => {
        setStocks(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    axios
      .get(`https://siddha-shivalayas-backend.vercel.app/patients/${id}`)
      .then((response) => {
        setFormData({ ...formData, ...response.data });
      })
      .catch((error) => console.error(error));
  }, [id]);

  const handleItemSelection = (index, selectedStock) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      description: selectedStock.productName,
      price: selectedStock.price,
      GST: selectedStock.gst,
      HSN: selectedStock.hsnCode,
    };
    setFormData({ ...formData, items: updatedItems });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    // Check if the field being updated is "quantity"
    if (field === "quantity") {
      const selectedStock = stocks.find(
        (stock) => stock.productName === updatedItems[index].description
      );

      if (selectedStock && parseInt(value, 10) > selectedStock.quantity) {
        setErrorMessage(
          `Insufficient stock for ${selectedStock.productName}. Available: ${selectedStock.quantity}`
        );
      } else {
        setErrorMessage(""); // Clear the error message if the quantity is valid
      }
    }

    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", HSN: "", GST: "", quantity: "", price: "" },
      ],
    });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotal = () => {
    const total = formData.items.reduce((acc, item) => {
      const price = parseFloat(item.price || 0);
      const quantity = parseInt(item.quantity || 0, 10);
      const gst = parseFloat(item.GST || 0) / 100;
      return acc + price * quantity;
    }, 0);
    return total - (total * formData.discount) / 100;
  };

  useEffect(() => {
    const totalAmount = calculateTotal();
    setFormData((prevData) => ({ ...prevData, totalAmount }));
  }, [formData.items, formData.discount]);

  const handleDownloadBill = async () => {
    try {
      // Check if any item quantity exceeds available stock
      for (const item of formData.items) {
        const selectedStock = stocks.find(
          (stock) => stock.productName === item.description
        );

        if (selectedStock && item.quantity > selectedStock.quantity) {
          throw new Error(
            `Insufficient stock for ${selectedStock.productName}. Available: ${selectedStock.quantity}`
          );
        }
      }

      // Step 1: Update stock quantities
      for (const item of formData.items) {
        const selectedStock = stocks.find(
          (stock) => stock.productName === item.description
        );

        if (selectedStock) {
          const updatedQuantity = selectedStock.quantity - item.quantity;

          // Update the stock quantity in the database using stockId
          await axios.put(
            `https://siddha-shivalayas-backend.vercel.app/stocks/${selectedStock.stockId}`,
            {
              quantity: updatedQuantity,
              updateMode: "set",
            }
          );
        }
      }

      // Step 2: Generate the bill
      const response = await axios.post(
        "https://siddha-shivalayas-backend.vercel.app/generate-bill",
        formData,
        { responseType: "blob" }
      );

      // Step 3: Download the bill
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `generated-bill-${formData.id}.docx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Success message
      setSuccessMessage("Stocks updated and bill generated successfully!");
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Error processing the request");
    }
  };

  const handleSaveTransaction = async () => {
    try {
      // Check if any item quantity exceeds available stock
      for (const item of formData.items) {
        const selectedStock = stocks.find(
          (stock) => stock.productName === item.description
        );

        if (selectedStock && item.quantity > selectedStock.quantity) {
          throw new Error(
            `Insufficient stock for ${selectedStock.productName}. Available: ${selectedStock.quantity}`
          );
        }
      }

      // Step 1: Update stock quantities
      for (const item of formData.items) {
        const selectedStock = stocks.find(
          (stock) => stock.productName === item.description
        );

        if (selectedStock) {
          const updatedQuantity = selectedStock.quantity - item.quantity;

          // Update the stock quantity in the database using stockId
          await axios.put(
            `https://siddha-shivalayas-backend.vercel.app/stocks/${selectedStock.stockId}`,
            {
              quantity: updatedQuantity,
              updateMode: "set",
            }
          );
        }
      }
      const response = await axios.post(
        "https://siddha-shivalayas-backend.vercel.app/generate-bill",
        formData,
        { responseType: "blob" }
      );

      setSuccessMessage("Transaction saved successfully!");
      console.log("Transaction saved successfully:", formData);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Error processing the request");
    }
  };

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

  useEffect(() => {
    fetchBillHistory();
  }, []);

  useEffect(() => {
    let filtered = billHistory.filter((bill) => {
      const matchesName = bill.name
        .toLowerCase()
        .includes(formData.name.toLowerCase());
      return matchesName;
    });
    console.log("Filtered Bills:", filtered);
    setFilteredBills(filtered);
    console.log("Filtered Bills State:", filteredBills);
  }, [filteredBills]);

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
            Generate Bill
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: "center", mt: 4 }}>
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
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{
                      shrink: true, // Ensures the label doesn't overlap with the date value
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Items
                  </Typography>
                  {formData.items.map((item, index) => (
                    <Grid container spacing={2} key={index} marginBottom={2}>
                      <Grid item xs={12} sm={4}>
                        <Autocomplete
                          options={stocks}
                          getOptionLabel={(option) => option.productName}
                          onChange={(e, selectedStock) =>
                            handleItemSelection(index, selectedStock)
                          }
                          renderInput={(params) => (
                            <TextField {...params} label="Product" fullWidth />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          label="HSN"
                          value={item.HSN}
                          onChange={(e) =>
                            handleItemChange(index, "HSN", e.target.value)
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          label="GST"
                          value={item.GST}
                          onChange={(e) =>
                            handleItemChange(index, "GST", e.target.value)
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          label="Quantity"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, "quantity", e.target.value)
                          }
                          fullWidth
                          error={
                            !!stocks.find(
                              (stock) =>
                                stock.productName === item.description &&
                                parseInt(item.quantity, 10) > stock.quantity
                            )
                          }
                          helperText={
                            stocks.find(
                              (stock) =>
                                stock.productName === item.description &&
                                parseInt(item.quantity, 10) > stock.quantity
                            )
                              ? `Insufficient stock. Available: ${
                                  stocks.find(
                                    (stock) =>
                                      stock.productName === item.description
                                  ).quantity
                                }`
                              : ""
                          }
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          label="Price"
                          value={item.price}
                          onChange={(e) =>
                            handleItemChange(index, "price", e.target.value)
                          }
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <IconButton
                          onClick={() => removeItem(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    variant="contained"
                    onClick={addItem}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    Add Item
                  </Button>
                </Grid>
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
                <Grid item xs={12} sx={{ textAlign: "right" }}>
                  <Typography variant="h6">
                    Total Amount: ₹{formData.totalAmount.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Bill Preview
                </Typography>
                <Box sx={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      marginBottom: "1rem",
                    }}
                  >
                    <thead>
                      <tr>
                        <th
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          Product
                        </th>
                        <th
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          HSN
                        </th>
                        <th
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          GST (%)
                        </th>
                        <th
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          Qty
                        </th>
                        <th
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          Price
                        </th>
                        <th
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => {
                        const quantity = parseInt(item.quantity || 0, 10);
                        const price = parseFloat(item.price || 0);
                        const total = quantity * price;
                        return (
                          <tr key={index}>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                              }}
                            >
                              {item.description}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                              }}
                            >
                              {item.HSN}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                              }}
                            >
                              {item.GST}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                              }}
                            >
                              {item.quantity}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                              }}
                            >
                              ₹{price.toFixed(2)}
                            </td>
                            <td
                              style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                              }}
                            >
                              ₹{total.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            border: "1px solid #ccc",
                            padding: "8px",
                            textAlign: "right",
                          }}
                        >
                          Subtotal
                        </td>
                        <td
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          ₹
                          {formData.items
                            .reduce(
                              (acc, item) =>
                                acc +
                                parseFloat(item.price || 0) *
                                  parseInt(item.quantity || 0, 10),
                              0
                            )
                            .toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            border: "1px solid #ccc",
                            padding: "8px",
                            textAlign: "right",
                          }}
                        >
                          Discount ({formData.discount || 0}%)
                        </td>
                        <td
                          style={{ border: "1px solid #ccc", padding: "8px" }}
                        >
                          -₹
                          {(
                            (formData.items.reduce(
                              (acc, item) =>
                                acc +
                                parseFloat(item.price || 0) *
                                  parseInt(item.quantity || 0, 10),
                              0
                            ) *
                              (formData.discount || 0)) /
                            100
                          ).toFixed(2)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            border: "1px solid #ccc",
                            padding: "8px",
                            textAlign: "right",
                            fontWeight: "bold",
                          }}
                        >
                          Total
                        </td>
                        <td
                          style={{
                            border: "1px solid #ccc",
                            padding: "8px",
                            fontWeight: "bold",
                          }}
                        >
                          ₹{formData.totalAmount.toFixed(2)}
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
          <TableContainer
            component={Paper}
            sx={{
              mt: 6,
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Table>
              <TableHead sx={{ backgroundColor: theme.palette.primary.light }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Bill ID</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Edit</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Delete</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Preview</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Download</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBills.map((bill, index) => (
                  <TableRow key={index}>
                    <TableCell>{"B" + (index + 1)}</TableCell>
                    <TableCell>{bill.name}</TableCell>
                    <TableCell>
                      {new Date(bill.date).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      ₹
                      {bill.items.reduce(
                        (acc, item) => acc + item.price * item.quantity,
                        0
                      )}
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => setEditingBill(bill)}>Edit</Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        color="error"
                        onClick={() => setBillToDelete(bill)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => togglePreview(bill._id)}>
                        {previewedBillId === bill._id ? "Hide" : "Preview"}
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Dialog open={!!billToDelete} onClose={() => setBillToDelete(null)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the bill for{" "}
              <strong>{billToDelete?.name}</strong>?
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
      </Container>
    </Box>
  );
};

export default Transaction;
