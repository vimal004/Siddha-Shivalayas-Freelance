import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Collapse,
  Chip,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Delete as DeleteIcon,
  LocalShipping as ShippingIcon,
} from "@mui/icons-material";
import designTokens from "../designTokens";

const { colors, typography, borderRadius, elevation, motion, spacing } =
  designTokens;

const Row = ({ row, onDelete, index }) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <StyledTableRow>
        <StyledTableCell>
          <ExpandButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            isOpen={open}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </ExpandButton>
        </StyledTableCell>
        <StyledTableCell>
          <VendorName>{row.vendorName}</VendorName>
        </StyledTableCell>
        <StyledTableCell>
          <InvoiceChip label={row.invoiceNo} />
        </StyledTableCell>
        <StyledTableCell>
          {new Date(row.invoiceDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </StyledTableCell>
        <StyledTableCell align="right">
          <AmountText>₹{row.totals?.grandTotal}</AmountText>
        </StyledTableCell>
        <StyledTableCell align="center">
          <DeleteButton onClick={() => onDelete(row._id)} size="small">
            <DeleteIcon sx={{ fontSize: 18 }} />
          </DeleteButton>
        </StyledTableCell>
      </StyledTableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <CollapsedContent>
              <SubTableTitle>Items Details</SubTableTitle>
              <SubTable size="small">
                <TableHead>
                  <TableRow>
                    <SubTableHeadCell>Product Name</SubTableHeadCell>
                    <SubTableHeadCell>Batch</SubTableHeadCell>
                    <SubTableHeadCell align="right">Qty</SubTableHeadCell>
                    <SubTableHeadCell align="right">Rate</SubTableHeadCell>
                    <SubTableHeadCell align="right">
                      Total (Taxable)
                    </SubTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <SubTableCell>{item.productName}</SubTableCell>
                      <SubTableCell>{item.batchNo || "—"}</SubTableCell>
                      <SubTableCell align="right">{item.qty}</SubTableCell>
                      <SubTableCell align="right">₹{item.rate}</SubTableCell>
                      <SubTableCell align="right">
                        ₹
                        {(
                          item.qty * item.rate -
                          item.qty * item.rate * (item.discountPercent / 100)
                        ).toFixed(2)}
                      </SubTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </SubTable>
            </CollapsedContent>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    try {
      const response = await axios.get(
        "https://siddha-shivalayas-backend.vercel.app/purchases"
      );
      setPurchases(response.data);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure? Note: This will NOT revert the stock quantities automatically."
      )
    ) {
      try {
        await axios.delete(
          `https://siddha-shivalayas-backend.vercel.app/purchases/${id}`
        );
        fetchPurchases();
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <PageWrapper>
      <Container maxWidth="lg">
        <ContentCard>
          {/* Header Section */}
          <HeaderSection>
            <HeaderIcon>
              <ShippingIcon sx={{ fontSize: 24, color: colors.primary.main }} />
            </HeaderIcon>
            <Box>
              <PageTitle>Purchase History</PageTitle>
              <PageSubtitle>
                Track and manage your vendor purchase records
              </PageSubtitle>
            </Box>
            <RecordCount>
              {purchases.length} {purchases.length === 1 ? "record" : "records"}
            </RecordCount>
          </HeaderSection>

          {/* Content */}
          {loading ? (
            <LoadingContainer>
              <CircularProgress sx={{ color: colors.primary.main }} />
              <LoadingText>Loading purchase records...</LoadingText>
            </LoadingContainer>
          ) : (
            <TableWrapper>
              <StyledTableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <StyledTableHeadCell width="50px" />
                      <StyledTableHeadCell>Vendor Name</StyledTableHeadCell>
                      <StyledTableHeadCell>Invoice No</StyledTableHeadCell>
                      <StyledTableHeadCell>Date</StyledTableHeadCell>
                      <StyledTableHeadCell align="right">
                        Amount
                      </StyledTableHeadCell>
                      <StyledTableHeadCell align="center" width="80px">
                        Actions
                      </StyledTableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {purchases.length > 0 ? (
                      purchases.map((row, index) => (
                        <Row
                          key={row._id}
                          row={row}
                          onDelete={handleDelete}
                          index={index}
                        />
                      ))
                    ) : (
                      <TableRow>
                        <StyledTableCell colSpan={6}>
                          <EmptyState>
                            <EmptyStateIcon>
                              <ShippingIcon
                                sx={{
                                  fontSize: 48,
                                  color: colors.text.disabled,
                                }}
                              />
                            </EmptyStateIcon>
                            <EmptyStateText>
                              No purchase records found
                            </EmptyStateText>
                            <EmptyStateSubtext>
                              Purchase entries will appear here once added
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
  gap: spacing[4],
  marginBottom: spacing[8],
  flexWrap: "wrap",
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

const RecordCount = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.secondary,
  padding: "6px 12px",
  backgroundColor: colors.surface.container,
  borderRadius: borderRadius.full,
  marginLeft: "auto",
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
  "& > *": {
    borderBottom: `1px solid ${colors.border.light}`,
  },
});

const StyledTableCell = styled(TableCell)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.regular,
  color: colors.text.primary,
  padding: "14px 20px",
});

const ExpandButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "isOpen",
})(({ isOpen }) => ({
  color: colors.text.secondary,
  backgroundColor: isOpen ? colors.primary.surface : "transparent",
  transition: motion.transition.fast,
  "&:hover": {
    backgroundColor: colors.hover,
  },
}));

const VendorName = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
});

const InvoiceChip = styled(Chip)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.xs,
  fontWeight: typography.fontWeight.medium,
  height: "26px",
  backgroundColor: colors.surface.container,
  color: colors.text.primary,
  "& .MuiChip-label": {
    padding: "0 10px",
  },
});

const AmountText = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.success.main,
});

const DeleteButton = styled(IconButton)({
  color: colors.text.tertiary,
  transition: motion.transition.fast,
  "&:hover": {
    color: colors.error.main,
    backgroundColor: alpha(colors.error.main, 0.08),
  },
});

const CollapsedContent = styled(Box)({
  padding: spacing[5],
  backgroundColor: colors.surface.containerLow,
  borderRadius: borderRadius.md,
  margin: spacing[3],
});

const SubTableTitle = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
  marginBottom: spacing[3],
});

const SubTable = styled(Table)({
  backgroundColor: colors.surface.background,
  borderRadius: borderRadius.sm,
  overflow: "hidden",
});

const SubTableHeadCell = styled(TableCell)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.xs,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.secondary,
  backgroundColor: colors.surface.container,
  padding: "10px 14px",
  borderBottom: `1px solid ${colors.border.light}`,
});

const SubTableCell = styled(TableCell)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  color: colors.text.primary,
  padding: "10px 14px",
  borderBottom: `1px solid ${colors.border.light}`,
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

export default PurchaseHistory;
