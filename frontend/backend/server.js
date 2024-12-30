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

// Bill Model (Schema for storing bills)
const BillSchema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  address: String,
  treatmentOrMedicine: String,
  date: Date,
  items: Array, // List of items with their details
  discount: Number,
});

const Bill = mongoose.model("Bill", BillSchema);

// Routes
app.get("/", (req, res) => {
  res.json("Hello World");
});

// Fetch all bill history
app.get("/bills-history", async (req, res) => {
  try {
    const bills = await Bill.find(); // Fetch bills from the database
    res.json(bills);
  } catch (error) {
    console.error("Error fetching bill history:", error);
    res.status(500).json({ error: "Error fetching bill history." });
  }
});

// Fetch a specific bill by ID
app.get("/bills/:billId", async (req, res) => {
  const { billId } = req.params;
  try {
    const bill = await Bill.findOne({ id: billId }); // Find the bill by ID
    if (!bill) {
      return res.status(404).json({ error: "Bill not found" });
    }

    // Load the bill template
    const templatePath = path.resolve(__dirname, "bill_template.docx");
    const content = fs.readFileSync(templatePath, "binary");
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Set data for Docxtemplater
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
