import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Container,
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
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { styled, alpha } from "@mui/material/styles";
import designTokens from "../designTokens";
import logo from "../img/Logo.svg";

const { colors, typography, borderRadius, elevation, motion, spacing } =
  designTokens;

const LoginForm = () => {
  const navigate = useNavigate();
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
    <PageWrapper>
      <Container maxWidth="sm">
        <LoginCard>
          {/* Logo & Branding */}
          <LogoSection>
            <LogoImage src={logo} alt="Shivalayas Siddha" />
            <BrandName>Shivalayas Siddha</BrandName>
          </LogoSection>

          {/* Welcome Text */}
          <WelcomeSection>
            <WelcomeTitle>Welcome back</WelcomeTitle>
            <WelcomeSubtitle>Sign in to access your dashboard</WelcomeSubtitle>
          </WelcomeSection>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <FormGroup>
              <StyledTextField
                label="Email address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
                placeholder="Enter your email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon
                        sx={{ color: colors.text.tertiary, fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <StyledTextField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                fullWidth
                required
                placeholder="Enter your password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon
                        sx={{ color: colors.text.tertiary, fontSize: 20 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <LoginButton
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                endIcon={!loading && <ArrowForwardIcon />}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  "Sign in"
                )}
              </LoginButton>
            </FormGroup>
          </form>

          {/* Footer */}
          <FooterText>Siddha Healthcare Management System</FooterText>
        </LoginCard>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={success === true}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSuccess(null)}
      >
        <Alert
          variant="filled"
          severity="success"
          sx={{
            borderRadius: borderRadius.md,
            fontFamily: typography.fontFamily.primary,
          }}
        >
          Login successful! Redirecting...
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={success === false}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSuccess(null)}
      >
        <Alert
          variant="filled"
          severity="error"
          sx={{
            borderRadius: borderRadius.md,
            fontFamily: typography.fontFamily.primary,
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </PageWrapper>
  );
};

// Styled Components

const PageWrapper = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: colors.surface.container,
  padding: spacing[6],
});

const LoginCard = styled(Box)({
  backgroundColor: colors.surface.background,
  borderRadius: borderRadius.cardLg,
  boxShadow: elevation.level3,
  padding: spacing[10],
  width: "100%",
  maxWidth: "420px",
  margin: "0 auto",
  animation: "fadeInUp 0.5s cubic-bezier(0, 0, 0, 1)",
  "@media (max-width: 600px)": {
    padding: spacing[8],
    borderRadius: borderRadius.card,
  },
});

const LogoSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing[3],
  marginBottom: spacing[8],
});

const LogoImage = styled("img")({
  height: "48px",
  width: "auto",
});

const BrandName = styled(Typography)({
  fontFamily: typography.fontFamily.display,
  fontSize: typography.fontSize.xl,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
  letterSpacing: "-0.01em",
});

const WelcomeSection = styled(Box)({
  textAlign: "center",
  marginBottom: spacing[8],
});

const WelcomeTitle = styled(Typography)({
  fontFamily: typography.fontFamily.display,
  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
  fontWeight: typography.fontWeight.regular,
  color: colors.text.primary,
  marginBottom: spacing[2],
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
});

const WelcomeSubtitle = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.regular,
  color: colors.text.secondary,
  lineHeight: 1.5,
});

const FormGroup = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: spacing[5],
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: borderRadius.input,
    backgroundColor: colors.surface.container,
    fontFamily: typography.fontFamily.primary,
    transition: motion.transition.fast,
    "& fieldset": {
      borderColor: "transparent",
      borderWidth: "1px",
    },
    "&:hover fieldset": {
      borderColor: colors.border.medium,
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.primary.main,
      borderWidth: "2px",
    },
    "&.Mui-focused": {
      backgroundColor: alpha(colors.primary.main, 0.02),
    },
  },
  "& .MuiInputLabel-root": {
    fontFamily: typography.fontFamily.primary,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    "&.Mui-focused": {
      color: colors.primary.main,
    },
  },
  "& .MuiInputBase-input": {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.base,
    padding: "16px 14px",
  },
  "& .MuiInputBase-input::placeholder": {
    color: colors.text.tertiary,
    opacity: 1,
  },
});

const LoginButton = styled(Button)({
  marginTop: spacing[2],
  padding: "14px 24px",
  borderRadius: borderRadius.button,
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.medium,
  textTransform: "none",
  backgroundColor: colors.primary.main,
  color: colors.primary.onPrimary,
  boxShadow: "none",
  transition: motion.transition.normal,
  "&:hover": {
    backgroundColor: colors.primary.dark,
    boxShadow: elevation.buttonHover,
  },
  "&:disabled": {
    backgroundColor: colors.border.medium,
    color: colors.text.disabled,
  },
});

const FooterText = styled(Typography)({
  marginTop: spacing[8],
  textAlign: "center",
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.regular,
  color: colors.text.tertiary,
});

export default LoginForm;
