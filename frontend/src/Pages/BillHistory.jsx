import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Grid,
  Box,
  Snackbar,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  Alert,
  IconButton,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  History as HistoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import designTokens from "../designTokens";
import { isAuthenticated, isAdmin, authAxios } from "../services/authService";
import { API_ENDPOINTS } from "../config/api";

const { colors, typography, borderRadius, elevation, motion, spacing } =
  designTokens;

const BillHistory = () => {
  const navigate = useNavigate();
  const userIsAdmin = isAdmin();

  const [billToDelete, setBillToDelete] = useState(null);
  const [billHistory, setBillHistory] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchPaymentMethod, setSearchPaymentMethod] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [previewedBillId, setPreviewedBillId] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyStats, setMonthlyStats] = useState({
    product: 0,
    consulting: 0,
    treatment: 0,
    total: 0,
    upi: 0,
    cash: 0,
    credit: 0,
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const togglePreview = (billId) => {
    setPreviewedBillId(previewedBillId === billId ? null : billId);
  };

  const fetchBillHistory = async () => {
    try {
      const response = await authAxios.get(API_ENDPOINTS.BILLS_HISTORY);
      const updatedBills = response.data.map((bill) => ({
        ...bill,
        downloadLink: API_ENDPOINTS.BILL_DOWNLOAD(bill._id),
      }));
      setBillHistory(updatedBills);
      setFilteredBills(updatedBills);
    } catch (error) {
      console.error("Error fetching bill history:", error);
    }
  };

  useEffect(() => {
    fetchBillHistory();
  }, []);

  useEffect(() => {
    const filtered = billHistory.filter((bill) => {
      const matchesName = bill.name
        .toLowerCase()
        .includes(searchName.toLowerCase());
      const matchesDate = searchDate
        ? bill.date && bill.date.startsWith(searchDate)
        : true;

      const billDate = new Date(bill.date);
      const billMonth = billDate.getMonth() + 1;
      const billYear = billDate.getFullYear();
      const matchesMonth =
        billMonth === selectedMonth && billYear === selectedYear;

      const matchesPaymentMethod = searchPaymentMethod
        ? bill.typeOfPayment === searchPaymentMethod
        : true;

      return matchesName && matchesDate && matchesMonth && matchesPaymentMethod;
    });
    setFilteredBills(filtered);
  }, [
    searchName,
    searchDate,
    billHistory,
    selectedMonth,
    selectedYear,
    searchPaymentMethod,
  ]);

  useEffect(() => {
    const stats = {
      product: 0,
      consulting: 0,
      treatment: 0,
      total: 0,
      upi: 0,
      cash: 0,
    };

    filteredBills.forEach((bill) => {
      const itemSubtotal = bill.items.reduce(
        (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
        0
      );

      let feeValue = 0;
      if (bill.type === "Consulting") {
        feeValue = bill.consultingFee || 0;
      } else if (bill.type === "Treatment") {
        feeValue = bill.treatmentFee || 0;
      }

      const subtotal = itemSubtotal + feeValue;
      const total = subtotal - (subtotal * (bill.discount || 0)) / 100;

      if (bill.type === "Product" || bill.type === "") {
        stats.product += total;
      } else if (bill.type === "Consulting") {
        stats.consulting += total;
      } else if (bill.type === "Treatment") {
        stats.treatment += total;
      }

      if (bill.typeOfPayment === "UPI") {
        stats.upi += total;
      } else if (bill.typeOfPayment === "Cash") {
        stats.cash += total;
      } else if (bill.typeOfPayment === "Credit") {
        stats.credit += total;
      }

      stats.total += total;
    });

    setMonthlyStats(stats);
  }, [filteredBills]);

  const deleteBill = (billId) => async () => {
    if (!userIsAdmin) {
      setErrorMessage("Access denied. Admin privileges required.");
      setBillToDelete(null);
      return;
    }
    try {
      await authAxios.delete(`${API_ENDPOINTS.BILLS}/${billId}`);
      fetchBillHistory();
      setSuccessMessage("Bill deleted successfully.");
      setBillToDelete(null);
    } catch (error) {
      console.error("Error deleting bill:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Error deleting bill. Please try again later."
      );
    }
  };

  // Download bill with authentication
  const handleDownloadBill = async (billId, patientName) => {
    try {
      const response = await authAxios.get(
        API_ENDPOINTS.BILL_DOWNLOAD(billId),
        { responseType: "blob" }
      );

      // Create a blob URL and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bill-${patientName || billId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading bill:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Error downloading bill. Please try again later."
      );
    }
  };

  const EditBillModal = ({ bill, open, onClose }) => {
    const [items, setItems] = useState(bill.items || []);
    const [discount, setDiscount] = useState(bill.discount || 0);
    const [typeOfPayment, setTypeOfPayment] = useState(
      bill.typeOfPayment || ""
    );
    const isProductBill = bill.type === "Product" || bill.type === "";

    const handleItemChange = (index, field, value) => {
      const updatedItems = [...items];
      updatedItems[index][field] = value;

      if (isProductBill) {
        if (field === "quantity" || field === "price" || field === "GST") {
          updatedItems[index][field] = parseFloat(value) || 0;
        }
      } else {
        if (field === "description") {
          updatedItems[index]["price"] = 0;
          updatedItems[index]["quantity"] = 0;
          updatedItems[index]["HSN"] = "";
          updatedItems[index]["GST"] = 0;
        }
      }
      setItems(updatedItems);
    };

    const handleAddItem = () => {
      setItems([
        ...items,
        {
          description: "",
          HSN: "",
          GST: 0,
          quantity: isProductBill ? 1 : 0,
          price: isProductBill ? 0 : 0,
        },
      ]);
    };

    const handleRemoveItem = (index) => {
      setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
      if (!userIsAdmin) {
        setErrorMessage("Access denied. Admin privileges required.");
        onClose();
        return;
      }
      try {
        await authAxios.put(`${API_ENDPOINTS.BILLS}/${bill._id}`, {
          items,
          discount,
          typeOfPayment,
        });
        onClose();
        fetchBillHistory();
        setSuccessMessage("Bill updated successfully.");
      } catch (err) {
        console.error("Failed to update bill", err);
        setErrorMessage(err.response?.data?.message || "Failed to update bill");
      }
    };

    return (
      <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <StyledDialogTitle>Edit Bill</StyledDialogTitle>
        <DialogContent>
          {items.map((item, index) => (
            <Grid
              container
              spacing={2}
              key={index}
              sx={{ mt: 1 }}
              alignItems="center"
            >
              {isProductBill ? (
                <>
                  <Grid item xs={3}>
                    <StyledTextField
                      label="Description"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <StyledTextField
                      label="HSN"
                      value={item.HSN}
                      onChange={(e) =>
                        handleItemChange(index, "HSN", e.target.value)
                      }
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <StyledTextField
                      label="GST"
                      type="number"
                      value={item.GST}
                      onChange={(e) =>
                        handleItemChange(index, "GST", e.target.value)
                      }
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <StyledTextField
                      label="Qty"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <StyledTextField
                      label="Price"
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(index, "price", e.target.value)
                      }
                      fullWidth
                      size="small"
                    />
                  </Grid>
                </>
              ) : (
                <Grid item xs={11}>
                  <StyledTextField
                    label="Comment/Description"
                    multiline
                    rows={2}
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    fullWidth
                  />
                </Grid>
              )}

              <Grid
                item
                xs={isProductBill ? 1 : 1}
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                <IconButton
                  color="error"
                  onClick={() => handleRemoveItem(index)}
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
          <AddItemButton
            onClick={handleAddItem}
            variant="text"
            startIcon={<EditIcon />}
          >
            Add {isProductBill ? "Item" : "Comment"}
          </AddItemButton>
          <StyledTextField
            label="Discount (%)"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value))}
            fullWidth
            sx={{ mt: 2 }}
          />
          <StyledTextField
            select
            label="Payment Method"
            value={typeOfPayment}
            onChange={(e) => setTypeOfPayment(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="">— Select payment —</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Credit">Credit</option>
          </StyledTextField>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SaveButton onClick={handleSave} variant="contained">
            Save Changes
          </SaveButton>
        </DialogActions>
      </StyledDialog>
    );
  };

  const BillPreview = ({ bill }) => {
    const itemSubtotal = bill.items.reduce(
      (acc, item) => acc + (item.quantity || 0) * (item.price || 0),
      0
    );

    let feeValue = 0;
    let feeLabel = "";

    if (bill.type === "Consulting") {
      feeValue = bill.consultingFee || 0;
      feeLabel = "Consulting Fee";
    } else if (bill.type === "Treatment") {
      feeValue = bill.treatmentFee || 0;
      feeLabel = "Treatment Fee";
    }

    const subtotal = itemSubtotal + feeValue;
    const discountAmount = (subtotal * (bill.discount || 0)) / 100;
    const total = subtotal - discountAmount;

    const isProductBill = bill.type === "Product" || bill.type === "";

    return (
      <PreviewWrapper>
        <PreviewTable>
          <thead>
            <tr>
              {["Product", "HSN", "GST (%)", "Qty", "Price", "Total"].map(
                (header) => (
                  <PreviewTh key={header}>{header}</PreviewTh>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {bill.items.map((item, index) => {
              const quantity = parseInt(item.quantity || 0, 10);
              const price = parseFloat(item.price || 0);
              const itemTotal = quantity * price;

              if (isProductBill) {
                return (
                  <tr key={index}>
                    <PreviewTd>{item.description}</PreviewTd>
                    <PreviewTd>{item.HSN}</PreviewTd>
                    <PreviewTd>{item.GST}</PreviewTd>
                    <PreviewTd>{item.quantity}</PreviewTd>
                    <PreviewTd>{item.price}</PreviewTd>
                    <PreviewTd>{itemTotal.toFixed(2)}</PreviewTd>
                  </tr>
                );
              } else if (item.description) {
                return (
                  <tr key={index}>
                    <PreviewTd colSpan={6}>
                      <strong>Comment:</strong> {item.description}
                    </PreviewTd>
                  </tr>
                );
              }
              return null;
            })}
            {(bill.type === "Consulting" || bill.type === "Treatment") &&
              feeValue > 0 && (
                <tr>
                  <PreviewTd
                    colSpan={5}
                    style={{ textAlign: "right", fontWeight: 500 }}
                  >
                    {feeLabel}
                  </PreviewTd>
                  <PreviewTd style={{ fontWeight: 500 }}>
                    ₹{feeValue.toFixed(2)}
                  </PreviewTd>
                </tr>
              )}
            <tr>
              <PreviewTd colSpan={5} style={{ textAlign: "right" }}>
                Subtotal
              </PreviewTd>
              <PreviewTd>₹{subtotal.toFixed(2)}</PreviewTd>
            </tr>
            <tr>
              <PreviewTd colSpan={5} style={{ textAlign: "right" }}>
                Discount ({bill.discount || 0}%)
              </PreviewTd>
              <PreviewTd>-₹{discountAmount.toFixed(2)}</PreviewTd>
            </tr>
            <tr>
              <PreviewTd
                colSpan={5}
                style={{ textAlign: "right", fontWeight: 600 }}
              >
                Total
              </PreviewTd>
              <PreviewTd style={{ fontWeight: 600 }}>
                ₹{total.toFixed(2)}
              </PreviewTd>
            </tr>
            <tr>
              <PreviewTd colSpan={5} style={{ textAlign: "right" }}>
                Payment Type
              </PreviewTd>
              <PreviewTd>{bill.typeOfPayment || "N/A"}</PreviewTd>
            </tr>
          </tbody>
        </PreviewTable>
      </PreviewWrapper>
    );
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <PageWrapper>
      <Container maxWidth="xl">
        <ContentCard>
          {/* Header Section */}
          <HeaderSection>
            <HeaderIcon>
              <HistoryIcon sx={{ fontSize: 24, color: colors.primary.main }} />
            </HeaderIcon>
            <Box>
              <PageTitle>Bill History</PageTitle>
              <PageSubtitle>View and manage all billing records</PageSubtitle>
            </Box>
          </HeaderSection>

          {/* Month/Year Selector */}
          <FilterSection>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4} md={2}>
                <StyledFormControl fullWidth size="small">
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={selectedMonth}
                    label="Month"
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {months.map((month, index) => (
                      <MenuItem key={index} value={index + 1}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </StyledFormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <StyledFormControl fullWidth size="small">
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Year"
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {Array.from(
                      { length: 10 },
                      (_, i) => new Date().getFullYear() - i
                    ).map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </StyledFormControl>
              </Grid>
            </Grid>
          </FilterSection>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <StatValue>₹{monthlyStats.product.toFixed(0)}</StatValue>
                <StatLabel>Products</StatLabel>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <StatValue>₹{monthlyStats.consulting.toFixed(0)}</StatValue>
                <StatLabel>Consulting</StatLabel>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <StatValue>₹{monthlyStats.treatment.toFixed(0)}</StatValue>
                <StatLabel>Treatment</StatLabel>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <StatValue>₹{monthlyStats.upi.toFixed(0)}</StatValue>
                <StatLabel>UPI</StatLabel>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <StatValue>₹{monthlyStats.cash.toFixed(0)}</StatValue>
                <StatLabel>Cash</StatLabel>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <StatValue>₹{monthlyStats.credit.toFixed(0)}</StatValue>
                <StatLabel>Credit</StatLabel>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <TotalStatCard>
                <StatValue style={{ color: colors.primary.main }}>
                  ₹{monthlyStats.total.toFixed(0)}
                </StatValue>
                <StatLabel style={{ color: colors.primary.main }}>
                  Total
                </StatLabel>
              </TotalStatCard>
            </Grid>
          </Grid>

          {/* Search Filters */}
          <FilterSection>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <StyledTextField
                  label="Search by Patient Name"
                  fullWidth
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  size="small"
                  placeholder="Enter patient name"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StyledTextField
                  label="Search by Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StyledFormControl fullWidth size="small">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={searchPaymentMethod}
                    label="Payment Method"
                    onChange={(e) => setSearchPaymentMethod(e.target.value)}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="UPI">UPI</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Credit">Credit</MenuItem>
                  </Select>
                </StyledFormControl>
              </Grid>
            </Grid>
          </FilterSection>

          {/* Bills Table */}
          <TableWrapper>
            <StyledTableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableHeadCell>Bill ID</StyledTableHeadCell>
                    <StyledTableHeadCell>Name</StyledTableHeadCell>
                    <StyledTableHeadCell>Type</StyledTableHeadCell>
                    <StyledTableHeadCell>Date</StyledTableHeadCell>
                    <StyledTableHeadCell align="right">
                      Total
                    </StyledTableHeadCell>
                    <StyledTableHeadCell>Payment</StyledTableHeadCell>
                    <StyledTableHeadCell align="center">
                      Actions
                    </StyledTableHeadCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBills.map((bill, index) => {
                    const itemSubtotal = bill.items.reduce(
                      (acc, item) =>
                        acc + (item.price || 0) * (item.quantity || 0),
                      0
                    );

                    let feeValue = 0;
                    if (bill.type === "Consulting") {
                      feeValue = bill.consultingFee || 0;
                    } else if (bill.type === "Treatment") {
                      feeValue = bill.treatmentFee || 0;
                    }

                    const subtotal = itemSubtotal + feeValue;
                    const total =
                      subtotal - (subtotal * (bill.discount || 0)) / 100;
                    const billNumber = (index + 1).toString().padStart(3, "0");
                    const displayId = `B${billNumber}`;

                    return (
                      <StyledTableRow key={index}>
                        <StyledTableCell>
                          <BillIdChip label={displayId} />
                        </StyledTableCell>
                        <StyledTableCell>
                          <PatientName>{bill.name}</PatientName>
                        </StyledTableCell>
                        <StyledTableCell>
                          <TypeChip
                            label={bill.type || "Product"}
                            billType={bill.type || "Product"}
                          />
                        </StyledTableCell>
                        <StyledTableCell>
                          <DateText>
                            {new Date(bill.date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </DateText>
                        </StyledTableCell>
                        <StyledTableCell align="right">
                          <TotalAmount>₹{total.toFixed(2)}</TotalAmount>
                        </StyledTableCell>
                        <StyledTableCell>
                          <PaymentChip
                            label={bill.typeOfPayment || "N/A"}
                            paymentType={bill.typeOfPayment}
                          />
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <ActionButtonsWrapper>
                            <ActionButton
                              onClick={() => setEditingBill(bill)}
                              title="Edit"
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </ActionButton>
                            <ActionButton
                              onClick={() => setBillToDelete(bill)}
                              title="Delete"
                              isDelete
                            >
                              <DeleteIcon sx={{ fontSize: 18 }} />
                            </ActionButton>
                            <DownloadButton
                              onClick={() =>
                                handleDownloadBill(bill._id, bill.name)
                              }
                              title="Download"
                            >
                              <DownloadIcon sx={{ fontSize: 18 }} />
                            </DownloadButton>
                          </ActionButtonsWrapper>
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })}
                  {filteredBills.length === 0 && (
                    <TableRow>
                      <StyledTableCell colSpan={7}>
                        <EmptyState>
                          <EmptyStateText>
                            No bills found for this period
                          </EmptyStateText>
                        </EmptyState>
                      </StyledTableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </StyledTableContainer>
          </TableWrapper>

          {previewedBillId && (
            <BillPreview
              bill={billHistory.find((bill) => bill._id === previewedBillId)}
            />
          )}
        </ContentCard>

        {/* Snackbars */}
        <Snackbar
          open={!!successMessage}
          autoHideDuration={3000}
          onClose={() => setSuccessMessage("")}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            severity="success"
            variant="filled"
            sx={{ borderRadius: borderRadius.md }}
          >
            {successMessage}
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
            sx={{ borderRadius: borderRadius.md }}
          >
            {errorMessage}
          </Alert>
        </Snackbar>

        {/* Delete Confirmation Dialog */}
        <StyledDialog
          open={!!billToDelete}
          onClose={() => setBillToDelete(null)}
        >
          <StyledDialogTitle>Confirm Deletion</StyledDialogTitle>
          <DialogContent>
            <Typography sx={{ fontFamily: typography.fontFamily.primary }}>
              Are you sure you want to delete the bill for{" "}
              <strong>{billToDelete?.name}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <CancelButton onClick={() => setBillToDelete(null)}>
              Cancel
            </CancelButton>
            <DeleteConfirmButton
              onClick={async () => {
                await deleteBill(billToDelete._id)();
                setBillToDelete(null);
              }}
            >
              Delete
            </DeleteConfirmButton>
          </DialogActions>
        </StyledDialog>

        {editingBill && (
          <EditBillModal
            bill={editingBill}
            open={!!editingBill}
            onClose={() => setEditingBill(null)}
          />
        )}
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
  marginBottom: spacing[6],
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

const FilterSection = styled(Box)({
  marginBottom: spacing[6],
});

const StyledFormControl = styled(FormControl)({
  "& .MuiOutlinedInput-root": {
    borderRadius: borderRadius.input,
    fontFamily: typography.fontFamily.primary,
  },
  "& .MuiInputLabel-root": {
    fontFamily: typography.fontFamily.primary,
  },
});

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: borderRadius.input,
    fontFamily: typography.fontFamily.primary,
  },
  "& .MuiInputLabel-root": {
    fontFamily: typography.fontFamily.primary,
  },
});

const StatCard = styled(Box)({
  padding: spacing[5],
  backgroundColor: colors.surface.container,
  borderRadius: borderRadius.lg,
  textAlign: "center",
  transition: motion.transition.fast,
  "&:hover": {
    backgroundColor: colors.surface.containerHigh,
  },
});

const TotalStatCard = styled(StatCard)({
  backgroundColor: colors.primary.surface,
  border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
});

const StatValue = styled(Typography)({
  fontFamily: typography.fontFamily.display,
  fontSize: typography.fontSize.xl,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
  marginBottom: spacing[1],
});

const StatLabel = styled(Typography)({
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
  padding: "14px 16px",
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
  padding: "12px 16px",
  borderBottom: `1px solid ${colors.border.light}`,
});

const BillIdChip = styled(Chip)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.xs,
  fontWeight: typography.fontWeight.medium,
  height: "26px",
  backgroundColor: colors.surface.container,
  color: colors.text.primary,
});

const PatientName = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
});

const TypeChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "billType",
})(({ billType }) => {
  const getColor = () => {
    switch (billType) {
      case "Consulting":
        return { bg: colors.info.surface, color: colors.info.main };
      case "Treatment":
        return { bg: colors.secondary.surface, color: colors.secondary.main };
      default:
        return { bg: colors.surface.container, color: colors.text.secondary };
    }
  };
  const colorStyle = getColor();
  return {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    height: "24px",
    backgroundColor: colorStyle.bg,
    color: colorStyle.color,
  };
});

const DateText = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  color: colors.text.secondary,
});

const TotalAmount = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.success.main,
});

const PaymentChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== "paymentType",
})(({ paymentType }) => {
  const getColor = () => {
    switch (paymentType) {
      case "UPI":
        return { bg: colors.primary.surface, color: colors.primary.main };
      case "Cash":
        return { bg: colors.secondary.surface, color: colors.secondary.main };
      case "Credit":
        return {
          bg: colors.warning?.surface || "#FFF3E0",
          color: colors.warning?.main || "#E65100",
        };
      default:
        return { bg: colors.surface.container, color: colors.text.tertiary };
    }
  };
  const colorStyle = getColor();
  return {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    height: "24px",
    backgroundColor: colorStyle.bg,
    color: colorStyle.color,
  };
});

const ActionButtonsWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing[1],
});

const ActionButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "isDelete",
})(({ isDelete }) => ({
  color: isDelete ? colors.text.tertiary : colors.text.secondary,
  padding: "6px",
  transition: motion.transition.fast,
  "&:hover": {
    color: isDelete ? colors.error.main : colors.primary.main,
    backgroundColor: isDelete
      ? alpha(colors.error.main, 0.08)
      : alpha(colors.primary.main, 0.08),
  },
}));

const DownloadButton = styled(IconButton)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: colors.text.secondary,
  padding: "6px",
  borderRadius: borderRadius.full,
  transition: motion.transition.fast,
  "&:hover": {
    color: colors.success.main,
    backgroundColor: alpha(colors.success.main, 0.08),
  },
});

const EmptyState = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: spacing[8],
});

const EmptyStateText = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  color: colors.text.tertiary,
});

const StyledDialog = styled(Dialog)({
  "& .MuiPaper-root": {
    borderRadius: borderRadius.dialog,
    boxShadow: elevation.modal,
  },
});

const StyledDialogTitle = styled(DialogTitle)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.xl,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
  paddingBottom: spacing[2],
});

const AddItemButton = styled(Button)({
  marginTop: spacing[4],
  fontFamily: typography.fontFamily.primary,
  textTransform: "none",
  color: colors.primary.main,
});

