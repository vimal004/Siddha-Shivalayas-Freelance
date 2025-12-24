import React, { useEffect, useState } from "react";
import useFetchData from "./FetchData";
import {
  CircularProgress,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Search as SearchIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import designTokens from "../designTokens";

const { colors, typography, borderRadius, elevation, motion, spacing } =
  designTokens;

const ViewStocks = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const {
    data: groups,
    loading,
    error,
  } = useFetchData("https://siddha-shivalayas-backend.vercel.app/stocks");

  const [searchTerm, setSearchTerm] = useState("");

  const filteredStocks = groups.filter((group) =>
    group.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (quantity) => {
    if (quantity <= 0) return { label: "Out of Stock", color: "error" };
    if (quantity <= 10) return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  return (
    <PageWrapper>
      <Container maxWidth="lg">
        <ContentCard>
          {/* Header Section */}
          <HeaderSection>
            <Box>
              <PageTitle>Product Inventory</PageTitle>
              <PageSubtitle>
                Manage and track your product stock levels
              </PageSubtitle>
            </Box>
            <StockCount>
              {filteredStocks.length}{" "}
              {filteredStocks.length === 1 ? "product" : "products"}
            </StockCount>
          </HeaderSection>

          {/* Search Section */}
          <SearchSection>
            <SearchField
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by name..."
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
              <LoadingText>Loading inventory...</LoadingText>
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
                      <StyledTableHeadCell>Product ID</StyledTableHeadCell>
                      <StyledTableHeadCell>Product Name</StyledTableHeadCell>
                      <StyledTableHeadCell align="right">
                        Quantity
                      </StyledTableHeadCell>
                      <StyledTableHeadCell align="right">
                        Price
                      </StyledTableHeadCell>
                      <StyledTableHeadCell align="right">
                        Discount
                      </StyledTableHeadCell>
                      <StyledTableHeadCell align="right">
                        GST
                      </StyledTableHeadCell>
                      <StyledTableHeadCell>Status</StyledTableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredStocks.length > 0 ? (
                      filteredStocks.map((group) => {
                        const status = getStockStatus(group.quantity);
                        return (
                          <StyledTableRow key={group.stockId}>
                            <StyledTableCell>
                              <ProductId>#{group.stockId}</ProductId>
                            </StyledTableCell>
                            <StyledTableCell>
                              <ProductName>
                                <ProductIcon>
                                  <InventoryIcon sx={{ fontSize: 16 }} />
                                </ProductIcon>
                                {group.productName}
                              </ProductName>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <QuantityValue lowStock={group.quantity <= 10}>
                                {group.quantity}
                              </QuantityValue>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <PriceValue>₹{group.price.toFixed(2)}</PriceValue>
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <DiscountChip label={`${group.discount}%`} />
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <GstText>{group.gst}%</GstText>
                            </StyledTableCell>
                            <StyledTableCell>
                              <StatusChip
                                label={status.label}
                                statusColor={status.color}
                              />
                            </StyledTableCell>
                          </StyledTableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <StyledTableCell colSpan={7}>
                          <EmptyState>
                            <EmptyStateIcon>
                              <InventoryIcon
                                sx={{
                                  fontSize: 48,
                                  color: colors.text.disabled,
                                }}
                              />
                            </EmptyStateIcon>
                            <EmptyStateText>No products found</EmptyStateText>
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
  alignItems: "flex-start",
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
  marginBottom: spacing[1],
});

const PageSubtitle = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
});

const StockCount = styled(Typography)({
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

const ProductId = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.primary.main,
});

const ProductName = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: spacing[3],
});

const ProductIcon = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
  borderRadius: borderRadius.sm,
  backgroundColor: colors.primary.surface,
  color: colors.primary.main,
});

const QuantityValue = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "lowStock",
})(({ lowStock }) => ({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: lowStock ? colors.warning.main : colors.text.primary,
}));

const PriceValue = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
});

const DiscountChip = styled(Chip)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.xs,
  fontWeight: typography.fontWeight.medium,
  height: "24px",
  backgroundColor: colors.secondary.surface,
  color: colors.secondary.main,
  "& .MuiChip-label": {
    padding: "0 8px",
  },
});

const GstText = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
});

const StatusChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "statusColor",
})(({ statusColor }) => {
  const colorMap = {
    success: { bg: colors.success.surface, color: colors.success.main },
    warning: { bg: colors.warning.surface, color: colors.warning.main },
    error: { bg: colors.error.surface, color: colors.error.main },
  };
  const colorStyle = colorMap[statusColor] || colorMap.success;

  return {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    height: "24px",
    backgroundColor: colorStyle.bg,
    color: colorStyle.color,
    "& .MuiChip-label": {
      padding: "0 10px",
    },
  };
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

export default ViewStocks;
