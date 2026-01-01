const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const PizZip = require("pizzip");
const Docxtemplater = require("docxtemplater");
const fs = require("fs").promises;
const path = require("path");
// Use the official iLovePDF Node.js SDK
const ILovePDFApi = require("@ilovepdf/ilovepdf-nodejs");
const ILovePDFFile = require("@ilovepdf/ilovepdf-nodejs/ILovePDFFile");

// Auth imports
const { authenticateToken, requireAdmin } = require("./middleware/auth");
const { router: authRoutes, seedUsers } = require("./routes/auth");

const app = express();

// --- START: Configuration ---
// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// iLovePDF API Keys (from environment variables)
const ILOVEPDF_PUBLIC_KEY = process.env.ILOVEPDF_PUBLIC_KEY;
const ILOVEPDF_SECRET_KEY = process.env.ILOVEPDF_SECRET_KEY;
const ilovepdf = new ILovePDFApi(ILOVEPDF_PUBLIC_KEY, ILOVEPDF_SECRET_KEY);

// MongoDB Connections - handled by dbSwitcher middleware
const {
  attachDbModels,
  models,
  originalConnection,
} = require("./middleware/dbSwitcher");

// Default connection for auth (users stored in original db only)
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI_ORIGINAL;
const mongoose_default = require("mongoose");
mongoose_default
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB (Default) connected for auth");
    // Seed default users (admin, staff, visitor) on startup
    await seedUsers();
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
// --- END: Configuration ---

// --- START: Routes ---
// Auth routes (public - no authentication required for login)
app.use("/auth", authRoutes);

// Create route factories that use dynamic models from request
const createStockRoutes = require("./routes/stock");
const createPatientRoutes = require("./routes/patient");
const createPurchaseRoutes = require("./routes/purchase");

app.use("/stocks", createStockRoutes);
app.use("/patients", createPatientRoutes);
app.use("/purchases", createPurchaseRoutes);

app.get("/", (req, res) => {
  res.json("Hello World");
});

// Bill model is accessed via req.db after attachDbModels middleware

// Bill Generation Endpoint (MODIFIED to switch templates) - Admin only
app.post(
  "/generate-bill",
  authenticateToken,
  attachDbModels,
  requireAdmin,
  async (req, res) => {
    const Bill = req.db.Bill; // Use dynamic Bill model based on user role
    const isSpecialBill =
      req.body.type === "Consulting" || req.body.type === "Treatment";
    const templateName = isSpecialBill
      ? "bill_template_1.docx"
      : "bill_template.docx";
    const tmpDocxPath = path.join(
      "/tmp",
      `bill-${req.body.id}-${Date.now()}.docx`
    );

    try {
      const {
        id,
        name,
        phone,
        address,
        age,
        date,
        items,
        discount,
        typeOfPayment,
        consultingFee,
        treatmentFee,
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Missing required fields (ID)." });
      }
      const billItems = Array.isArray(items) ? items : [];
      if (!typeOfPayment) {
        return res.status(400).json({ error: "Type of Payment is required." });
      }

      const discountValue = isNaN(parseFloat(discount))
        ? 0
        : parseFloat(discount);

      // 1. Calculate item subtotal
      const itemTotals = billItems.map((item) => ({
        ...item,
        // Ensure product fields are zeroed if it's a special bill (to prevent template rendering issues)
        price: isSpecialBill ? 0 : parseFloat(item.price || 0),
        quantity: isSpecialBill ? 0 : parseInt(item.quantity || 0, 10),
        HSN: isSpecialBill ? "" : item.HSN || "",
        GST: isSpecialBill ? 0 : item.GST || 0,
        baseTotal: isSpecialBill
          ? 0
          : (
              parseFloat(item.price || 0) * parseFloat(item.quantity || 0)
            ).toFixed(2),
        finalAmount: isSpecialBill
          ? 0
          : (
              parseFloat(item.price || 0) * parseFloat(item.quantity || 0)
            ).toFixed(2),
      }));
      const itemSubtotal = itemTotals.reduce(
        (sum, item) => sum + parseFloat(item.baseTotal),
        0
      );

      // 2. Calculate and add fee (MODIFIED logic)
      let feeValue = 0;
      let feeLabel = "";

      if (req.body.type === "Consulting") {
        feeValue = parseFloat(consultingFee || 0);
        feeLabel = "Consulting Fee";
      } else if (req.body.type === "Treatment") {
        feeValue = parseFloat(treatmentFee || 0);
        feeLabel = "Treatment Fee";
      }

      const subtotal = itemSubtotal + feeValue; // Combined subtotal

      // 3. Apply discount
      const finalTotal = (subtotal - (subtotal * discountValue) / 100).toFixed(
        2
      );

      const newBill = new Bill({
        id,
        name,
        phone,
        address,
        age,
        date,
        type: req.body.type || "",
        items: itemTotals,
        discount: discountValue,
        typeOfPayment,
        consultingFee: req.body.type === "Consulting" ? feeValue : 0,
        treatmentFee: req.body.type === "Treatment" ? feeValue : 0,
      });
      await newBill.save();

      const templatePath = path.resolve(__dirname, templateName);
      const content = await fs.readFile(templatePath, "binary");
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Date format for dd/mm/yyyy in Indian English locale
      const displayDate = date
        ? new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

      doc.setData({
        id,
        name,
        phone,
        address,
        age: age || "",
        type: req.body.type || "",
        date: displayDate.replace(/\//g, "-"),
        items: itemTotals,
        subtotal: subtotal.toFixed(2),
        discount: discountValue.toFixed(2),
        consultingFee:
          req.body.type === "Consulting" ? feeValue.toFixed(2) : "",
        treatmentFee: req.body.type === "Treatment" ? feeValue.toFixed(2) : "",
        // NEW fields for bill_template_1.docx
        feeLabel: isSpecialBill ? feeLabel : "",
        feeValue: isSpecialBill ? feeValue.toFixed(2) : "",
        typeOfPayment: typeOfPayment || "N/A",
        total: finalTotal,
      });
      doc.render();
      const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });

      // --- PDF Conversion using a temporary file ---
      await fs.writeFile(tmpDocxPath, docxBuffer);

      const task = ilovepdf.newTask("officepdf");
      await task.start();
      const file = new ILovePDFFile(tmpDocxPath);
      await task.addFile(file);
      await task.process();
      const pdfData = await task.download();

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=bill-${id}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfData);
    } catch (err) {
      console.error("Error during bill generation:", err);
      res.status(500).json({
        error: "Internal server error.",
        message: err.message,
        stack: err.stack,
      });
    } finally {
      try {
        await fs.unlink(tmpDocxPath);
      } catch (cleanupErr) {
        console.error("Error cleaning up temporary file:", cleanupErr);
      }
    }
  }
);

