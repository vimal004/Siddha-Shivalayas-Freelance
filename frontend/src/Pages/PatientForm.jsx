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

const PatientForm = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]); // All patients data
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
    treatmentOrMedicine: "",
    date: "",
  });

  const [created, setCreated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    axios
      .get("https://siddha-shivalayas-backend.vercel.app/patients")
      .then((res) => {
        setPatients(res.data); // Store all patient data
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage("Failed to fetch patient data");
      });
  }, []);

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

  const handleSelectPatient = (patient) => {
    if (patient) {
      setFormData({
        id: patient.id || "",
        name: patient.name || "",
        phone: patient.phone || "",
        address: patient.address || "",
        treatmentOrMedicine: patient.treatmentOrMedicine || "",
        date: patient.date
          ? new Date(patient.date).toISOString().split("T")[0]
          : "",
      });
    } else {
      resetForm();
    }
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setLoadingCreate(true);

    axios
      .post("https://siddha-shivalayas-backend.vercel.app/patients", formData)
      .then(() => {
        setCreated(true);
        resetForm();
        setTimeout(() => {
          setCreated(false);
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage("Patient creation failed");
      })
      .finally(() => setLoadingCreate(false));
  };

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
          <strong>Patient Form</strong>
        </Typography>
        <form onSubmit={handleCreate}>
          <Grid container spacing={2}>
            {/* Patient ID Autocomplete */}
            <Grid item xs={12}>
              <Autocomplete
                options={patients}
                getOptionLabel={(option) => option.id || ""}
                onChange={(event, value) => handleSelectPatient(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Patient ID"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    required
                    InputProps={{
                      ...params.InputProps,
                      style: { borderRadius: "8px" },
                    }}
                  />
                )}
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
                InputProps={{
                  style: { borderRadius: "8px" },
                }}
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
                InputProps={{
                  style: { borderRadius: "8px" },
                }}
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
                InputProps={{
                  style: { borderRadius: "8px" },
                }}
              />
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

            {/* Treatment or Medicine */}
            <Grid item xs={12}>
              <TextField
                label="Treatment or Medicine"
                name="treatmentOrMedicine"
                value={formData.treatmentOrMedicine}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                InputProps={{
                  style: { borderRadius: "8px" },
                }}
              />
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
                disabled={loadingCreate}
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
            </div>
          </Grid>

          {/* Success/Failure Alerts */}
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

export default PatientForm;
