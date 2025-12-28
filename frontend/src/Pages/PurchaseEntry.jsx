import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Divider,
  Autocomplete,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  LocalShipping as ShippingIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import designTokens from "../designTokens";
import { isAuthenticated, isAdmin, authAxios } from "../services/authService";
import { API_ENDPOINTS } from "../config/api";

const { colors, typography, borderRadius, elevation, motion, spacing } =
  designTokens;

const PurchaseEntry = () => {
  const navigate = useNavigate();
  const userIsAdmin = isAdmin();

  // State for Invoice Header Details
  const [invoiceDetails, setInvoiceDetails] = useState({
    vendorName: "",
    invoiceNo: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    gstin: "",
  });

  // State for Line Items (Rows)
  const [items, setItems] = useState([
    {
      productName: "",
      batchNo: "",
      hsnCode: "",
      expiryDate: "",
      mrp: 0,
      rate: 0,
      qty: 0,
      discountPercent: 0,
      gstPercent: 5,
    },
  ]);

  // State for Data & UI
  const [existingStocks, setExistingStocks] = useState([]);
  const [totals, setTotals] = useState({
    taxableAmount: 0,
    cgst: 0,
    sgst: 0,
    roundOff: 0,
    grandTotal: 0,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    open: false,
    text: "",
    severity: "success",
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  // Load Existing Stocks on Mount
  useEffect(() => {
    authAxios
      .get(API_ENDPOINTS.STOCKS)
      .then((res) => setExistingStocks(res.data))
      .catch((err) => console.error("Failed to load stocks", err));
  }, []);

  // Calculate Totals whenever items change
  useEffect(() => {
    calculateInvoiceTotals();
  }, [items]);

  // Handlers
  const handleHeaderChange = (e) => {
    setInvoiceDetails({ ...invoiceDetails, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleProductSelect = (index, value) => {
    const newItems = [...items];
    if (typeof value === "string") {
      newItems[index].productName = value;
    } else if (value && value.productName) {
      newItems[index].productName = value.productName;
      newItems[index].hsnCode = value.hsnCode || "";
      newItems[index].gstPercent = value.gst || 5;
      newItems[index].mrp = value.price || 0;
    } else {
      newItems[index].productName = "";
    }
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        productName: "",
        batchNo: "",
        hsnCode: "",
        expiryDate: "",
        mrp: 0,
        rate: 0,
        qty: 0,
        discountPercent: 0,
        gstPercent: 5,
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const calculateInvoiceTotals = () => {
    let totalTaxable = 0;
    let totalTax = 0;

    items.forEach((item) => {
      const quantity = parseFloat(item.qty) || 0;
      const rate = parseFloat(item.rate) || 0;
      const discount = parseFloat(item.discountPercent) || 0;
      const gst = parseFloat(item.gstPercent) || 0;

      const baseAmount = quantity * rate;
      const discountAmount = baseAmount * (discount / 100);
      const taxable = baseAmount - discountAmount;
      const taxAmount = taxable * (gst / 100);

      totalTaxable += taxable;
      totalTax += taxAmount;
    });

    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const rawTotal = totalTaxable + totalTax;
    const roundedTotal = Math.round(rawTotal);
    const roundOff = roundedTotal - rawTotal;

    setTotals({
      taxableAmount: totalTaxable.toFixed(2),
      cgst: cgst.toFixed(2),
      sgst: sgst.toFixed(2),
      roundOff: roundOff.toFixed(2),
      grandTotal: roundedTotal.toFixed(2),
    });
  };

  const handleSubmit = async () => {
    if (!userIsAdmin) {
      setMessage({
        open: true,
        text: "Access denied. Admin privileges required.",
        severity: "error",
      });
      return;
    }

    setLoading(true);

    if (!invoiceDetails.invoiceNo || !invoiceDetails.vendorName) {
      setMessage({
        open: true,
        text: "Please fill Invoice No and Vendor Name",
        severity: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const purchasePayload = {
        ...invoiceDetails,
        items,
        totals,
      };
      await authAxios.post(API_ENDPOINTS.PURCHASES, purchasePayload);

      const stockUpdatePromises = items.map((item) => {
        const existingStock = existingStocks.find(
          (s) => s.productName.toLowerCase() === item.productName.toLowerCase()
        );

        if (existingStock) {
          return authAxios.put(
            `${API_ENDPOINTS.STOCKS}/${existingStock.stockId}`,
            {
              quantity: item.qty,
              price: item.mrp > 0 ? item.mrp : existingStock.price,
              updateMode: "add",
            }
          );
        } else {
          const newStockId = (
            item.productName.substring(0, 3) +
            Math.floor(1000 + Math.random() * 9000)
          ).toUpperCase();
          return authAxios.post(API_ENDPOINTS.STOCKS, {
            stockId: newStockId,
            productName: item.productName,
            quantity: item.qty,
            price: item.mrp || item.rate,
            hsnCode: item.hsnCode,
            discount: 0,
            gst: item.gstPercent,
          });
        }
      });

      await Promise.all(stockUpdatePromises);

      const res = await authAxios.get(API_ENDPOINTS.STOCKS);
      setExistingStocks(res.data);

      setMessage({
        open: true,
        text: "Purchase saved & stocks updated!",
        severity: "success",
      });

      setTimeout(() => {
        setItems([
          {
            productName: "",
            batchNo: "",
            hsnCode: "",
            expiryDate: "",
            mrp: 0,
            rate: 0,
            qty: 0,
            discountPercent: 0,
            gstPercent: 5,
          },
        ]);
        setInvoiceDetails({ ...invoiceDetails, invoiceNo: "" });
      }, 1500);
    } catch (error) {
      console.error(error);
      setMessage({
        open: true,
        text: error.response?.data?.message || "Error saving purchase",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show access denied for non-admin users
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
                You do not have permission to enter purchases. Please contact an
                administrator.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => navigate("/purchasehistory")}
                sx={{
                  fontFamily: typography.fontFamily.primary,
                  textTransform: "none",
                  borderRadius: borderRadius.button,
                }}
              >
                View Purchase History Instead
              </Button>
            </Box>
          </ContentCard>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="xl">
        <ContentCard>
          {/* Header Section */}
          <HeaderSection>
            <HeaderIcon>
              <ShippingIcon sx={{ fontSize: 24, color: colors.primary.main }} />
            </HeaderIcon>
            <Box>
              <PageTitle>Purchase Entry</PageTitle>
              <PageSubtitle>
                Record wholesale purchases and update inventory
              </PageSubtitle>
            </Box>
          </HeaderSection>

          {/* Invoice Details Card */}
          <InvoiceCard>
            <SectionTitle>Invoice Details</SectionTitle>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <StyledTextField
                  label="Vendor Name"
                  name="vendorName"
                  value={invoiceDetails.vendorName}
                  onChange={handleHeaderChange}
                  fullWidth
                  placeholder="Enter vendor name"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StyledTextField
                  label="Invoice Number"
                  name="invoiceNo"
                  value={invoiceDetails.invoiceNo}
                  onChange={handleHeaderChange}
                  fullWidth
                  required
                  placeholder="INV-001"
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StyledTextField
                  label="Invoice Date"
                  type="date"
                  name="invoiceDate"
                  value={invoiceDetails.invoiceDate}
                  onChange={handleHeaderChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StyledTextField
                  label="GSTIN (Optional)"
                  name="gstin"
                  value={invoiceDetails.gstin}
                  onChange={handleHeaderChange}
                  fullWidth
                  placeholder="Enter GSTIN"
                />
              </Grid>
            </Grid>
          </InvoiceCard>

          {/* Items Table */}
          <TableWrapper>
            <StyledTableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell width="40px">#</StyledTableHeadCell>
                    <StyledTableHeadCell width="25%">
                      Product Name
                    </StyledTableHeadCell>
                    <StyledTableHeadCell>Batch</StyledTableHeadCell>
                    <StyledTableHeadCell>Expiry</StyledTableHeadCell>
                    <StyledTableHeadCell>HSN</StyledTableHeadCell>
                    <StyledTableHeadCell>Qty</StyledTableHeadCell>
                    <StyledTableHeadCell>Rate (₹)</StyledTableHeadCell>
                    <StyledTableHeadCell>Disc %</StyledTableHeadCell>
                    <StyledTableHeadCell>Taxable</StyledTableHeadCell>
                    <StyledTableHeadCell>GST %</StyledTableHeadCell>
                    <StyledTableHeadCell width="60px">
                      Action
                    </StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => {
                    const base =
                      (parseFloat(item.qty) || 0) *
                      (parseFloat(item.rate) || 0);
                    const disc =
                      base * ((parseFloat(item.discountPercent) || 0) / 100);
                    const taxable = base - disc;

                    return (
                      <StyledTableRow key={index}>
                        <StyledTableCell>
                          <RowNumber>{index + 1}</RowNumber>
                        </StyledTableCell>
                        <StyledTableCell>
                          <StyledAutocomplete
                            freeSolo
                            options={existingStocks}
                            getOptionLabel={(option) =>
                              typeof option === "string"
                                ? option
                                : option.productName
                            }
                            value={item.productName}
                            onChange={(event, newValue) =>
                              handleProductSelect(index, newValue)
                            }
                            onInputChange={(event, newInputValue) => {
                              handleItemChange(
                                index,
                                "productName",
                                newInputValue
                              );
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Product name"
                                variant="standard"
                                fullWidth
                              />
                            )}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <InlineTextField
                            value={item.batchNo}
                            onChange={(e) =>
                              handleItemChange(index, "batchNo", e.target.value)
                            }
                            variant="standard"
                            placeholder="Batch"
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <InlineTextField
                            value={item.expiryDate}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "expiryDate",
                                e.target.value
                              )
                            }
                            placeholder="MM/YY"
                            variant="standard"
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <InlineTextField
                            value={item.hsnCode}
                            onChange={(e) =>
                              handleItemChange(index, "hsnCode", e.target.value)
                            }
                            variant="standard"
                            placeholder="HSN"
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <InlineTextField
                            type="number"
                            value={item.qty}
                            onChange={(e) =>
                              handleItemChange(index, "qty", e.target.value)
                            }
                            variant="standard"
                            style={{ width: "60px" }}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <InlineTextField
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              handleItemChange(index, "rate", e.target.value)
                            }
                            variant="standard"
                            style={{ width: "80px" }}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <InlineTextField
                            type="number"
                            value={item.discountPercent}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "discountPercent",
                                e.target.value
                              )
                            }
                            variant="standard"
                            style={{ width: "50px" }}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <TaxableAmount>₹{taxable.toFixed(2)}</TaxableAmount>
                        </StyledTableCell>
                        <StyledTableCell>
                          <InlineTextField
                            type="number"
                            value={item.gstPercent}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "gstPercent",
                                e.target.value
                              )
                            }
                            variant="standard"
                            style={{ width: "50px" }}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <DeleteRowButton
                            onClick={() => removeItemRow(index)}
                            size="small"
                            disabled={items.length === 1}
                          >
                            <DeleteIcon sx={{ fontSize: 18 }} />
                          </DeleteRowButton>
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <AddRowSection>
                <AddRowButton
                  startIcon={<AddIcon />}
                  onClick={addItemRow}
                  variant="text"
                >
                  Add Item
                </AddRowButton>
              </AddRowSection>
            </StyledTableContainer>
          </TableWrapper>

          {/* Footer Summary */}
          <Grid container spacing={3} justifyContent="flex-end" sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <SummaryCard>
                <SummaryRow>
                  <SummaryLabel>Taxable Amount:</SummaryLabel>
                  <SummaryValue>₹{totals.taxableAmount}</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>CGST:</SummaryLabel>
                  <SummaryValue>₹{totals.cgst}</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>SGST:</SummaryLabel>
                  <SummaryValue>₹{totals.sgst}</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>Round Off:</SummaryLabel>
                  <SummaryValue>₹{totals.roundOff}</SummaryValue>
                </SummaryRow>
                <Divider sx={{ my: 2 }} />
                <SummaryRow>
                  <GrandTotalLabel>Grand Total:</GrandTotalLabel>
                  <GrandTotalValue>₹{totals.grandTotal}</GrandTotalValue>
                </SummaryRow>

                <SaveButton
                  variant="contained"
                  fullWidth
                  startIcon={<SaveIcon />}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Purchase Entry"}
                </SaveButton>
              </SummaryCard>
            </Grid>
          </Grid>
        </ContentCard>

        <Snackbar
          open={message.open}
          autoHideDuration={4000}
          onClose={() => setMessage({ ...message, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity={message.severity}
            variant="filled"
            sx={{
              borderRadius: borderRadius.md,
              fontFamily: typography.fontFamily.primary,
            }}
          >
            {message.text}
          </Alert>
        </Snackbar>
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

const InvoiceCard = styled(Box)({
  padding: spacing[6],
  backgroundColor: colors.surface.container,
  borderRadius: borderRadius.lg,
  marginBottom: spacing[6],
});

const SectionTitle = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.secondary,
  marginBottom: spacing[4],
  textTransform: "uppercase",
  letterSpacing: "0.05em",
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: borderRadius.input,
    backgroundColor: colors.surface.background,
    fontFamily: typography.fontFamily.primary,
    "& fieldset": {
      borderColor: colors.border.medium,
    },
    "&:hover fieldset": {
      borderColor: colors.border.dark,
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.primary.main,
      borderWidth: "2px",
    },
  },
  "& .MuiInputLabel-root": {
    fontFamily: typography.fontFamily.primary,
    color: colors.text.secondary,
    "&.Mui-focused": {
      color: colors.primary.main,
    },
  },
  "& .MuiInputBase-input": {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
  },
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
  fontSize: typography.fontSize.xs,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
  backgroundColor: colors.surface.container,
  borderBottom: `1px solid ${colors.border.light}`,
  padding: "12px 14px",
  whiteSpace: "nowrap",
});

const StyledTableRow = styled(TableRow)({
  transition: motion.transition.fast,
  "&:hover": {
    backgroundColor: colors.hover,
  },
});

const StyledTableCell = styled(TableCell)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  padding: "10px 14px",
  borderBottom: `1px solid ${colors.border.light}`,
});

const RowNumber = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.tertiary,
});

const StyledAutocomplete = styled(Autocomplete)({
  "& .MuiInputBase-root": {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
  },
});

const InlineTextField = styled(TextField)({
  "& .MuiInputBase-root": {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
  },
  "& .MuiInput-underline:before": {
    borderBottomColor: colors.border.light,
  },
  "& .MuiInput-underline:hover:before": {
    borderBottomColor: colors.border.dark,
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: colors.primary.main,
  },
});

const TaxableAmount = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
});

const DeleteRowButton = styled(IconButton)({
  color: colors.text.tertiary,
  transition: motion.transition.fast,
  "&:hover": {
    color: colors.error.main,
    backgroundColor: alpha(colors.error.main, 0.08),
  },
  "&:disabled": {
    color: colors.text.disabled,
  },
});

const AddRowSection = styled(Box)({
  padding: spacing[4],
  borderTop: `1px solid ${colors.border.light}`,
});

const AddRowButton = styled(Button)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  textTransform: "none",
  color: colors.primary.main,
  "&:hover": {
    backgroundColor: alpha(colors.primary.main, 0.04),
  },
});

const SummaryCard = styled(Box)({
  padding: spacing[6],
  backgroundColor: colors.surface.container,
  borderRadius: borderRadius.lg,
});

const SummaryRow = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing[2],
});

const SummaryLabel = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
});

const SummaryValue = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
});

const GrandTotalLabel = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.medium,
  color: colors.primary.main,
});

const GrandTotalValue = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.lg,
  fontWeight: typography.fontWeight.semibold,
  color: colors.primary.main,
});

const SaveButton = styled(Button)({
  marginTop: spacing[6],
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

export default PurchaseEntry;
