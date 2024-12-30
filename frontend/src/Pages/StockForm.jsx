import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Snackbar,
  CircularProgress,
  Grid,
  Typography,
  Container,
  Autocomplete,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

const StockForm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    stockId: "",
    productName: "",
    quantity: "",
    price: "",
    hsnCode: "",
    discount: "",
    gst: "",
  });

  const [stocks, setStocks] = useState([]); // To store stock data for autocomplete
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch all stocks for autocomplete
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await axios.get(
          "https://siddha-shivalayas-backend.vercel.app/stocks"
        );
        setStocks(response.data);
      } catch (error) {
        console.error("Error fetching stocks:", error);
      }
    };
    fetchStocks();
  }, []);

  const resetForm = () => {
    setFormData({
      stockId: "",
      productName: "",
      quantity: "",
      price: "",
      hsnCode: "",
      discount: "",
      gst: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAutocompleteChange = (event, value) => {
    if (value) {
      setFormData(value); // Prefill the form with selected stock data
    } else {
      resetForm();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "https://siddha-shivalayas-backend.vercel.app/stocks",
        formData
      );
      setSuccess("Stock created successfully");
      resetForm();
    } catch (error) {
      console.error("Error creating stock:", error);
      setErrorMessage("Stock creation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await axios.put(
        `https://siddha-shivalayas-backend.vercel.app/stocks/${formData.stockId}`,
        formData
      );
      setSuccess("Stock updated successfully");
      resetForm();
    } catch (error) {
      console.error("Error updating stock:", error);
      setErrorMessage("Stock update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `https://siddha-shivalayas-backend.vercel.app/stocks/${formData.stockId}`
      );
      setSuccess("Stock deleted successfully");
      resetForm();
    } catch (error) {
      console.error("Error deleting stock:", error);
      setErrorMessage("Stock deletion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <Typography variant="h4" align="center" gutterBottom>
        <strong>Stock Form</strong>
      </Typography>
      <Autocomplete
        options={stocks}
        getOptionLabel={(option) => option.stockId || ""}
        style={{ marginBottom: "20px" }}
        onChange={handleAutocompleteChange}
        renderInput={(params) => (
          <TextField {...params} label="Search Stock by ID" fullWidth />
        )}
      />
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Stock ID"
              name="stockId"
              value={formData.stockId}
              onChange={handleChange}
              variant="outlined"
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Product Name"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="HSN Code"
              name="hsnCode"
              value={formData.hsnCode}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />
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
          <Grid item xs={12}>
            <TextField
              label="GST"
              name="gst"
              value={formData.gst}
              onChange={handleChange}
              variant="outlined"
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                style={{ marginRight: "10px" }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create"
                )}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleUpdate}
                disabled={loading}
                style={{ marginRight: "10px" }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Update"
                )}
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </Grid>
        </Grid>
        {success && (
          <Snackbar open={true} autoHideDuration={3000}>
            <MuiAlert elevation={6} variant="filled" severity="success">
              {success}
            </MuiAlert>
          </Snackbar>
        )}
        {errorMessage && (
          <Snackbar open={true} autoHideDuration={3000}>
            <MuiAlert elevation={6} variant="filled" severity="error">
              {errorMessage}
            </MuiAlert>
          </Snackbar>
        )}
      </form>
    </Container>
  );
};

export default StockForm;
