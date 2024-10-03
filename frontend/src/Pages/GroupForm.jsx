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

const GroupForm = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    group: "",
    groupname: "",
    months: "",
    startmonth: "",
  });

  const resetForm = () => {
    setFormData({
      group: "",
      groupname: "",
      months: "",
      startmonth: "",
    });
  };

  const [created, setCreated] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [success, setSuccess] = useState(null);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Fetch data or perform any initialization here
  }, []); // Adjust according to your needs

  const handleDelete = () => {
    setLoadingDelete(true);
    axios
      .delete("https://vcf-backend.vercel.app/group", {
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          group: formData.group,
        },
      })
      .then(() => {
        setDeleted(true);
        resetForm();
        setTimeout(() => {
          setDeleted(false);
        }, 3000);
      })
      .catch((err) => {
        console.error("Error deleting group:", err);
        setErrorMessage("Group deletion failed");
        setSuccess(false);
      })
      .finally(() => setLoadingDelete(false));
  };

  const handleUpdate = () => {
    setLoadingUpdate(true);
    axios
      .put("https://vcf-backend.vercel.app/group", formData)
      .then(() => {
        setUpdated(true);
        resetForm();
        setTimeout(() => {
          setUpdated(false);
        }, 3000);
      })
      .catch((err) => {
        console.error("Error updating group:", err);
        setErrorMessage("Group update failed");
        setSuccess(false);
      })
      .finally(() => setLoadingUpdate(false));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoadingCreate(true);
    axios
      .post("https://vcf-backend.vercel.app/group", formData)
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
        console.error("Error creating group:", err);
        setSuccess(false);
        setErrorMessage("Group creation failed");
      })
      .finally(() => setLoadingCreate(false));
  };

  const isIdEntered = formData.group.trim() !== "";

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
          <strong>Group Form</strong>
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Group Number"
                name="group"
                value={formData.group}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
                InputProps={{
                  style: { borderRadius: "8px" },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Group Name"
                name="groupname"
                value={formData.groupname}
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
                label="Months"
                name="months"
                value={formData.months}
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
                label="Starting Month"
                name="startmonth"
                value={formData.startmonth}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                InputProps={{
                  style: { borderRadius: "8px" },
                }}
              />
            </Grid>
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
                  color="secondary"
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
          </Grid>
          <Snackbar
            open={created || deleted || updated}
            autoHideDuration={3000}
            onClose={() => {
              setCreated(false);
              setDeleted(false);
              setUpdated(false);
            }}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              severity="success"
              onClose={() => {
                setCreated(false);
                setDeleted(false);
                setUpdated(false);
              }}
            >
              {created && "Group Created"}
              {deleted && "Group Record Deleted"}
              {updated && "Group Record Updated"}
            </MuiAlert>
          </Snackbar>
          {success === false && (
            <Snackbar open={true} autoHideDuration={3000}>
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

export default GroupForm;
