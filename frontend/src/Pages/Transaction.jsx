import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Snackbar,
  Grid,
  Typography,
  Container,
  Box,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  Paper,
  TableHead,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableRow,
  Alert,
  Chip,
  Autocomplete,
  Divider,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import designTokens from "../designTokens";
import { isAuthenticated, isAdmin, authAxios } from "../services/authService";
import { API_ENDPOINTS } from "../config/api";

const { colors, typography, borderRadius, elevation, motion, spacing } =
  designTokens;

const Transaction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userIsAdmin = isAdmin();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
    age: "",
    date: "",
    items: [],
    discount: 0,
    totalAmount: 0,
    type: "",
    typeOfPayment: "",
    consultingFee: 0,
    treatmentFee: 0,
  });

  const [filteredBills, setFilteredBills] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [billHistory, setBillHistory] = useState([]);
  const [previewedBillId, setPreviewedBillId] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [billToDelete, setBillToDelete] = useState(null);

  const togglePreview = (billId) => {
    setPreviewedBillId(previewedBillId === billId ? null : billId);
  };

  const urlId = window.location.pathname.split("/")[2];
  const isExistingPatientRoute = location.pathname.startsWith("/customers/");

  const deleteBill = (billId) => async () => {
    if (!userIsAdmin) {
      setErrorMessage("Access denied. Admin privileges required.");
      return;
    }
    try {
      await authAxios.delete(`${API_ENDPOINTS.BILLS}/${billId}`);
      fetchBillHistory();
      setSuccessMessage("Bill deleted successfully.");
    } catch (error) {
      console.error("Error deleting bill:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Error deleting bill. Please try again later."
      );
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    authAxios
      .get(API_ENDPOINTS.STOCKS)
      .then((response) => {
        setStocks(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isExistingPatientRoute) {
      authAxios
        .get(`${API_ENDPOINTS.PATIENTS}/${urlId}`)
        .then((response) => {
          setFormData((prev) => ({
            ...prev,
            ...response.data,
            date: response.data.date
              ? response.data.date.split("T")[0]
              : new Date().toISOString().split("T")[0],
          }));
          fetchBillHistory(response.data.id);
        })
        .catch((error) => console.error(error));
    } else {
      setFormData({
        id: "",
        name: "",
        phone: "",
        address: "",
        age: "",
        date: new Date().toISOString().split("T")[0],
        items: [],
        discount: 0,
        totalAmount: 0,
        type: "",
        typeOfPayment: "",
        consultingFee: 0,
        treatmentFee: 0,
      });
      setFilteredBills([]);
    }
  }, [location.pathname]);

  const fetchBillHistory = async (patientId = urlId) => {
    try {
      const response = await authAxios.get(API_ENDPOINTS.BILLS_HISTORY);
      const updatedBills = response.data.map((bill) => ({
        ...bill,
        downloadLink: API_ENDPOINTS.BILL_DOWNLOAD(bill._id),
      }));

      const filtered =
        isExistingPatientRoute && patientId
          ? updatedBills.filter((bill) => bill.id === patientId)
          : [];

      setBillHistory(filtered);
      setFilteredBills(filtered);
    } catch (error) {
      console.error("Error fetching bill history:", error);
    }
  };

  const handleItemSelection = (index, selectedStock) => {
    if (formData.type !== "Product" && formData.type !== "") return;

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      description: selectedStock.productName,
      price: selectedStock.price,
      GST: selectedStock.gst,
      HSN: selectedStock.hsnCode,
      quantity: updatedItems[index].quantity || 1,
    };
    setFormData({ ...formData, items: updatedItems });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    const isProductType = formData.type === "Product" || formData.type === "";

    if (!isProductType) {
      if (field === "description") {
        updatedItems[index]["price"] = 0;
        updatedItems[index]["quantity"] = 0;
        updatedItems[index]["HSN"] = "";
        updatedItems[index]["GST"] = 0;
      } else {
        updatedItems[index][field] = field === "HSN" ? "" : 0;
      }
    }

    if (field === "quantity") {
      const selectedStock = stocks.find(
        (stock) => stock.productName === updatedItems[index].description
      );

      if (
        formData.type === "Product" &&
        selectedStock &&
        parseInt(value, 10) > selectedStock.quantity
      ) {
        setErrorMessage(
          `Insufficient stock for ${selectedStock.productName}. Available: ${selectedStock.quantity}`
        );
      } else {
        setErrorMessage("");
      }
    }

    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", HSN: "", GST: 0, quantity: 0, price: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const calculateTotal = () => {
    let subtotal = formData.items.reduce((acc, item) => {
      const price = parseFloat(item.price || 0);
      const quantity = parseInt(item.quantity || 0, 10);
      return acc + price * quantity;
    }, 0);

    if (formData.type === "Consulting") {
      subtotal += parseFloat(formData.consultingFee || 0);
    } else if (formData.type === "Treatment") {
      subtotal += parseFloat(formData.treatmentFee || 0);
    }

    subtotal = Math.max(0, subtotal);
    return subtotal - (subtotal * formData.discount) / 100;
  };

  useEffect(() => {
    const totalAmount = calculateTotal();
    setFormData((prevData) => ({ ...prevData, totalAmount }));
  }, [
    formData.items,
    formData.discount,
    formData.type,
    formData.consultingFee,
    formData.treatmentFee,
  ]);

  const handleDownloadBill = async () => {
    try {
      if (
        !formData.id ||
        !formData.name ||
        !formData.phone ||
        !formData.address
      ) {
        throw new Error(
          "Patient details (ID, Name, Phone, Address) are required."
        );
      }

      const isProductBill = formData.type === "Product" || formData.type === "";

      if (isProductBill) {
        for (const item of formData.items) {
          const selectedStock = stocks.find(
            (stock) => stock.productName === item.description
          );
          if (selectedStock && item.quantity > selectedStock.quantity) {
            throw new Error(
              `Insufficient stock for ${selectedStock.productName}. Available: ${selectedStock.quantity}`
            );
          }
        }
      }

      if (!formData.typeOfPayment) {
        throw new Error("Type of Payment is required.");
      }

      if (isProductBill) {
        for (const item of formData.items) {
          const selectedStock = stocks.find(
            (stock) => stock.productName === item.description
          );
          if (selectedStock) {
            const updatedQuantity = selectedStock.quantity - item.quantity;
            await authAxios.put(
              `${API_ENDPOINTS.STOCKS}/${selectedStock.stockId}`,
              { quantity: updatedQuantity, updateMode: "set" }
            );
          }
        }
      }

      const response = await authAxios.post(
        API_ENDPOINTS.GENERATE_BILL,
        formData,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `bill-${formData.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccessMessage("Bill generated and downloaded successfully!");
      if (isExistingPatientRoute) {
        fetchBillHistory();
      } else {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Error processing the request");
    }
  };

  const handleSaveTransaction = async () => {
    try {
      if (
        !formData.id ||
        !formData.name ||
        !formData.phone ||
        !formData.address
      ) {
        throw new Error(
          "Patient details (ID, Name, Phone, Address) are required."
        );
      }

      const isProductBill = formData.type === "Product" || formData.type === "";

      if (isProductBill) {
        for (const item of formData.items) {
          const selectedStock = stocks.find(
            (stock) => stock.productName === item.description
          );
          if (selectedStock && item.quantity > selectedStock.quantity) {
            throw new Error(
              `Insufficient stock for ${selectedStock.productName}. Available: ${selectedStock.quantity}`
            );
          }
        }
      }

      if (!formData.typeOfPayment) {
        throw new Error("Type of Payment is required.");
      }

      if (isProductBill) {
        for (const item of formData.items) {
          const selectedStock = stocks.find(
            (stock) => stock.productName === item.description
          );
          if (selectedStock) {
            const updatedQuantity = selectedStock.quantity - item.quantity;
            await authAxios.put(
              `${API_ENDPOINTS.STOCKS}/${selectedStock.stockId}`,
              { quantity: updatedQuantity, updateMode: "set" }
            );
          }
        }
      }

      await authAxios.post(API_ENDPOINTS.GENERATE_BILL, formData, {
        responseType: "blob",
      });

      setSuccessMessage("Transaction saved successfully!");
      if (isExistingPatientRoute) {
        fetchBillHistory();
      } else {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || "Error processing the request");
    }
  };

  const resetForm = () => {
    setFormData((prev) => ({
      ...prev,
      id: "",
      name: "",
      phone: "",
      address: "",
      age: "",
      items: [],
      discount: 0,
      totalAmount: 0,
      type: "",
      typeOfPayment: "",
      consultingFee: 0,
      treatmentFee: 0,
      date: new Date().toISOString().split("T")[0],
    }));
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
                    <PreviewTd>₹{price.toFixed(2)}</PreviewTd>
                    <PreviewTd>₹{itemTotal.toFixed(2)}</PreviewTd>
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
          </tbody>
        </PreviewTable>
      </PreviewWrapper>
    );
  };

  const EditBillModal = ({ bill, open, onClose }) => {
    const [items, setItems] = useState(bill.items || []);
    const [discount, setDiscount] = useState(bill.discount || 0);
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
          price: 0,
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
                xs={1}
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
            startIcon={<AddIcon />}
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
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <SaveButton onClick={handleSave} variant="contained">
            Save
          </SaveButton>
        </DialogActions>
      </StyledDialog>
    );
  };

  const isProductBillType = formData.type === "Product" || formData.type === "";

  // Calculate bill preview values
  const itemsSubtotal = formData.items.reduce(
    (acc, item) =>
      acc + parseFloat(item.price || 0) * parseInt(item.quantity || 0, 10),
    0
  );
  const feeAmount =
    formData.type === "Consulting"
      ? parseFloat(formData.consultingFee || 0)
      : formData.type === "Treatment"
      ? parseFloat(formData.treatmentFee || 0)
      : 0;
  const previewSubtotal = itemsSubtotal + feeAmount;
  const previewDiscount = (previewSubtotal * (formData.discount || 0)) / 100;

  return (
    <PageWrapper>
      <Container maxWidth="lg">
        <ContentCard>
          {/* Header Section */}
          <HeaderSection>
            <HeaderIcon>
              <ReceiptIcon sx={{ fontSize: 24, color: colors.primary.main }} />
            </HeaderIcon>
            <Box>
              <PageTitle>
                {isExistingPatientRoute
                  ? `Bill for ${formData.name || "Patient"}`
                  : "Generate Bill"}
              </PageTitle>
              <PageSubtitle>
                {isExistingPatientRoute
                  ? "Create a new bill for this patient"
                  : "Enter patient details and create a new bill"}
              </PageSubtitle>
            </Box>
          </HeaderSection>

          {loading ? (
            <LoadingContainer>
              <CircularProgress sx={{ color: colors.primary.main }} />
              <LoadingText>Loading data...</LoadingText>
            </LoadingContainer>
          ) : (
            <form>
              {/* Patient Details Section */}
              <FormSection>
                <SectionTitle>Patient Details</SectionTitle>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StyledTextField
                      label="Patient ID"
                      name="id"
                      value={formData.id}
                      onChange={handleChange}
                      fullWidth
                      required
                      disabled={isExistingPatientRoute}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StyledTextField
                      label="Patient Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      fullWidth
                      disabled={isExistingPatientRoute}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StyledTextField
                      label="Phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      fullWidth
                      disabled={isExistingPatientRoute}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StyledTextField
                      label="Age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      fullWidth
                      disabled={isExistingPatientRoute}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <StyledTextField
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StyledTextField
                      label="Date"
                      name="date"
                      type="date"
                      value={formData.date ? formData.date.split("T")[0] : ""}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </FormSection>

              {/* Bill Configuration Section */}
              <FormSection>
                <SectionTitle>Bill Configuration</SectionTitle>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <StyledTextField
                      select
                      label="Bill Type"
                      name="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value,
                          consultingFee:
                            e.target.value !== "Consulting"
                              ? 0
                              : formData.consultingFee,
                          treatmentFee:
                            e.target.value !== "Treatment"
                              ? 0
                              : formData.treatmentFee,
                          items: [],
                        })
                      }
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{ native: true }}
                    >
                      <option value="">— Select bill type —</option>
                      <option value="Product">Product</option>
                      <option value="Consulting">Consulting</option>
                      <option value="Treatment">Treatment</option>
                    </StyledTextField>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <StyledTextField
                      select
                      label="Payment Method"
                      name="typeOfPayment"
                      value={formData.typeOfPayment}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{ native: true }}
                    >
                      <option value="">— Select payment —</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                    </StyledTextField>
                  </Grid>
                  {formData.type === "Consulting" && (
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField
                        label="Consulting Fee (₹)"
                        name="consultingFee"
                        type="number"
                        value={formData.consultingFee}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid>
                  )}
                  {formData.type === "Treatment" && (
                    <Grid item xs={12} sm={6} md={4}>
                      <StyledTextField
                        label="Treatment Fee (₹)"
                        name="treatmentFee"
                        type="number"
                        value={formData.treatmentFee}
                        onChange={handleChange}
                        fullWidth
                      />
                    </Grid>
                  )}
                </Grid>
              </FormSection>

              {/* Items Section */}
              <FormSection>
                <SectionTitle>
                  {isProductBillType ? "Products" : "Comments/Description"}
                </SectionTitle>
                {formData.items.map((item, index) => (
                  <ItemRow key={index}>
                    <Grid container spacing={2} alignItems="center">
                      {isProductBillType ? (
                        <>
                          <Grid item xs={12} sm={4}>
                            <Autocomplete
                              options={stocks}
                              getOptionLabel={(option) => option.productName}
                              onChange={(e, selectedStock) =>
                                handleItemSelection(index, selectedStock)
                              }
                              renderInput={(params) => (
                                <StyledTextField
                                  {...params}
                                  label="Product"
                                  fullWidth
                                  size="small"
                                />
                              )}
                              value={
                                stocks.find(
                                  (s) => s.productName === item.description
                                ) || null
                              }
                              isOptionEqualToValue={(option, value) =>
                                option.productName === value?.productName
                              }
                            />
                          </Grid>
                          <Grid item xs={6} sm={2}>
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
                          <Grid item xs={6} sm={1.5}>
                            <StyledTextField
                              label="GST"
                              value={item.GST}
                              onChange={(e) =>
                                handleItemChange(index, "GST", e.target.value)
                              }
                              fullWidth
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6} sm={1.5}>
                            <StyledTextField
                              label="Qty"
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              fullWidth
                              size="small"
                            />
                          </Grid>
                          <Grid item xs={6} sm={2}>
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
                              handleItemChange(
                                index,
                                "description",
                                e.target.value
                              )
                            }
                            fullWidth
                          />
                        </Grid>
                      )}
                      <Grid item xs={isProductBillType ? 12 : 1} sm={1}>
                        <DeleteRowButton onClick={() => removeItem(index)}>
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </DeleteRowButton>
                      </Grid>
                    </Grid>
                  </ItemRow>
                ))}
                <AddItemButton
                  variant="outlined"
                  onClick={addItem}
                  startIcon={<AddIcon />}
                  fullWidth
                >
                  Add {isProductBillType ? "Product" : "Comment"}
                </AddItemButton>
              </FormSection>

              {/* Discount and Total */}
              <FormSection>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={6} md={4}>
                    <StyledTextField
                      label="Discount (%)"
                      name="discount"
                      type="number"
                      value={formData.discount}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={8}>
                    <TotalCard>
                      <TotalLabel>Total Amount</TotalLabel>
                      <TotalValue>
                        ₹{formData.totalAmount.toFixed(2)}
                      </TotalValue>
                    </TotalCard>
                  </Grid>
                </Grid>
              </FormSection>

              {/* Bill Preview */}
              <FormSection>
                <SectionTitle>Bill Preview</SectionTitle>
                <PreviewWrapper>
                  <PreviewTable>
                    <thead>
                      <tr>
                        {[
                          "Product",
                          "HSN",
                          "GST (%)",
                          "Qty",
                          "Price",
                          "Total",
                        ].map((header) => (
                          <PreviewTh key={header}>{header}</PreviewTh>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => {
                        const quantity = parseInt(item.quantity || 0, 10);
                        const price = parseFloat(item.price || 0);
                        const itemTotal = quantity * price;

                        if (isProductBillType) {
                          return (
                            <tr key={index}>
                              <PreviewTd>{item.description || "—"}</PreviewTd>
                              <PreviewTd>{item.HSN || "—"}</PreviewTd>
                              <PreviewTd>{item.GST || 0}</PreviewTd>
                              <PreviewTd>{quantity}</PreviewTd>
                              <PreviewTd>₹{price.toFixed(2)}</PreviewTd>
                              <PreviewTd>₹{itemTotal.toFixed(2)}</PreviewTd>
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
                      {formData.type === "Consulting" &&
                        formData.consultingFee > 0 && (
                          <tr>
                            <PreviewTd
                              colSpan={5}
                              style={{ textAlign: "right", fontWeight: 500 }}
                            >
                              Consulting Fee
                            </PreviewTd>
                            <PreviewTd style={{ fontWeight: 500 }}>
                              ₹{parseFloat(formData.consultingFee).toFixed(2)}
                            </PreviewTd>
                          </tr>
                        )}
                      {formData.type === "Treatment" &&
                        formData.treatmentFee > 0 && (
                          <tr>
                            <PreviewTd
                              colSpan={5}
                              style={{ textAlign: "right", fontWeight: 500 }}
                            >
                              Treatment Fee
                            </PreviewTd>
                            <PreviewTd style={{ fontWeight: 500 }}>
                              ₹{parseFloat(formData.treatmentFee).toFixed(2)}
                            </PreviewTd>
                          </tr>
                        )}
                      <tr>
                        <PreviewTd colSpan={5} style={{ textAlign: "right" }}>
                          Subtotal
                        </PreviewTd>
                        <PreviewTd>₹{previewSubtotal.toFixed(2)}</PreviewTd>
                      </tr>
                      <tr>
                        <PreviewTd colSpan={5} style={{ textAlign: "right" }}>
                          Discount ({formData.discount || 0}%)
                        </PreviewTd>
                        <PreviewTd>-₹{previewDiscount.toFixed(2)}</PreviewTd>
                      </tr>
                      <tr>
                        <PreviewTd
                          colSpan={5}
                          style={{ textAlign: "right", fontWeight: 600 }}
                        >
                          Total
                        </PreviewTd>
                        <PreviewTd style={{ fontWeight: 600 }}>
                          ₹{formData.totalAmount.toFixed(2)}
                        </PreviewTd>
                      </tr>
                      <tr>
                        <PreviewTd colSpan={5} style={{ textAlign: "right" }}>
                          Payment
                        </PreviewTd>
                        <PreviewTd>{formData.typeOfPayment || "N/A"}</PreviewTd>
                      </tr>
                    </tbody>
                  </PreviewTable>
                </PreviewWrapper>
              </FormSection>

              {/* Action Buttons */}
              <ActionSection>
                <DownloadButton
                  variant="contained"
                  onClick={handleDownloadBill}
                  startIcon={<DownloadIcon />}
                >
                  Download Bill
                </DownloadButton>
                <SaveTransactionButton
                  variant="outlined"
                  onClick={handleSaveTransaction}
                  startIcon={<SaveIcon />}
                >
                  Save Transaction
                </SaveTransactionButton>
              </ActionSection>
            </form>
          )}

          {/* Snackbars */}
          <Snackbar
            open={!!errorMessage}
            autoHideDuration={4000}
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

          {/* Bill History for existing patient */}
          {isExistingPatientRoute && filteredBills.length > 0 && (
            <HistorySection>
              <SectionTitle>Bill History for {formData.name}</SectionTitle>
              <TableWrapper>
                <StyledTableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <StyledTableHeadCell>Bill ID</StyledTableHeadCell>
                        <StyledTableHeadCell>Date</StyledTableHeadCell>
                        <StyledTableHeadCell>Type</StyledTableHeadCell>
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
                        if (bill.type === "Consulting")
                          feeValue = bill.consultingFee || 0;
                        else if (bill.type === "Treatment")
                          feeValue = bill.treatmentFee || 0;
                        const subtotal = itemSubtotal + feeValue;
                        const total =
                          subtotal - (subtotal * (bill.discount || 0)) / 100;

                        return (
                          <StyledTableRow key={index}>
                            <StyledTableCell>
                              <BillIdChip
                                label={`B${(index + 1)
                                  .toString()
                                  .padStart(3, "0")}`}
                              />
                            </StyledTableCell>
                            <StyledTableCell>
                              {new Date(bill.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </StyledTableCell>
                            <StyledTableCell>
                              <TypeChip label={bill.type || "Product"} />
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              <TotalAmount>₹{total.toFixed(2)}</TotalAmount>
                            </StyledTableCell>
                            <StyledTableCell>
                              <PaymentChip
                                label={bill.typeOfPayment || "N/A"}
                              />
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <ActionButtonsWrapper>
                                <ActionButton
                                  onClick={() => setEditingBill(bill)}
                                >
                                  <EditIcon sx={{ fontSize: 18 }} />
                                </ActionButton>
                                <ActionButton
                                  onClick={() => setBillToDelete(bill)}
                                  isDelete
                                >
                                  <DeleteIcon sx={{ fontSize: 18 }} />
                                </ActionButton>
                                <ActionButton
                                  onClick={() => togglePreview(bill._id)}
                                >
                                  {previewedBillId === bill._id ? (
                                    <VisibilityOffIcon sx={{ fontSize: 18 }} />
                                  ) : (
                                    <VisibilityIcon sx={{ fontSize: 18 }} />
                                  )}
                                </ActionButton>
                                <DownloadLink
                                  href={bill.downloadLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <DownloadIcon sx={{ fontSize: 18 }} />
                                </DownloadLink>
                              </ActionButtonsWrapper>
                            </StyledTableCell>
                          </StyledTableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
              </TableWrapper>

              {previewedBillId && (
                <BillPreview
                  bill={billHistory.find(
                    (bill) => bill._id === previewedBillId
                  )}
                />
              )}
            </HistorySection>
          )}
        </ContentCard>

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

const FormSection = styled(Box)({
  marginBottom: spacing[8],
  padding: spacing[6],
  backgroundColor: colors.surface.container,
  borderRadius: borderRadius.lg,
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
      borderColor: colors.border.light,
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
  },
  "& .MuiInputBase-input": {
    fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.sm,
  },
});

const ItemRow = styled(Box)({
  padding: spacing[4],
  backgroundColor: colors.surface.background,
  borderRadius: borderRadius.md,
  marginBottom: spacing[3],
  border: `1px solid ${colors.border.light}`,
});

const DeleteRowButton = styled(IconButton)({
  color: colors.text.tertiary,
  "&:hover": {
    color: colors.error.main,
    backgroundColor: alpha(colors.error.main, 0.08),
  },
});

const AddItemButton = styled(Button)({
  marginTop: spacing[3],
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  textTransform: "none",
  borderRadius: borderRadius.button,
  borderColor: colors.primary.main,
  color: colors.primary.main,
  "&:hover": {
    borderColor: colors.primary.dark,
    backgroundColor: alpha(colors.primary.main, 0.04),
  },
});

const TotalCard = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: spacing[5],
  backgroundColor: colors.primary.surface,
  borderRadius: borderRadius.lg,
  border: `1px solid ${alpha(colors.primary.main, 0.2)}`,
});

const TotalLabel = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.medium,
  color: colors.primary.main,
});

const TotalValue = styled(Typography)({
  fontFamily: typography.fontFamily.display,
  fontSize: typography.fontSize["2xl"],
  fontWeight: typography.fontWeight.medium,
  color: colors.primary.main,
});

const PreviewWrapper = styled(Box)({
  padding: spacing[4],
  backgroundColor: colors.surface.background,
  borderRadius: borderRadius.md,
  overflowX: "auto",
  border: `1px solid ${colors.border.light}`,
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

const ActionSection = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: spacing[3],
  marginTop: spacing[4],
});

const DownloadButton = styled(Button)({
  padding: "14px 28px",
  borderRadius: borderRadius.button,
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.medium,
  textTransform: "none",
  backgroundColor: colors.primary.main,
  color: colors.primary.onPrimary,
  "&:hover": {
    backgroundColor: colors.primary.dark,
  },
});

const SaveTransactionButton = styled(Button)({
  padding: "14px 28px",
  borderRadius: borderRadius.button,
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.base,
  fontWeight: typography.fontWeight.medium,
  textTransform: "none",
  borderColor: colors.primary.main,
  color: colors.primary.main,
  "&:hover": {
    borderColor: colors.primary.dark,
    backgroundColor: alpha(colors.primary.main, 0.04),
  },
});

const HistorySection = styled(Box)({
  marginTop: spacing[10],
  paddingTop: spacing[8],
  borderTop: `1px solid ${colors.border.light}`,
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
  height: "26px",
  backgroundColor: colors.surface.containerHigh,
});

const TypeChip = styled(Chip)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.xs,
  height: "24px",
  backgroundColor: colors.surface.container,
});

const PaymentChip = styled(Chip)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.xs,
  height: "24px",
  backgroundColor: colors.primary.surface,
  color: colors.primary.main,
});

const TotalAmount = styled(Typography)({
  fontFamily: typography.fontFamily.primary,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.medium,
  color: colors.success.main,
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
  "&:hover": {
    color: isDelete ? colors.error.main : colors.primary.main,
    backgroundColor: isDelete
      ? alpha(colors.error.main, 0.08)
      : alpha(colors.primary.main, 0.08),
  },
}));

const DownloadLink = styled("a")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: colors.text.secondary,
  padding: "6px",
  borderRadius: borderRadius.full,
  "&:hover": {
    color: colors.success.main,
    backgroundColor: alpha(colors.success.main, 0.08),
  },
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

export default Transaction;
