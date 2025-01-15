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
  Box,
  InputAdornment,
} from "@mui/material";
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BGIMG from "../img/bg.jpg";
import { styled, useTheme, alpha } from "@mui/material/styles";

const LoginForm = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    axios
      .post("https://vcf-backend.vercel.app/login", {
        email: formData.email,
        password: formData.password,
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
    <PageWrapper theme={theme}>
      <Container maxWidth="sm">
        <LoginCard>
          <Box mb={4} textAlign="center">
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Poppins", sans-serif',
                fontWeight: 600,
                background: "linear-gradient(45deg, #1976d2, #2196f3)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "8px",
              }}
            >
              Welcome Back!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontFamily: '"Poppins", sans-serif',
              }}
            >
              Please enter your credentials to continue
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <StyledTextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: "primary.main" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: "primary.main" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <LoginButton
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? null : <LoginIcon />}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Sign In"
                  )}
                </LoginButton>
              </Grid>
            </Grid>
          </form>
        </LoginCard>
      </Container>

      <CustomSnackbar
        open={success === true}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          elevation={6}
          variant="filled"
          severity="success"
          sx={{ width: "100%" }}
        >
          Login successful
        </Alert>
      </CustomSnackbar>

      <CustomSnackbar
        open={success === false}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          elevation={6}
          variant="filled"
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </CustomSnackbar>
    </PageWrapper>
  );
};

// Styled Components
const PageWrapper = styled("div")(({ theme }) => ({
  backgroundImage: `url(${BGIMG})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.2
  )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
}));

const LoginCard = styled(Box)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.98)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  padding: "40px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  width: "100%",
  maxWidth: "480px",
  margin: "0 auto",
  transition: "transform 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.03)",
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.palette.primary.main,
        borderWidth: "2px",
      },
    },
  },
  "& .MuiInputLabel-root": {
    fontFamily: '"Poppins", sans-serif',
  },
  "& input": {
    fontFamily: '"Poppins", sans-serif',
    padding: "16px 14px",
  },
}));

const LoginButton = styled(Button)(({ theme }) => ({
  background: "linear-gradient(45deg, #1976d2, #2196f3)",
  color: "white",
  padding: "12px",
  borderRadius: "12px",
  textTransform: "none",
  fontSize: "1rem",
  fontWeight: 600,
  fontFamily: '"Poppins", sans-serif',
  boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(45deg, #1565c0, #1976d2)",
    transform: "translateY(-2px)",
    boxShadow: "0 6px 16px rgba(25, 118, 210, 0.2)",
  },
  "&:disabled": {
    background: "linear-gradient(45deg, #bdbdbd, #e0e0e0)",
  },
}));

const CustomSnackbar = styled(Snackbar)({
  "& .MuiAlert-root": {
    borderRadius: "12px",
    fontFamily: '"Poppins", sans-serif',
  },
});

export default LoginForm;
