import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Snackbar,
  Grid,
  Typography,
  Container,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import { Autocomplete } from "@mui/material";

const Transaction = () => {
  const handleItemSelection = (index, selectedStock) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      description: selectedStock.productName,
      price: selectedStock.price,
      GST: selectedStock.gst,
      HSN: selectedStock.hsnCode,
    };
    setFormData({ ...formData, items: updatedItems });
  };
  let id = window.location.pathname.split("/")[2];
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
    treatmentOrMedicine: "",
    date: "",
    items: [],
    discount: 0,
  });
  const [stocks, setstocks] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    axios
      .get("https://siddha-shivalayas-backend.vercel.app/stocks")
      .then((response) => {
        setstocks(response.data);
        console.log(stocks);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    console.log(stocks);
  }, [stocks]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    axios
      .get(`https://siddha-shivalayas-backend.vercel.app/patients/${id}`)
      .then((response) => {
        setFormData({ ...formData, ...response.data });
      })
      .catch((error) => console.error(error));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    if (field === "quantity") {
      const selectedStock = stocks.find(
        (stock) => stock.productName === updatedItems[index].description
      );
      if (selectedStock && value > selectedStock.quantity) {
        setErrorMessage("Insufficient stock available");
        return;
      }
    }
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
  };


  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", HSN: "", GST: "", quantity: "", price: "" },
      ],
    });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleDownloadBill = async () => {
    try {
      const response = await axios.post(
        "https://siddha-shivalayas-backend.vercel.app/generate-bill",
        formData,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `generated-bill-${formData.id}.docx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error downloading the bill");
    }
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: "50px" }}>
      <div
        style={{
          background: "#ffffff",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
          padding: "40px",
          borderRadius: "12px",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          <strong>Generate Bill</strong>
        </Typography>

        <form>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Patient ID"
                name="id"
                value={formData.id}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Patient Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Items
              </Typography>
              {formData.items.map((item, index) => (
                <Grid container spacing={2} key={index} alignItems="center" margin={"2px"}>
                  <Grid item xs={12} sm={3}>
                    <Autocomplete
                      options={stocks}
                      getOptionLabel={(option) => option.productName}
                      onChange={(event, selectedStock) =>
                        handleItemSelection(index, selectedStock)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Name"
                          variant="outlined"
                          fullWidth
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="HSN"
                      value={item.HSN || ""}
                      onChange={(e) =>
                        handleItemChange(index, "HSN", e.target.value)
                      }
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="GST"
                      value={item.GST || ""}
                      onChange={(e) =>
                        handleItemChange(index, "GST", e.target.value)
                      }
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="Quantity"
                      value={item.quantity || ""}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="Price"
                      value={item.price || ""}
                      onChange={(e) =>
                        handleItemChange(index, "price", e.target.value)
                      }
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => removeItem(index)}
                      fullWidth
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              ))}
              <Button
                variant="contained"
                onClick={addItem}
                style={{ marginTop: "16px" }}
              >
                Add Item
              </Button>
            </Grid>
            ;
            <Grid item xs={12}>
              <TextField
                label="Discount"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
          </Grid>
          <Grid container justifyContent="center" style={{ marginTop: "24px" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadBill}
            >
              Download Bill
            </Button>
          </Grid>
        </form>

        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={4000}
          onClose={() => setErrorMessage("")}
        >
          <MuiAlert elevation={6} variant="filled" severity="error">
            {errorMessage}
          </MuiAlert>
        </Snackbar>
      </div>
    </Container>
  );
};

export default Transaction;
