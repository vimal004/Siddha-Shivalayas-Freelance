import React, { useState, useEffect } from "react";
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
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import designTokens from "../designTokens";
import { isAuthenticated, isAdmin, authAxios } from "../services/authService";
import { API_ENDPOINTS } from "../config/api";

const { colors, typography, borderRadius, elevation, motion, spacing } =
  designTokens;

const StockForm = () => {
  const navigate = useNavigate();
  const userIsAdmin = isAdmin();

  useEffect(() => {
    if (!isAuthenticated()) {
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

  const [updateMode, setUpdateMode] = useState("add");
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
        const response = await authAxios.get(API_ENDPOINTS.STOCKS);
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
    if (!userIsAdmin) {
      setErrorMessage("Access denied. Admin privileges required.");
      return;
    }
    setLoadingCreate(true);
    if (!formData.stockId) {
      setErrorMessage("Stock ID is required");
      setSuccess(false);
      setLoadingCreate(false);
      return;
    }
    try {
      await authAxios.post(API_ENDPOINTS.STOCKS, formData);
      setCreated(true);
      setSuccess(true);
      resetForm();
    } catch (error) {
      console.error("Error creating stock:", error);
      setSuccess(false);
      setErrorMessage(error.response?.data?.message || "Stock creation failed");
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleUpdate = async () => {
    if (!userIsAdmin) {
      setErrorMessage("Access denied. Admin privileges required.");
      return;
    }
    setLoadingUpdate(true);
    try {
      const payload = { ...formData, updateMode };
      await authAxios.put(
        `${API_ENDPOINTS.STOCKS}/${formData.stockId}`,
        payload
      );
      setUpdated(true);
      setSuccess(true);
      resetForm();
    } catch (error) {
      console.error("Error updating stock:", error);
      setSuccess(false);
      setErrorMessage(error.response?.data?.message || "Stock update failed");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleDelete = async () => {
    if (!userIsAdmin) {
      setErrorMessage("Access denied. Admin privileges required.");
      return;
    }
    setLoadingDelete(true);
    try {
      await authAxios.delete(`${API_ENDPOINTS.STOCKS}/${formData.stockId}`);
      setDeleted(true);
      setSuccess(true);
      resetForm();
    } catch (error) {
      console.error("Error deleting stock:", error);
      setSuccess(false);
      setErrorMessage(error.response?.data?.message || "Stock deletion failed");
    } finally {
      setLoadingDelete(false);
    }
  };

  const isStockIdEntered = formData.stockId.trim() !== "";

  const formFields = [
    { key: "stockId", label: "Stock ID", required: true },
    { key: "productName", label: "Product Name" },
    { key: "quantity", label: "Quantity", type: "number" },
    { key: "price", label: "Price (₹)", type: "number" },
    { key: "hsnCode", label: "HSN Code" },
    { key: "discount", label: "Discount (%)", type: "number" },
    { key: "gst", label: "GST (%)", type: "number" },
  ];

  // Show access denied message for non-admin users
  if (!userIsAdmin) {
    return (
      <PageWrapper>
        <Container maxWidth="md">
          <ContentCard>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: alpha(colors.error.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                  mb: 3,
                }}
              >
                <LockIcon sx={{ fontSize: 40, color: colors.error.main }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: typography.fontFamily.display,
                  fontSize: typography.fontSize["2xl"],
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  mb: 2,
                }}
              >
                Access Restricted
              </Typography>
              <Typography
                sx={{
                  fontFamily: typography.fontFamily.primary,
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  mb: 4,
                }}
              >
                You do not have permission to manage stocks. Please contact an
                administrator.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/viewstocks")}
                sx={{
                  fontFamily: typography.fontFamily.primary,
                  textTransform: "none",
                  borderRadius: borderRadius.button,
                }}
              >
                View Inventory Instead
              </Button>
            </Box>
          </ContentCard>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="md">
        <ContentCard>
          {/* Header Section */}
          <HeaderSection>
            <HeaderIcon>
              <InventoryIcon
                sx={{ fontSize: 24, color: colors.primary.main }}
              />
            </HeaderIcon>
            <Box>
              <PageTitle>Stock Management</PageTitle>
              <PageSubtitle>
                Create, update, or delete product stock entries
              </PageSubtitle>
            </Box>
          </HeaderSection>

          {/* Search Existing Stock */}
          <SearchSection>
            <StyledAutocomplete
              options={stocks}
              getOptionLabel={(option) => option.productName || ""}
              onChange={handleAutocompleteChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search existing stock by product name..."
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon
                          sx={{
                            color: colors.text.tertiary,
                            fontSize: 20,
                            ml: 1,
                            mr: 0.5,
                          }}
                        />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </SearchSection>

          {/* Form */}
          <form onSubmit={handleCreate}>
            <FormSection>
              <Grid container spacing={3}>
                {formFields.map((field) => (
                  <Grid item xs={12} sm={6} md={4} key={field.key}>
                    <StyledTextField
                      label={field.label}
                      name={field.key}
                      value={formData[field.key]}
                      onChange={handleChange}
                      variant="outlined"
                      fullWidth
                      required={field.required}
                      type={field.type || "text"}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormSection>

            {/* Update Mode Selection */}
            <UpdateModeSection>
              <StyledFormControl component="fieldset">
                <StyledFormLabel component="legend">
                  Update Mode
                </StyledFormLabel>
                <RadioGroup
                  row
                  value={updateMode}
                  onChange={(e) => setUpdateMode(e.target.value)}
                >
                  <StyledFormControlLabel
                    value="add"
                    control={<StyledRadio />}
                    label="Add to existing quantity"
                  />
                  <StyledFormControlLabel
                    value="set"
                    control={<StyledRadio />}
                    label="Set exact quantity"
                  />
                </RadioGroup>
              </StyledFormControl>
            </UpdateModeSection>

            {/* Action Buttons */}
            <ActionSection>
              <CreateButton
                type="submit"
                variant="contained"
                disabled={!isStockIdEntered || loadingCreate}
                startIcon={!loadingCreate && <AddIcon />}
              >
                {loadingCreate ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  "Create Stock"
                )}
              </CreateButton>
              <UpdateButton
                variant="outlined"
                disabled={!isStockIdEntered || loadingUpdate}
                onClick={handleUpdate}
                startIcon={!loadingUpdate && <EditIcon />}
              >
                {loadingUpdate ? <CircularProgress size={22} /> : "Update"}
              </UpdateButton>
              <DeleteButton
                variant="text"
                disabled={!isStockIdEntered || loadingDelete}
                onClick={handleDelete}
                startIcon={!loadingDelete && <DeleteIcon />}
              >
                {loadingDelete ? <CircularProgress size={22} /> : "Delete"}
              </DeleteButton>
            </ActionSection>
          </form>

          {/* Snackbars */}
          <Snackbar
            open={success}
            autoHideDuration={3000}
            onClose={() => setSuccess(false)}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              severity="success"
              variant="filled"
              sx={{
                borderRadius: borderRadius.md,
                fontFamily: typography.fontFamily.primary,
              }}
            >
              {created
                ? "Stock created successfully!"
                : updated
                ? "Stock updated successfully!"
                : deleted
                ? "Stock deleted successfully!"
                : ""}
            </Alert>
          </Snackbar>

          <Snackbar
            open={!!errorMessage}
            autoHideDuration={3000}
            onClose={() => setErrorMessage("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              severity="error"
              variant="filled"
              sx={{
                borderRadius: borderRadius.md,
                fontFamily: typography.fontFamily.primary,
              }}
            >
              {errorMessage}
            </Alert>
          </Snackbar>
        </ContentCard>
      </Container>
    </PageWrapper>
  );
};

// Styled Components

const PageWrapper = styled(Box)({
  minHeight: "100vh",
  backgroundColor: colors.surface.container,
  paddingTop: spacing[8],
  paddingBottom: spacing[12],
});

const ContentCard = styled(Box)({
  backgroundColor: colors.surface.background,
  borderRadius: borderRadius.cardLg,
  boxShadow: elevation.card,
  padding: spacing[10],
  animation: "fadeInUp 0.5s cubic-bezier(0, 0, 0, 1)",
  "@media (max-width: 600px)": {
    padding: spacing[6],
    borderRadius: borderRadius.lg,
  },
});

const HeaderSection = styled(Box)({
  display: "flex",
  alignItems: "flex-start",
  gap: spacing[4],
  marginBottom: spacing[8],
});

const HeaderIcon = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "48px",
  height: "48px",
  borderRadius: borderRadius.lg,
  backgroundColor: colors.primary.surface,
  flexShrink: 0,
});

const PageTitle = styled(Typography)({
  fontFamily: typography.fontFamily.display,
  fontSize: "clamp(1.5rem, 4vw, 2rem)",
  fontWeight: typography.fontWeight.regular,
  color: colors.text.primary,
  letterSpacing: "-0.01em",
  marginBottom: spacing[1],
});

const PageSubtitle = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.base,
  color: colors.text.secondary,
});

const SearchSection = styled(Box)({
  marginBottom: spacing[8],
});

const StyledAutocomplete = styled(Autocomplete)({
  "& .MuiOutlinedInput-root": {
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface.container,
    fontFamily: typography.fontFamily.primary,
    transition: motion.transition.fast,
    "& fieldset": {
      borderColor: "transparent",
    },
    "&:hover fieldset": {
      borderColor: colors.border.medium,
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.primary.main,
      borderWidth: "2px",
    },
    "&.Mui-focused": {
      backgroundColor: colors.surface.background,
      boxShadow: elevation.level1,
    },
  },
  "& .MuiInputBase-input": {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    padding: "12px 14px !important",
    "&::placeholder": {
      color: colors.text.tertiary,
      opacity: 1,
    },
  },
});

const FormSection = styled(Box)({
  marginBottom: spacing[6],
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: borderRadius.input,
    backgroundColor: colors.surface.container,
    fontFamily: typography.fontFamily.primary,
    transition: motion.transition.fast,
    "& fieldset": {
      borderColor: "transparent",
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
    padding: "16px",
    "&::placeholder": {
      color: colors.text.tertiary,
      opacity: 1,
    },
  },
});

const UpdateModeSection = styled(Box)({
  marginBottom: spacing[8],
  padding: spacing[5],
  backgroundColor: colors.surface.container,
  borderRadius: borderRadius.lg,
});

const StyledFormControl = styled(FormControl)({
  width: "100%",
});

const StyledFormLabel = styled(FormLabel)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
  marginBottom: spacing[2],
  "&.Mui-focused": {
    color: colors.text.primary,
  },
});

const StyledFormControlLabel = styled(FormControlLabel)({
  "& .MuiFormControlLabel-label": {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
});

const StyledRadio = styled(Radio)({
  color: colors.border.dark,
  "&.Mui-checked": {
    color: colors.primary.main,
  },
});

const ActionSection = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: spacing[3],
  justifyContent: "flex-start",
});

const CreateButton = styled(Button)({
  padding: "12px 28px",
  borderRadius: borderRadius.button,
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
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

const UpdateButton = styled(Button)({
  padding: "12px 28px",
  borderRadius: borderRadius.button,
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  textTransform: "none",
  color: colors.warning.main,
  borderColor: colors.warning.main,
  transition: motion.transition.normal,
  "&:hover": {
    backgroundColor: alpha(colors.warning.main, 0.08),
    borderColor: colors.warning.main,
  },
  "&:disabled": {
    borderColor: colors.border.medium,
    color: colors.text.disabled,
  },
});

const DeleteButton = styled(Button)({
  padding: "12px 28px",
  borderRadius: borderRadius.button,
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  textTransform: "none",
  color: colors.error.main,
  transition: motion.transition.normal,
  "&:hover": {
    backgroundColor: alpha(colors.error.main, 0.08),
  },
  "&:disabled": {
    color: colors.text.disabled,
  },
});

export default StockForm;
