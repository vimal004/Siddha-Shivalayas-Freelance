import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useFetchData from "./FetchData";
import {
  TextField,
  CircularProgress,
  Typography,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  InputAdornment,
  Chip,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Search as SearchIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import designTokens from "../designTokens";
import { isAuthenticated } from "../services/authService";
import { API_ENDPOINTS } from "../config/api";

const { colors, typography, borderRadius, elevation, motion, spacing } =
  designTokens;

const AllPatients = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const {
    data: customers,
    loading,
    error,
  } = useFetchData(API_ENDPOINTS.PATIENTS);

  const [nameFilter, setNameFilter] = useState("");

  const handleFilterChange = (e) => {
    setNameFilter(e.target.value);
  };

  const filteredCustomers = customers.filter((customer) => {
    const name = customer.name || "";
    return name.toLowerCase().includes(nameFilter.toLowerCase());
  });

  const formatDateToIndian = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date
      .toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
  };

  return (
    <PageWrapper>
      <Container maxWidth="lg">
        <ContentCard>
          {/* Header Section */}
          <HeaderSection>
            <PageTitle>Patient Records</PageTitle>
            <PatientCount>
              {filteredCustomers.length}{" "}
              {filteredCustomers.length === 1 ? "patient" : "patients"}
            </PatientCount>
          </HeaderSection>

          {/* Search Section */}
          <SearchSection>
            <SearchField
              value={nameFilter}
              onChange={handleFilterChange}
              placeholder="Search patients by name..."
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon
                      sx={{ color: colors.text.tertiary, fontSize: 20 }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </SearchSection>

          {/* Content Area */}
          {loading ? (
            <LoadingContainer>
              <CircularProgress sx={{ color: colors.primary.main }} />
              <LoadingText>Loading patient records...</LoadingText>
            </LoadingContainer>
          ) : error ? (
            <ErrorContainer>
              <ErrorText>Error loading data: {error}</ErrorText>
            </ErrorContainer>
          ) : (
            <TableWrapper>
              <StyledTableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableHeadCell>ID</StyledTableHeadCell>
                      <StyledTableHeadCell>Name</StyledTableHeadCell>
                      <StyledTableHeadCell>Phone</StyledTableHeadCell>
                      <StyledTableHeadCell>Age</StyledTableHeadCell>
                      <StyledTableHeadCell>Address</StyledTableHeadCell>
                      <StyledTableHeadCell>Date</StyledTableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map((customer) => (
                        <StyledTableRow key={customer.id}>
                          <StyledTableCell>
                            <PatientIdLink to={`/customers/${customer.id}`}>
                              #{customer.id}
                            </PatientIdLink>
                          </StyledTableCell>
                          <StyledTableCell>
                            <PatientName>
                              <PatientAvatar>
                                <PersonIcon sx={{ fontSize: 16 }} />
                              </PatientAvatar>
                              {customer.name}
                            </PatientName>
                          </StyledTableCell>
                          <StyledTableCell>
                            {customer.phone || "—"}
                          </StyledTableCell>
                          <StyledTableCell>
                            {customer.age ? (
                              <AgeChip label={`${customer.age} yrs`} />
                            ) : (
                              "—"
                            )}
                          </StyledTableCell>
                          <StyledTableCell>
                            <AddressText>{customer.address || "—"}</AddressText>
                          </StyledTableCell>
                          <StyledTableCell>
                            <DateText>
                              {formatDateToIndian(customer.date)}
                            </DateText>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))
                    ) : (
                      <TableRow>
                        <StyledTableCell colSpan={6}>
                          <EmptyState>
                            <EmptyStateIcon>
                              <PersonIcon
                                sx={{
                                  fontSize: 48,
                                  color: colors.text.disabled,
                                }}
                              />
                            </EmptyStateIcon>
                            <EmptyStateText>No patients found</EmptyStateText>
                            <EmptyStateSubtext>
                              Try adjusting your search criteria
                            </EmptyStateSubtext>
                          </EmptyState>
                        </StyledTableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </TableWrapper>
          )}
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
  padding: spacing[8],
  animation: "fadeInUp 0.5s cubic-bezier(0, 0, 0, 1)",
  "@media (max-width: 600px)": {
    padding: spacing[5],
    borderRadius: borderRadius.lg,
  },
});

const HeaderSection = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing[6],
  flexWrap: "wrap",
  gap: spacing[3],
});

const PageTitle = styled(Typography)({
  fontFamily: typography.fontFamily.display,
  fontSize: "clamp(1.5rem, 4vw, 2rem)",
  fontWeight: typography.fontWeight.regular,
  color: colors.text.primary,
  letterSpacing: "-0.01em",
});

const PatientCount = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.secondary,
  padding: "6px 12px",
  backgroundColor: colors.surface.container,
  borderRadius: borderRadius.full,
});

const SearchSection = styled(Box)({
  marginBottom: spacing[6],
});

const SearchField = styled(TextField)({
  maxWidth: "400px",
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
    padding: "12px 14px",
    "&::placeholder": {
      color: colors.text.tertiary,
      opacity: 1,
    },
  },
});

const LoadingContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: spacing[16],
  gap: spacing[4],
});

const LoadingText = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
});

const ErrorContainer = styled(Box)({
  padding: spacing[8],
  textAlign: "center",
  backgroundColor: colors.error.surface,
  borderRadius: borderRadius.lg,
});

const ErrorText = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.base,
  color: colors.error.main,
});

const TableWrapper = styled(Box)({
  overflowX: "auto",
});

const StyledTableContainer = styled(TableContainer)({
  borderRadius: borderRadius.lg,
  border: `1px solid ${colors.border.light}`,
  boxShadow: "none",
});

const StyledTableHeadCell = styled(TableCell)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
  backgroundColor: colors.surface.container,
  borderBottom: `1px solid ${colors.border.light}`,
  padding: "16px 20px",
  whiteSpace: "nowrap",
});

const StyledTableRow = styled(TableRow)({
  transition: motion.transition.fast,
  "&:hover": {
    backgroundColor: colors.hover,
  },
  "&:last-child td": {
    borderBottom: "none",
  },
});

const StyledTableCell = styled(TableCell)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.regular,
  color: colors.text.primary,
  borderBottom: `1px solid ${colors.border.light}`,
  padding: "14px 20px",
});

const PatientIdLink = styled(Link)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.primary.main,
  textDecoration: "none",
  transition: motion.transition.fast,
  "&:hover": {
    color: colors.primary.dark,
    textDecoration: "underline",
  },
});

const PatientName = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: spacing[3],
});

const PatientAvatar = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  borderRadius: borderRadius.full,
  backgroundColor: colors.primary.surface,
  color: colors.primary.main,
});

const AgeChip = styled(Chip)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.xs,
  fontWeight: typography.fontWeight.medium,
  height: "24px",
  backgroundColor: colors.surface.container,
  color: colors.text.secondary,
  "& .MuiChip-label": {
    padding: "0 8px",
  },
});

const AddressText = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
  maxWidth: "200px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const DateText = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  color: colors.text.tertiary,
});

const EmptyState = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: spacing[12],
  gap: spacing[3],
});

const EmptyStateIcon = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "80px",
  height: "80px",
  borderRadius: borderRadius.full,
  backgroundColor: colors.surface.container,
});

const EmptyStateText = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
});

const EmptyStateSubtext = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
});

export default AllPatients;
