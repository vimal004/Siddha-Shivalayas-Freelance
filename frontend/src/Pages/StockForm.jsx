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
  const [created, setCreated] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoadingCreate(true);
    if (!formData.stockId) {
      setErrorMessage("Stock ID is required");
      setSuccess(false);
      setLoadingCreate(false);
      return;
    }
    try {
      await axios.post(
        "https://siddha-shivalayas-backend.vercel.app/stocks",
        formData
      );
      setCreated(true);
      setSuccess(true);
      resetForm();
    } catch (error) {
      console.error("Error creating stock:", error);
      setSuccess(false);
      setErrorMessage("Stock creation failed");
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleUpdate = async () => {
    setLoadingUpdate(true);
    try {
      await axios.put(
        `https://siddha-shivalayas-backend.vercel.app/stocks/${formData.stockId}`,
        formData
      );
      setUpdated(true);
      setSuccess(true);
      resetForm();
    } catch (error) {
      console.error("Error updating stock:", error);
      setSuccess(false);
      setErrorMessage("Stock update failed");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await axios.delete(
        `https://siddha-shivalayas-backend.vercel.app/stocks/${formData.stockId}`
      );
      setDeleted(true);
      setSuccess(true);
      resetForm();
    } catch (error) {
      console.error("Error deleting stock:", error);
      setSuccess(false);
      setErrorMessage("Stock deletion failed");
    } finally {
      setLoadingDelete(false);
    }
  };

  const isStockIdEntered = formData.stockId.trim() !== "";

  return (
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <div
        style={{
          background: "#ffffff",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
          padding: "24px",
          borderRadius: "8px",
          width: "100%",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          <strong>Stock Form</strong>
        </Typography>

        {/* Autocomplete for stock ID */}
        <Autocomplete
          options={stocks}
          getOptionLabel={(option) => option.stockId || ""}
          style={{ marginBottom: "20px" }}
          onChange={handleAutocompleteChange}
          renderInput={(params) => (
            <TextField {...params} label="Search Stock by ID" fullWidth />
          )}
        />

        <form onSubmit={handleCreate}>
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
          </Grid>

          <Grid item xs={12}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
                disabled={!isStockIdEntered || loadingCreate}
                style={{
                  borderRadius: "8px",
                  textTransform: "none",
                  margin: "8px",
                }}
              >
                {loadingCreate ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create"
                )}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                disableElevation
                disabled={!isStockIdEntered || loadingUpdate}
                onClick={handleUpdate}
                style={{
                  borderRadius: "8px",
                  textTransform: "none",
                  margin: "8px",
                }}
              >
                {loadingUpdate ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Update"
                )}
              </Button>
              <Button
                variant="contained"
                color="error"
                disableElevation
                disabled={!isStockIdEntered || loadingDelete}
                onClick={handleDelete}
                style={{
                  borderRadius: "8px",
                  textTransform: "none",
                  margin: "8px",
                }}
              >
                {loadingDelete ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </Grid>
        </form>

        {/* Snackbar for success message */}
        <Snackbar open={success} autoHideDuration={3000}>
          <MuiAlert
            severity="success"
            onClose={() => setSuccess(false)}
            variant="filled"
          >
            {created
              ? "Created successfully!"
              : updated
              ? "Updated successfully!"
              : deleted
              ? "Deleted successfully!"
              : ""}
          </MuiAlert>
        </Snackbar>

        {/* Snackbar for error message */}
        <Snackbar open={!!errorMessage} autoHideDuration={3000}>
          <MuiAlert severity="error" onClose={() => setErrorMessage("")} variant="filled">
            {errorMessage}
          </MuiAlert>
        </Snackbar>
      </div>
    </Container>
  );
};

export default StockForm;
