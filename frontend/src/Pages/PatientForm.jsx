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
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";

const PatientForm = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
    treatmentOrMedicine: "",
    date: "",
  });

  const [patients, setPatients] = useState([]); // For auto-complete suggestions
  const [created, setCreated] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [success, setSuccess] = useState(false); // For success Snackbar
  const [errorMessage, setErrorMessage] = useState(""); // For error Snackbar
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

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

  useEffect(() => {
    axios
      .get("https://siddha-shivalayas-backend.vercel.app/patients")
      .then((response) => {
        setPatients(response.data);
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
      });
  }, []);

  const handleDelete = () => {
    setLoadingDelete(true);
    axios
      .delete(
        `https://siddha-shivalayas-backend.vercel.app/patients/${formData.id}`
      )
      .then(() => {
        setDeleted(true);
        setSuccess(true); // Success Message
        resetForm();
        setLoadingDelete(false); // Reset loading state
        setTimeout(() => setDeleted(false), 3000);
      })
      .catch((err) => {
        console.error(err);
        setLoadingDelete(false); // Reset loading state
        setErrorMessage("Patient deletion failed"); // Error Message
        setSuccess(false);
      });
  };

  const handleUpdate = () => {
    setLoadingUpdate(true);
    axios
      .put(
        `https://siddha-shivalayas-backend.vercel.app/patients/${formData.id}`,
        formData
      )
      .then(() => {
        setUpdated(true);
        setSuccess(true); // Success Message
        resetForm();
        setLoadingUpdate(false); // Reset loading state
        setTimeout(() => setUpdated(false), 3000);
      })
      .catch((err) => {
        console.error(err);
        setLoadingUpdate(false); // Reset loading state
        setErrorMessage("Patient update failed"); // Error Message
        setSuccess(false);
      });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setLoadingCreate(true);
    if (!formData.id) {
      setErrorMessage("Patient ID is required"); // Error Message
      setSuccess(false);
      setLoadingCreate(false);
      return;
    }

    axios
      .post("https://siddha-shivalayas-backend.vercel.app/patients", formData)
      .then(() => {
        setCreated(true);
        setSuccess(true); // Success Message
        resetForm();
        setLoadingCreate(false); // Reset loading state
        setTimeout(() => setCreated(false), 3000);
      })
      .catch((err) => {
        console.error(err);
        setSuccess(false);
        setErrorMessage("Patient creation failed"); // Error Message
        setLoadingCreate(false); // Reset loading state
      });
  };

  const handleAutocompleteChange = (event, value) => {
    if (value) {
      setFormData(value); // Prefill the form with selected patient data
    } else {
      resetForm();
    }
  };

  const isIdEntered = formData.id.trim() !== "";

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
            Patient Form
          </Typography>

          {/* Autocomplete for patient ID */}
          <Autocomplete
            options={patients}
            getOptionLabel={(option) => option.id || ""}
            sx={{ mb: 3 }}
            onChange={handleAutocompleteChange}
            renderInput={(params) => (
              <TextField {...params} label="Search Patient by ID" fullWidth />
            )}
          />

          <form onSubmit={handleCreate}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Patient ID"
                  name="id"
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Patient Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid item xs={12} sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disableElevation
                  disabled={!isIdEntered || loadingCreate}
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
                  disabled={!isIdEntered || loadingUpdate}
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
                  disabled={!isIdEntered || loadingDelete}
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

export default PatientForm;
