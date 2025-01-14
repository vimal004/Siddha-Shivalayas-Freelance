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
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Autocomplete } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Transaction = () => {
  const navigate = useNavigate();
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
  const [stocks, setStocks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const id = window.location.pathname.split("/")[2];

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
      return acc + price * quantity * (1 + gst);
    }, 0);
    return total - (total * formData.discount) / 100;
  };

  useEffect(() => {
    const totalAmount = calculateTotal();
    setFormData((prevData) => ({ ...prevData, totalAmount }));
  }, [formData.items, formData.discount]);

  const handleDownloadBill = async () => {
    try {
      const response = await axios.post(
        "https://siddha-shivalayas-backend.vercel.app/generate-bill",
        formData,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `generated-bill-${formData.id}.docx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage("Bill generated successfully!");
    } catch (err) {
      console.error(err);
      setErrorMessage("Error generating the bill.");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box
        sx={{
          background: "#fff",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          p: 4,
        }}
      >
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#1976d2" }}
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
                  <Grid container spacing={2} key={index}>
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
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 4 }}
              onClick={handleDownloadBill}
            >
              Download Bill
            </Button>
          </form>
        )}
        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={3000}
          onClose={() => setErrorMessage("")}
        >
          <MuiAlert elevation={6} variant="filled" severity="error">
            {errorMessage}
          </MuiAlert>
        </Snackbar>
        <Snackbar
          open={Boolean(successMessage)}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage("")}
        >
          <MuiAlert elevation={6} variant="filled" severity="success">
            {successMessage}
          </MuiAlert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default Transaction;
