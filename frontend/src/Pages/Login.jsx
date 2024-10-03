import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
  Grid,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BGIMG from "../img/img3.jpg"; // Import the background image

const LoginForm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    const { email, password } = formData;

    axios
      .post("https://vcf-backend.vercel.app/login", {
        email,
        password,
      })
      .then((res) => {
        setLoading(false);
        setSuccess(true);
        localStorage.setItem("token", res.data.email);
        navigate("/home");
      })
      .catch((err) => {
        setLoading(false);
        setSuccess(false);
        setErrorMessage(err.response?.data?.message || "Login failed");
      });
  };

  return (
    <div
      style={{
        backgroundImage: `url(${BGIMG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Container maxWidth="sm" style={{ marginTop: "-200px" }}>
        <div
          style={{
            background: "#ffffff",
            boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
            padding: "24px",
            borderRadius: "8px",
            width: "100%", // Ensure full width on smaller screens
          }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            <strong>Authorize Yourself!</strong>
          </Typography>
          <form onSubmit={handleLogin}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
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
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
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
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disableElevation
                    disabled={loading}
                    style={{
                      borderRadius: "8px",
                      textTransform: "none",
                      minWidth: "150px",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </div>
              </Grid>
            </Grid>
          </form>
          {success === true && (
            <Snackbar open={true} autoHideDuration={3000}>
              <Alert elevation={6} variant="filled" severity="success">
                Login successful
              </Alert>
            </Snackbar>
          )}
          {success === false && (
            <Snackbar open={true} autoHideDuration={3000}>
              <Alert elevation={6} variant="filled" severity="error">
                {errorMessage}
              </Alert>
            </Snackbar>
          )}
        </div>
      </Container>
    </div>
  );
};

export default LoginForm;
