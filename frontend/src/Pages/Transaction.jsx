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

const Transaction = () => {
  let id = window.location.pathname.split("/")[2];
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
    treatmentOrMedicine: "",
    date: "",
    items: [], // Initialize items as an empty array
    discount: 0,
  });
  const [created, setCreated] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    <Container maxWidth="md" style={{ marginTop: "50px" }}>
      <div
        style={{
          background: "#ffffff",
          boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.1)",
          padding: "24px",
          borderRadius: "8px",
          width: "100%",
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          <strong>Generate Bill</strong>
        </Typography>
        <form>
          <Grid container spacing={2}>
            {/* Patient Details */}
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <TextField
                label="Patient Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                variant="outlined"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
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

            {/* Items Section */}
            <Typography variant="h6" style={{ margin: "16px 0" }}>
              Items
            </Typography>
            {formData.items.map((item, index) => (
              <Grid container spacing={2} key={index}>
                <Grid item xs={3}>
                  <TextField
                    label="Description"
                    value={item.description}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="HSN"
                    value={item.HSN}
                    onChange={(e) =>
                      handleItemChange(index, "HSN", e.target.value)
                    }
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="GST"
                    value={item.GST}
                    onChange={(e) =>
                      handleItemChange(index, "GST", e.target.value)
                    }
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Quantity"
                    value={item.quantity}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={2}>
                  <TextField
                    label="Price"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(index, "price", e.target.value)
                    }
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={1}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </Button>
                </Grid>
              </Grid>
            ))}
            <Grid item xs={12}>
              <Button variant="contained" onClick={addItem}>
                Add Item
              </Button>
            </Grid>

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

          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadBill}
            style={{ marginTop: "16px" }}
          >
            Download Bill
          </Button>
        </form>

        {/* Alerts */}
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
