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
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

const Transaction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
    treatmentOrMedicine: "",
    date: "",
  });
  const [created, setCreated] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      phone: "",
      address: "",
      treatmentOrMedicine: "",
      date: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoadingCreate(true);

    if (!formData.id) {
      setErrorMessage("Patient ID is required");
      setLoadingCreate(false);
      return;
    }

    try {
      await axios.post(
        "https://siddha-shivalayas-backend.vercel.app/patients",
        formData
      );
      setCreated(true);
      resetForm();
    } catch (err) {
      setErrorMessage("Patient creation failed");
    } finally {
      setLoadingCreate(false);
    }
  };

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
    } catch (err) {
      console.error(err);
      setErrorMessage("Error downloading the bill");
    }
  };

  const isIdEntered = formData.id.trim() !== "";

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
          <strong>Generate Bill</strong>
        </Typography>
        <form onSubmit={handleCreate}>
          <Grid container spacing={2}>
            {/* Patient ID */}
            <Grid item xs={12}>
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
            {/* Patient Name */}
            <Grid item xs={12}>
              <TextField
                label="Patient Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
            {/* Phone Number */}
            <Grid item xs={12}>
              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
            {/* Address */}
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
            {/* Treatment or Medicine */}
            <Grid item xs={12}>
              <TextField
                select
                label="Treatment or Medicine"
                name="treatmentOrMedicine"
                value={formData.treatmentOrMedicine}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                <option value="treatment">Treatment</option>
                <option value="medicine">Medicine</option>
              </TextField>
            </Grid>
            {/* Date */}
            <Grid item xs={12}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* Create Button */}
          <Grid item xs={12} style={{ marginTop: "16px" }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isIdEntered || loadingCreate}
                style={{ margin: "8px" }}
              >
                {loadingCreate ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create"
                )}
              </Button>
              {/* Download Bill Button */}
              <Button
                variant="contained"
                color="secondary"
                onClick={handleDownloadBill}
                disabled={!isIdEntered}
                style={{ margin: "8px" }}
              >
                Download Bill
              </Button>
            </div>
          </Grid>

          {/* Alerts */}
          <Snackbar
            open={created}
            autoHideDuration={3000}
            onClose={() => setCreated(false)}
          >
            <MuiAlert elevation={6} variant="filled" severity="success">
              Patient created successfully!
            </MuiAlert>
          </Snackbar>

          {errorMessage && (
            <Snackbar
              open={Boolean(errorMessage)}
              autoHideDuration={4000}
              onClose={() => setErrorMessage("")}
            >
              <MuiAlert elevation={6} variant="filled" severity="error">
                {errorMessage}
              </MuiAlert>
            </Snackbar>
          )}
        </form>
      </div>
    </Container>
  );
};

export default Transaction;
