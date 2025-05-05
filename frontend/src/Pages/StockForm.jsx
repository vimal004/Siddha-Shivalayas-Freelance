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
  Box,
  useTheme,
  alpha,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

const StockForm = () => {
  const navigate = useNavigate();
  const theme = useTheme();

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

  const [updateMode, setUpdateMode] = useState("add"); // Default to "add" mode
  const [stocks, setStocks] = useState([]);
  const [created, setCreated] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

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
    setFormData({ ...formData, [name]: value });
  };

  const handleAutocompleteChange = (event, value) => {
    if (value) {
      setFormData(value);
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
      const payload = { ...formData, updateMode }; // Include update mode in the payload
      await axios.put(
        `https://siddha-shivalayas-backend.vercel.app/stocks/${formData.stockId}`,
        payload
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
      <Container maxWidth="md">
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
            Stock Form
          </Typography>

          <Autocomplete
            options={stocks}
            getOptionLabel={(option) => option.productName || ""}
            sx={{ mb: 3 }}
            onChange={handleAutocompleteChange}
            renderInput={(params) => (
              <TextField {...params} label="Search Stock by Name" fullWidth />
            )}
          />

          <form onSubmit={handleCreate}>
            <Grid container spacing={2}>
              {Object.keys(formData).map((key) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <TextField
                    label={key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    required={key === "stockId"}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Update Mode Selection */}
            <FormControl component="fieldset" sx={{ mt: 2 }}>
              <FormLabel component="legend">Update Mode</FormLabel>
              <RadioGroup
                row
                value={updateMode}
                onChange={(e) => setUpdateMode(e.target.value)}
              >
                <FormControlLabel
                  value="add"
                  control={<Radio />}
                  label="Add to Existing Quantity"
                />
                <FormControlLabel
                  value="set"
                  control={<Radio />}
                  label="Set Actual Quantity"
                />
              </RadioGroup>
            </FormControl>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disableElevation
                  disabled={!isStockIdEntered || loadingCreate}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    px: 4,
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
                  color="warning"
                  disableElevation
                  disabled={!isStockIdEntered || loadingUpdate}
                  onClick={handleUpdate}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    px: 4,
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
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    px: 4,
                  }}
                >
                  {loadingDelete ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </Box>
            </Grid>
          </form>

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

          <Snackbar open={!!errorMessage} autoHideDuration={3000}>
            <MuiAlert
              severity="error"
              onClose={() => setErrorMessage("")}
              variant="filled"
            >
              {errorMessage}
            </MuiAlert>
          </Snackbar>
        </Box>
      </Container>
    </Box>
  );
};

export default StockForm;
