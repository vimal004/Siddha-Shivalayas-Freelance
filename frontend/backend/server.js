const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://2004vimal:zaq1%40wsx@cluster0.kfsrfxi.mongodb.net/SiddhaShivalayas",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
const stockRoutes = require("./routes/stock");
const patientRoutes = require("./routes/patient");

app.use("/stocks", stockRoutes);
app.use("/patients", patientRoutes);

app.get("/", (req, res) => {
  res.json("Hello World");
});

// Cache the template content to avoid reading it multiple times
const templatePath = path.resolve(__dirname, "bill_template.docx");
let content;
try {
  content = fs.readFileSync(templatePath, "binary");
} catch (err) {
  console.error("Error loading template file:", err);
  process.exit(1); // Exit the process if template loading fails
}

// Optimized Bill Generation Endpoint
app.post("/generate-bill", (req, res) => {
  const {
    id,
    name,
    phone,
    address,
    treatmentOrMedicine,
    date,
    items,
    discount,
  } = req.body;

  // Validation: Ensure all required fields are provided
  if (
    !id ||
    !name ||
    !phone ||
    !address ||
    !date ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).send("Error: Missing required fields.");
  }

  // Validate items structure
  for (let item of items) {
    if (!item.description || !item.price || !item.quantity || !item.GST) {
      return res
        .status(400)
        .send(
          "Error: Each item must have description, price, quantity, and GST."
        );
    }
    if (isNaN(item.price) || isNaN(item.quantity) || isNaN(item.GST)) {
      return res
        .status(400)
        .send("Error: Price, quantity, and GST must be valid numbers.");
    }
  }

  // Ensure discount is a valid number (if undefined, default to 0)
  const discountValue = isNaN(discount) ? 0 : parseFloat(discount);

  // Process items and calculate totals
  const itemTotals = items.map((item) => {
    const itemPrice = parseFloat(item.price);
    const itemQuantity = parseFloat(item.quantity);
    const gstRate = parseFloat(item.GST) / 100;

    const baseTotal = itemPrice * itemQuantity;
    const gstAmount = baseTotal * gstRate;
    const finalAmount = baseTotal + gstAmount;

    return {
      ...item,
      baseTotal: baseTotal.toFixed(2),
      gstAmount: gstAmount.toFixed(2),
      finalAmount: finalAmount.toFixed(2),
    };
  });

  // Calculate subtotal, total GST, and final total
  const subtotal = itemTotals.reduce(
    (sum, item) => sum + parseFloat(item.baseTotal),
    0
  );
  const totalGST = itemTotals.reduce(
    (sum, item) => sum + parseFloat(item.gstAmount),
    0
  );
  const finalTotal = (subtotal + totalGST - discountValue).toFixed(2);

  // Create a new Docxtemplater instance for each request
  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

  try {
    // Set data for Docxtemplater
    doc.setData({
      id,
      name,
      phone,
      address,
      treatmentOrMedicine,
      date,
      items: itemTotals, // Pass items array with calculated values to the document template
      subtotal: subtotal.toFixed(2),
      totalGST: totalGST.toFixed(2),
      discount: discountValue.toFixed(2),
      total: finalTotal,
    });

    // Render the document only once after setting all data
    doc.render();

    // Generate the document buffer
    const buf = doc.getZip().generate({ type: "nodebuffer" });

    // Send the generated document as a downloadable response
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=generated-bill-${id}.docx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buf);
  } catch (err) {
    console.error("Error during bill generation:", err);
    return res.status(500).send("Internal server error during bill generation");
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