const CancelButton = styled(Button)({
  fontFamily: typography.fontFamily.primary,
  textTransform: "none",
  color: colors.text.secondary,
  borderRadius: borderRadius.button,
});

const SaveButton = styled(Button)({
  fontFamily: typography.fontFamily.primary,
  textTransform: "none",
  borderRadius: borderRadius.button,
  backgroundColor: colors.primary.main,
  "&:hover": {
    backgroundColor: colors.primary.dark,
  },
});

const DeleteConfirmButton = styled(Button)({
  fontFamily: typography.fontFamily.primary,
  textTransform: "none",
  borderRadius: borderRadius.button,
  backgroundColor: colors.error.main,
  color: "white",
  "&:hover": {
    backgroundColor: colors.error.light,
  },
});

const PreviewWrapper = styled(Box)({
  marginTop: spacing[6],
  padding: spacing[4],
  backgroundColor: colors.surface.container,
  borderRadius: borderRadius.lg,
  overflowX: "auto",
});

const PreviewTable = styled("table")({
  width: "100%",
  borderCollapse: "collapse",
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
});

const PreviewTh = styled("th")({
  padding: "12px",
  textAlign: "left",
  backgroundColor: colors.surface.containerHigh,
  borderBottom: `1px solid ${colors.border.medium}`,
  fontWeight: typography.fontWeight.medium,
  color: colors.text.primary,
});

const PreviewTd = styled("td")({
  padding: "10px 12px",
  borderBottom: `1px solid ${colors.border.light}`,
  color: colors.text.primary,
});

export default BillHistory;