// Download a specific bill by ID as PDF (MODIFIED to switch templates) - All authenticated users
app.get(
  "/bills/download/:billId",
  authenticateToken,
  attachDbModels,
  async (req, res) => {
    const Bill = req.db.Bill; // Use dynamic Bill model based on user role
    const tmpDocxPath = path.join(
      "/tmp",
      `bill-${req.params.billId}-${Date.now()}.docx`
    );
    try {
      const { billId } = req.params;
      const bill = await Bill.findById(billId);
      if (!bill) return res.status(404).send("Bill not found");

      const isSpecialBill =
        bill.type === "Consulting" || bill.type === "Treatment";
      const templateName = isSpecialBill
        ? "bill_template_1.docx"
        : "bill_template.docx";
      const templatePath = path.resolve(__dirname, templateName);

      const content = await fs.readFile(templatePath, "binary");
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      // Calculate totals including consulting/treatment fee
      const itemSubtotal = bill.items.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
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
      const total = subtotal - (subtotal * (bill.discount || 0)) / 100;

      // Date format for dd/mm/yyyy in Indian English locale
      const displayDate = bill.date
        ? new Date(bill.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : new Date(bill.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

      doc.setData({
        id: bill.id,
        name: bill.name,
        phone: bill.phone,
        address: bill.address,
        age: bill.age || "",
        type: bill.type || "",
        date: displayDate.replace(/\//g, "-"),
        items: bill.items,
        subtotal: subtotal.toFixed(2),
        discount: (bill.discount || 0).toFixed(2),
        consultingFee: bill.type === "Consulting" ? feeValue.toFixed(2) : "",
        treatmentFee: bill.type === "Treatment" ? feeValue.toFixed(2) : "",
        // NEW fields for bill_template_1.docx
        feeLabel: isSpecialBill ? feeLabel : "",
        feeValue: isSpecialBill ? feeValue.toFixed(2) : "",
        typeOfPayment: bill.typeOfPayment || "N/A",
        total: total.toFixed(2),
      });

      doc.render();
      const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });

      // **FIX:** Write buffer to a temporary file first
      await fs.writeFile(tmpDocxPath, docxBuffer);

      const task = ilovepdf.newTask("officepdf");
      await task.start();
      const file = new ILovePDFFile(tmpDocxPath);
      await task.addFile(file);
      await task.process();
      const pdfData = await task.download();

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=bill-${billId}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfData);
    } catch (err) {
      console.error("Error downloading bill:", err);
      res.status(500).json({
        error: "Internal server error.",
        message: err.message,
        stack: err.stack,
      });
    } finally {
      // **IMPORTANT:** Clean up the temporary file
      try {
        await fs.unlink(tmpDocxPath);
      } catch (cleanupErr) {
        console.error("Error cleaning up temporary file:", cleanupErr);
      }
    }
  }
);

app.get(
  "/bills-history",
  authenticateToken,
  attachDbModels,
  async (req, res) => {
    const Bill = req.db.Bill; // Use dynamic Bill model based on user role
    try {
      // Sort by creation date for a stable chronological order
      const bills = await Bill.find().sort({ createdAt: 1 });
      res.json(bills);
    } catch (error) {
      console.error("Error fetching bill history:", error);
      res.status(500).json({ error: "Error fetching bill history." });
    }
  }
);

app.delete(
  "/bills/:billId",
  authenticateToken,
  attachDbModels,
  requireAdmin,
  async (req, res) => {
    const Bill = req.db.Bill; // Use dynamic Bill model based on user role
    try {
      const { billId } = req.params;
      const bill = await Bill.findByIdAndDelete(billId);
      if (!bill) {
        return res.status(404).json({ error: "Bill not found" });
      }
      res.json({ message: "Bill deleted successfully." });
    } catch (error) {
      res.status(500).json({ error: "Error deleting the bill." });
    }
  }
);

app.put(
  "/bills/:billId",
  authenticateToken,
  attachDbModels,
  requireAdmin,
  async (req, res) => {
    const Bill = req.db.Bill; // Use dynamic Bill model based on user role
    try {
      const { billId } = req.params;
      const { items, discount, typeOfPayment } = req.body;
      const updatedBill = await Bill.findByIdAndUpdate(
        billId,
        { items, discount, typeOfPayment },
        { new: true }
      );
      if (!updatedBill) {
        return res.status(404).json({ error: "Bill not found" });
      }
      res.json({ message: "Bill updated successfully." });
    } catch (error) {
      res.status(500).json({ error: "Error updating the bill." });
    }
  }
);
// --- END: Routes ---

// --- START: Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// --- END: Server ---
