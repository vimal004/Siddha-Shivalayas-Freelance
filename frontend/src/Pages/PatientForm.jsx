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

const PatientForm = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  // Form Data for Patient Information
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
    treatmentOrMedicine: "",
  });

  const [treatmentData, setTreatmentData] = useState(null); // Treatment Data from API
  const [groupData, setGroupData] = useState(null); // Filtered group-specific data
  const [created, setCreated] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [success, setSuccess] = useState(null);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  // Fetching treatment/medicine data from API
  useEffect(() => {
    axios
      .get("https://siddha-shivalayas-backend.vercel.app") // Adjusted for hospital data
      .then((response) => {
        setTreatmentData(response?.data?.data);
      })
      .catch((error) => {
        console.error("Error fetching treatment data:", error);
      });
  }, []);

  // Filter treatment data based on selected treatment or medicine
  useEffect(() => {
    if (treatmentData) {
      setGroupData(
        treatmentData.filter(
          (d) => d.treatmentOrMedicine === formData.treatmentOrMedicine
        )
      );
    }
  }, [formData, treatmentData]);

  const handleDelete = () => {
    setLoadingDelete(true);
    axios
      .delete(
        `https://siddha-shivalayas-backend.vercel.app/patients/${formData.id}`
      )
      .then(() => {
        setDeleted(true);
        resetForm();
        setTimeout(() => {
          setDeleted(false);
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
        setLoadingDelete(false);
        setErrorMessage("Patient deletion failed");
        setSuccess(false);
      });
  };

  const handleUpdate = () => {
    setLoadingUpdate(true);

    // Create an object with only non-empty fields to send
    const updatedData = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) => value.trim() !== "")
    );

    axios
      .put(
        `https://siddha-shivalayas-backend.vercel.app/patients/${formData.id}`,
        updatedData
      )
      .then((res) => {
        setUpdated(true);
        resetForm();
        setTimeout(() => {
          setUpdated(false);
        }, 3000);
        setLoadingUpdate(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingUpdate(false);
        setErrorMessage("Patient update failed");
        setSuccess(false);
      });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    setLoadingCreate(true);
    if (!formData.id) {
      setErrorMessage("Patient ID is required");
      setSuccess(false);
      setLoadingCreate(false);
      return;
    }

    axios
      .post("https://siddha-shivalayas-backend.vercel.app/patients", formData) // Adjusted for hospital
      .then(() => {
        setSuccess(true);
        setCreated(true);
        resetForm();
        setTimeout(() => {
          setCreated(false);
          setSuccess(null);
          setErrorMessage("");
        }, 3000);
      })
      .catch((err) => {
        console.error(err);
        setSuccess(false);
        setErrorMessage("Patient creation failed");
      })
      .finally(() => setLoadingCreate(false));
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
          <strong>Patient Form</strong>
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
                InputProps={{
                  style: { borderRadius: "8px" },
                }}
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
                select
                label="Treatment or Medicine"
                name="treatmentOrMedicine"
                value={formData.treatmentOrMedicine}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                SelectProps={{
                  native: true,
                  style: { borderRadius: "8px" },
                }}
              >
                <option value=""></option>
                <option value="treatment">Treatment</option>
                <option value="medicine">Medicine</option>
                <option value="consulting">Consulting</option>
              </TextField>
            </Grid>
          </Grid>

          {/* Buttons */}
          <Grid item xs={12}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
                disabled={!isIdEntered || loadingCreate}
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
                color="warning"
                disableElevation
                disabled={!isIdEntered || loadingUpdate}
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
                disabled={!isIdEntered || loadingDelete}
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

          {/* Success/Failure Alerts */}
          <Snackbar
            open={created || deleted || updated}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            onClose={() => setCreated(false)}
          >
            <MuiAlert elevation={6} variant="filled" severity="success">
              {created
                ? "Patient created successfully!"
                : updated
                ? "Patient updated successfully!"
                : "Patient deleted successfully!"}
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
