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
  Alert,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import designTokens from "../designTokens";

const { colors, typography, borderRadius, elevation, motion, spacing } =
  designTokens;

const PatientForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
    age: "",
    date: "",
  });

  const [patients, setPatients] = useState([]);
  const [created, setCreated] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [isExistingPatient, setIsExistingPatient] = useState(false);

  const fetchPatientsAndSetNextId = () => {
    axios
      .get("https://siddha-shivalayas-backend.vercel.app/patients")
      .then((response) => {
        const fetchedPatients = response.data;
        setPatients(fetchedPatients);

        let nextId = "1";
        if (fetchedPatients.length > 0) {
          const numericIds = fetchedPatients
            .map((p) => parseInt(p.id, 10))
            .filter((id) => !isNaN(id));
          if (numericIds.length > 0) {
            const maxId = Math.max(...numericIds);
            nextId = String(maxId + 1);
          }
        }

        setFormData({
          id: nextId,
          name: "",
          phone: "",
          address: "",
          age: "",
          date: "",
        });
        setIsExistingPatient(false);
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
        setErrorMessage("Could not fetch patient data.");
      });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    } else {
      fetchPatientsAndSetNextId();
    }
  }, [navigate]);

  const handleDelete = () => {
    setLoadingDelete(true);
    axios
      .delete(
        `https://siddha-shivalayas-backend.vercel.app/patients/${formData.id}`
      )
      .then(() => {
        setDeleted(true);
        setSuccess(true);
        fetchPatientsAndSetNextId();
        setLoadingDelete(false);
        setTimeout(() => setDeleted(false), 3000);
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
    axios
      .put(
        `https://siddha-shivalayas-backend.vercel.app/patients/${formData.id}`,
        formData
      )
      .then(() => {
        setUpdated(true);
        setSuccess(true);
        fetchPatientsAndSetNextId();
        setLoadingUpdate(false);
        setTimeout(() => setUpdated(false), 3000);
      })
      .catch((err) => {
        console.error(err);
        setLoadingUpdate(false);
        setErrorMessage("Patient update failed");
        setSuccess(false);
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
      .post("https://siddha-shivalayas-backend.vercel.app/patients", formData)
      .then(() => {
        setCreated(true);
        setSuccess(true);
        fetchPatientsAndSetNextId();
        setLoadingCreate(false);
        setTimeout(() => setCreated(false), 3000);
      })
      .catch((err) => {
        console.error(err);
        setSuccess(false);
        setErrorMessage("Patient creation failed");
        setLoadingCreate(false);
      });
  };

  const handleAutocompleteChange = (event, value) => {
    if (value) {
      setFormData(value);
      setIsExistingPatient(true);
    } else {
      fetchPatientsAndSetNextId();
    }
  };

  const isIdEntered = formData.id.trim() !== "";

  return (
    <PageWrapper>
      <Container maxWidth="md">
        <ContentCard>
          {/* Header Section */}
          <HeaderSection>
            <PageTitle>
              {isExistingPatient ? "Update Patient" : "New Patient"}
            </PageTitle>
            <PageSubtitle>
              {isExistingPatient
                ? "Edit the patient details below"
                : "Fill in the details to create a new patient record"}
            </PageSubtitle>
          </HeaderSection>

          {/* Search Existing Patient */}
          <SearchSection>
            <StyledAutocomplete
              options={patients}
              getOptionLabel={(option) =>
                `#${option.id} - ${option.name}` || ""
              }
              onChange={handleAutocompleteChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search existing patient by ID or name..."
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
                <Grid item xs={12} sm={6} md={4}>
                  <StyledTextField
                    label="Patient ID"
                    name="id"
                    value={formData.id}
                    variant="outlined"
                    fullWidth
                    required
                    InputProps={{
                      readOnly: true,
                    }}
                    helperText="Auto-generated for new patients"
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StyledTextField
                    label="Patient Name"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    variant="outlined"
                    fullWidth
                    placeholder="Enter patient name"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StyledTextField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    variant="outlined"
                    fullWidth
                    placeholder="Enter phone number"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StyledTextField
                    label="Age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                    variant="outlined"
                    fullWidth
                    inputProps={{ min: 0, max: 150 }}
                    placeholder="Enter age"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    label="Address"
                    name="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    variant="outlined"
                    fullWidth
                    placeholder="Enter address"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StyledTextField
                    label="Date"
                    name="date"
                    type="date"
                    value={formData.date ? formData.date.split("T")[0] : ""}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    variant="outlined"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </FormSection>

            {/* Action Buttons */}
            <ActionSection>
              <CreateButton
                type="submit"
                variant="contained"
                disabled={!isIdEntered || loadingCreate || isExistingPatient}
                startIcon={!loadingCreate && <PersonAddIcon />}
              >
                {loadingCreate ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  "Create Patient"
                )}
              </CreateButton>
              <UpdateButton
                variant="outlined"
                disabled={!isIdEntered || loadingUpdate || !isExistingPatient}
                onClick={handleUpdate}
                startIcon={!loadingUpdate && <EditIcon />}
              >
                {loadingUpdate ? <CircularProgress size={22} /> : "Update"}
              </UpdateButton>
              <DeleteButton
                variant="text"
                disabled={!isIdEntered || loadingDelete || !isExistingPatient}
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
                ? "Patient created successfully!"
                : updated
                ? "Patient updated successfully!"
                : deleted
                ? "Patient deleted successfully!"
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
  marginBottom: spacing[8],
});

const PageTitle = styled(Typography)({
  fontFamily: typography.fontFamily.display,
  fontSize: "clamp(1.5rem, 4vw, 2rem)",
  fontWeight: typography.fontWeight.regular,
  color: colors.text.primary,
  letterSpacing: "-0.01em",
  marginBottom: spacing[2],
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
  marginBottom: spacing[8],
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
    "&.Mui-disabled": {
      backgroundColor: colors.surface.containerHigh,
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
  "& .MuiFormHelperText-root": {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: "4px",
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

export default PatientForm;
