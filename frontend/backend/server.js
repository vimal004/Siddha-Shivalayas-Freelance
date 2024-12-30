const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

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

// Bill Schema (Model for storing bills)
const BillSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  treatmentOrMedicine: { type: String, required: true },
  date: { type: Date, required: true },
  items: [
    {
      description: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      GST: { type: Number, required: true },
      baseTotal: { type: Number, required: true },
      gstAmount: { type: Number, required: true },
      finalAmount: { type: Number, required: true },
    },
  ],
  discount: { type: Number, default: 0 },
});

const Bill = mongoose.model("Bill", BillSchema);

// Routes

// Fetch all bill history
app.get("/bills-history", async (req, res) => {
  try {
    const bills = await Bill.find(); // Fetch all bills from MongoDB
    res.json(bills); // Send all bills as a response
  } catch (error) {
    console.error("Error fetching bill history:", error);
    res.status(500).json({ error: "Error fetching bill history." });
  }
});

// Fetch a specific bill by ID and return as .docx
app.get("/bills/:billId", async (req, res) => {
  const { billId } = req.params;

  try {
    // Find the bill from MongoDB by the given billId
    const bill = await Bill.findOne({ id: billId });

    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    // Load the bill template file (DOCX format)
    const templatePath = path.resolve(__dirname, "bill_template.docx");
    const content = fs.readFileSync(templatePath, "binary");

    // Create a new Docxtemplater instance
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Set the template data (bill details)
    doc.setData({
      id: bill.id,
      name: bill.name,
      phone: bill.phone,
      address: bill.address,
      treatmentOrMedicine: bill.treatmentOrMedicine,
      date: bill.date,
      items: bill.items,
      subtotal: bill.items
        .reduce((sum, item) => sum + item.baseTotal, 0)
        .toFixed(2),
      totalGST: bill.items
        .reduce((sum, item) => sum + item.gstAmount, 0)
        .toFixed(2),
      discount: bill.discount.toFixed(2),
      total: (
        bill.items.reduce((sum, item) => sum + item.baseTotal, 0) -
        bill.discount
      ).toFixed(2),
    });

    // Render the document
    doc.render();

    // Generate the document buffer
    const buf = doc.getZip().generate({ type: "nodebuffer" });

    // Send the generated document as a downloadable response
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=generated-bill-${billId}.docx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.send(buf);
  } catch (err) {
    console.error("Error during bill generation:", err);
    res.status(500).send("Internal server error during bill generation");
  }
});

// Endpoint to create a new bill (for testing or future use)
app.post("/generate-bill", async (req, res) => {
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

  // Validation of required fields
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

  // Validate each item in the bill
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

  const newBill = new Bill({
    id,
    name,
    phone,
    address,
    treatmentOrMedicine,
    date,
    items,
    discount,
  });

  try {
    await newBill.save();
    res.status(201).json({ message: "Bill created successfully." });
  } catch (error) {
    console.error("Error creating bill:", error);
    res.status(500).json({ error: "Error creating bill." });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
