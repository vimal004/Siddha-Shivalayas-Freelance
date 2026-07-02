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

// ============================================================
// TEMPLATE HELPER FUNCTIONS
// ============================================================

/**
 * Converts a numeric amount to Indian English words.
 * e.g. 1234.50 → "One Thousand Two Hundred Thirty Four Rupees and Fifty Paise Only"
 */
function numberToWords(amount) {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convertHundreds(n) {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "") + " ";
    return ones[Math.floor(n / 100)] + " Hundred " + convertHundreds(n % 100);
  }

  function convert(n) {
    if (n === 0) return "Zero";
    let result = "";
    if (n >= 10000000) {
      result += convertHundreds(Math.floor(n / 10000000)) + "Crore ";
      n %= 10000000;
    }
    if (n >= 100000) {
      result += convertHundreds(Math.floor(n / 100000)) + "Lakh ";
      n %= 100000;
    }
    if (n >= 1000) {
      result += convertHundreds(Math.floor(n / 1000)) + "Thousand ";
      n %= 1000;
    }
    result += convertHundreds(n);
    return result.trim();
  }

  if (isNaN(amount) || amount == null) return "Zero Rupees Only";
  const numAmount = parseFloat(amount);
  const rupees = Math.floor(numAmount);
  const paise = Math.round((numAmount - rupees) * 100);
  let words = convert(rupees) + " Rupees";
  if (paise > 0) {
    words += " and " + convert(paise) + " Paise";
  }
  return words + " Only";
}

/**
 * Reads the DOCX template and fixes its XML on-the-fly so that
 * Docxtemplater can render it correctly. Specifically:
 *
 * 1. The template uses {{field}} (double-brace) – converts to {field}
 * 2. {{finalAmount}} is split across XML runs by Word's spell-checker –
 *    merges those runs and fixes the adjacent {/items} loop-close tag
 * 3. The items row loop-start tag {#items} is missing – injects it into
 *    the first (empty) cell of the data row
 *
 * None of these changes affect the visual design of the bill.
 */
async function prepareDocxTemplate(templatePath) {
  const content = await fs.readFile(templatePath, "binary");
  const zip = new PizZip(content);
  let xml = zip.files["word/document.xml"].asText();

  // Fix 1: {{field}} → {field}  (handles all tags in single <w:t> runs)
  xml = xml.replace(/\{\{([a-zA-Z][a-zA-Z0-9]*)\}\}/g, "{$1}");

  // Fix 2: Word's spell-checker splits {{finalAmount}}{/items} across
  // multiple <w:r> runs.  Collapse them into two clean tags.
  //
  // Original XML sequence (concatenated text = "{{finalAmount}{/items}}"):
  //   <w:r><w:t>{</w:t></w:r>
  //   <w:r><w:t>{</w:t></w:r>
  //   <w:proofErr w:type="spellStart"/>
  //   <w:r><w:t>finalAmount</w:t></w:r>
  //   <w:proofErr w:type="spellEnd"/>
  //   <w:r><w:t>}{/items</w:t></w:r>
  //   <w:r><w:t>}</w:t></w:r>
  //   <w:r><w:t>}</w:t></w:r>
  const splitFinalAmountRe =
    /<w:r><w:t>\{<\/w:t><\/w:r><w:r><w:t>\{<\/w:t><\/w:r>(?:<w:proofErr[^>]*\/>)*<w:r><w:t>finalAmount<\/w:t><\/w:r>(?:<w:proofErr[^>]*\/>)*<w:r><w:t>\}\{\/items<\/w:t><\/w:r>(?:<w:r><w:t>\}<\/w:t><\/w:r>)*/;

  const fixedXml = xml.replace(
    splitFinalAmountRe,
    "<w:r><w:t>{finalAmount}{/items}</w:t></w:r>"
  );
  if (fixedXml !== xml) {
    xml = fixedXml;
    console.log("✅ Fixed split {{finalAmount}}/{/items} XML runs");
  } else {
    console.warn("⚠️  Could not find split finalAmount pattern – template may already be fixed");
  }

  // Fix 3: Inject the missing {#items} loop-start tag AND {sno} serial-number
  // tag into the first ("SNo") cell of the items data row.
  // The cell is identified by its stable paraId "2C49228E".
  const injectedXml = xml.replace(
    /<w:p\s[^>]*w14:paraId="2C49228E"[^>]*\/>/,
    '<w:p w14:paraId="2C49228E" w14:textId="6A87250A" w:rsidR="003F019A" w:rsidRDefault="003F019A" w:rsidP="003F019A"><w:r><w:t>{#items}{sno}</w:t></w:r></w:p>'
  );
  if (injectedXml !== xml) {
    xml = injectedXml;
    console.log("✅ Injected {#items} + {sno} into items d ata row");
  } else {
    console.warn("⚠️  Could not find items data row to inject {#items}/{sno}");
  }

  zip.file("word/document.xml", xml);
  return zip;
}

/**
 * Maps bill data from the server/DB to the exact field names expected by
 * the DOCX template, and computes all derived values.
 *
 * Template fields:
 *   patientName, patientPhone, patientId, invoiceNo, billDate, paymentMode
 *   items[]  →  description, hsn, qty, rate, gst, discount, finalAmount
 *   subtotal, totalQty, totalDiscount, tax, cgst, sgst,
 *   transportCgst, transportSgst, grandTotal, amountInWords, discountRemark
 */
function buildTemplateData({
  id,
  invoiceNo,
  name,
  phone,
  displayDate,
  typeOfPayment,
  itemTotals,
  discountValue,
  isSpecialBill,
  feeValue,
  feeLabel,
  type,
  subtotal,
  finalTotal,
}) {
  // ── Build display items ────────────────────────────────────────────────
  let displayItems;

  if (isSpecialBill && parseFloat(feeValue || 0) > 0) {
    // Consulting / Treatment: show the fee as a single line item so the
    // items table is never empty and the bill clearly explains the charge.
    const fv = parseFloat(feeValue);
    displayItems = [
      {
        sno: 1,
        description: feeLabel || type || "Service",
        hsn: "",
        qty: 1,
        rate: fv.toFixed(2),
        gst: "0",
        discount: "0",
        finalAmount: fv.toFixed(2),
      },
    ];
  } else {
    displayItems = (itemTotals || [])
      .filter((item) => item !== null && item !== undefined)
      .map((item, idx) => {
        const qty = parseFloat(item.quantity || 0);
        const rate = parseFloat(item.price || 0);
        const gstPct = parseFloat(item.GST || item.gst || 0);
        const discPct = parseFloat(item.discount || 0);
        const base = qty * rate;
        const taxable = base * (1 - discPct / 100);
        const gstAmt = taxable * (gstPct / 100);
        const finalAmt = taxable + gstAmt;

        return {
          sno: idx + 1,
          description: item.productName || item.name || item.description || "",
          hsn: item.HSN || item.hsnCode || "",
          qty,
          rate: rate.toFixed(2),
          gst: gstPct || "0",
          discount: discPct || "0",
          finalAmount: finalAmt > 0 ? finalAmt.toFixed(2) : parseFloat(item.finalAmount || 0).toFixed(2),
        };
      });
  }

  // ── Aggregate totals ───────────────────────────────────────────────────
  const totalQty = displayItems.reduce(
    (s, i) => s + parseFloat(i.qty || 0),
    0
  );

  const totalGSTAmt = displayItems.reduce((s, i) => {
    const qty = parseFloat(i.qty || 0);
    const rate = parseFloat(i.rate || 0);
    const gstPct = parseFloat(i.gst || 0);
    const discPct = parseFloat(i.discount || 0);
    const taxable = qty * rate * (1 - discPct / 100);
    return s + taxable * (gstPct / 100);
  }, 0);

  const totalItemDiscountAmt = displayItems.reduce((s, i) => {
    const qty = parseFloat(i.qty || 0);
    const rate = parseFloat(i.rate || 0);
    const discPct = parseFloat(i.discount || 0);
    return s + qty * rate * (discPct / 100);
  }, 0);

  const headerDiscountAmt =
    parseFloat(subtotal || 0) * (parseFloat(discountValue) || 0) / 100;

  const cgst = (totalGSTAmt / 2).toFixed(2);
  const sgst = (totalGSTAmt / 2).toFixed(2);

  return {
    // ── Header fields ────────────────────────────────────────────────────
    patientName: name || "",
    patientPhone: phone || "",
    patientId: id || "",          // patient's own reference ID
    invoiceNo: invoiceNo || id || "", // auto-generated readable bill number
    billDate: displayDate,
    paymentMode: typeOfPayment || "N/A",

    // ── Items loop ───────────────────────────────────────────────────────
    items: displayItems,

    // ── Summary fields ───────────────────────────────────────────────────
    subtotal: parseFloat(subtotal || 0).toFixed(2),
    totalQty,
    totalDiscount: (totalItemDiscountAmt + headerDiscountAmt).toFixed(2),
    tax: totalGSTAmt.toFixed(2),
    cgst,
    sgst,
    transportCgst: "0.00",
    transportSgst: "0.00",
    grandTotal: parseFloat(finalTotal || 0).toFixed(2),
    amountInWords: numberToWords(parseFloat(finalTotal || 0)),
    discountRemark:
      parseFloat(discountValue) > 0
        ? `${parseFloat(discountValue)}% discount applied`
        : "",
  };
}

// ============================================================
// END: TEMPLATE HELPER FUNCTIONS
// ============================================================

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

// Bill Generation Endpoint - Admin only
app.post(
  "/generate-bill",
  authenticateToken,
  attachDbModels,
  requireAdmin,
  async (req, res) => {
    const Bill = req.db.Bill;
    const isSpecialBill =
      req.body.type === "Consulting" || req.body.type === "Treatment";
    const templateName = "Siddha_Shivalayas_Invoice_Layout_v2.docx";
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

      // ── Generate readable invoice number: SS-YYMM-NNN ─────────────────
      // Count bills already created this calendar month to get sequence #
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const billCountThisMonth = await Bill.countDocuments({
        createdAt: { $gte: monthStart, $lt: nextMonthStart },
      });
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const seq = String(billCountThisMonth + 1).padStart(3, "0");
      const generatedInvoiceNo = `SS-${yy}${mm}-${seq}`;

      // 1. Calculate item subtotal
      const itemTotals = billItems.map((item) => ({
        ...item,
        // Zero out product fields for special bills
        price: isSpecialBill ? 0 : parseFloat(item.price || 0),
        quantity: isSpecialBill ? 0 : parseInt(item.quantity || 0, 10),
        HSN: isSpecialBill ? "" : item.HSN || "",
        GST: isSpecialBill ? 0 : parseFloat(item.GST || 0),
        discount: isSpecialBill ? 0 : parseFloat(item.discount || 0),
        baseTotal: isSpecialBill
          ? 0
          : (parseFloat(item.price || 0) * parseFloat(item.quantity || 0)).toFixed(2),
        finalAmount: isSpecialBill
          ? 0
          : (parseFloat(item.price || 0) * parseFloat(item.quantity || 0)).toFixed(2),
      }));
      const itemSubtotal = itemTotals.reduce(
        (sum, item) => sum + parseFloat(item.baseTotal),
        0
      );

      // 2. Determine fee
      let feeValue = 0;
      let feeLabel = "";
      if (req.body.type === "Consulting") {
        feeValue = parseFloat(consultingFee || 0);
        feeLabel = "Consulting Fee";
      } else if (req.body.type === "Treatment") {
        feeValue = parseFloat(treatmentFee || 0);
        feeLabel = "Treatment Fee";
      }

      const subtotal = itemSubtotal + feeValue;

      // 3. Apply header-level discount
      const finalTotal = (subtotal - (subtotal * discountValue) / 100).toFixed(2);

      // 4. Persist to DB
      const newBill = new Bill({
        id,
        invoiceNo: generatedInvoiceNo,
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

      // 5. Format date for display
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

      // 6. Prepare & render template
      const templatePath = path.resolve(__dirname, templateName);
      const zip = await prepareDocxTemplate(templatePath);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: () => "",   // render missing/undefined tags as empty string
      });

      doc.setData(
        buildTemplateData({
          id,
          invoiceNo: generatedInvoiceNo,
          name,
          phone,
          displayDate: displayDate.replace(/\//g, "-"),
          typeOfPayment,
          itemTotals,
          discountValue,
          isSpecialBill,
          feeValue,
          feeLabel,
          type: req.body.type,
          subtotal,
          finalTotal,
        })
      );
      doc.render();

      const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });

      // 7. Convert to PDF via iLovePDF — fall back to DOCX if conversion fails
      await fs.writeFile(tmpDocxPath, docxBuffer);

      let responseBuffer, contentType, fileName;
      try {
        const task = ilovepdf.newTask("officepdf");
        await task.start();
        const ilovePdfFile = new ILovePDFFile(tmpDocxPath);
        await task.addFile(ilovePdfFile);
        await task.process();
        responseBuffer = await task.download();
        contentType = "application/pdf";
        fileName = `bill-${id}.pdf`;
        console.log("✅ PDF conversion successful");
      } catch (pdfErr) {
        console.error("⚠️ iLovePDF failed – serving DOCX fallback:", pdfErr.message);
        responseBuffer = docxBuffer;
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        fileName = `bill-${id}.docx`;
      }

      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      res.setHeader("Content-Type", contentType);
      res.send(responseBuffer);
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
        // Silently ignore cleanup errors
      }
    }
  }
);

// Download a specific bill by ID as PDF - All authenticated users
app.get(
  "/bills/download/:billId",
  authenticateToken,
  attachDbModels,
  async (req, res) => {
    const Bill = req.db.Bill;
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
      const templateName = "Siddha_Shivalayas_Invoice_Layout_v2.docx";
      const templatePath = path.resolve(__dirname, templateName);

      // Determine fee
      let feeValue = 0;
      let feeLabel = "";
      if (bill.type === "Consulting") {
        feeValue = bill.consultingFee || 0;
        feeLabel = "Consulting Fee";
      } else if (bill.type === "Treatment") {
        feeValue = bill.treatmentFee || 0;
        feeLabel = "Treatment Fee";
      }

      // Re-calculate totals safely
      const billItems = Array.isArray(bill.items) ? bill.items : [];
      const itemSubtotal = billItems.reduce(
        (sum, item) =>
          sum + parseFloat((item && item.price) || 0) * parseFloat((item && item.quantity) || 0),
        0
      );
      const subtotal = itemSubtotal + feeValue;
      const total = subtotal - (subtotal * (bill.discount || 0)) / 100;

      // Safe date formatting
      const rawDate = bill.date || bill.createdAt || new Date();
      const parsedDate = new Date(rawDate);
      const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
      const displayDate = validDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Prepare & render template
      const zip = await prepareDocxTemplate(templatePath);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: () => "",
      });

      doc.setData(
        buildTemplateData({
          id: bill.id,
          invoiceNo: bill.invoiceNo || bill.id, // fall back to patient id for old bills
          name: bill.name,
          phone: bill.phone,
          displayDate: displayDate.replace(/\//g, "-"),
          typeOfPayment: bill.typeOfPayment,
          itemTotals: billItems,
          discountValue: bill.discount || 0,
          isSpecialBill,
          feeValue,
          feeLabel,
          type: bill.type,
          subtotal,
          finalTotal: total.toFixed(2),
        })
      );
      doc.render();

      const docxBuffer = doc.getZip().generate({ type: "nodebuffer" });

      // Convert to PDF via iLovePDF — fall back to DOCX if conversion fails
      await fs.writeFile(tmpDocxPath, docxBuffer);

      let responseBuffer, contentType, fileName;
      try {
        const task = ilovepdf.newTask("officepdf");
        await task.start();
        const ilovePdfFile = new ILovePDFFile(tmpDocxPath);
        await task.addFile(ilovePdfFile);
        await task.process();
        responseBuffer = await task.download();
        contentType = "application/pdf";
        fileName = `bill-${billId}.pdf`;
        console.log("✅ PDF conversion successful");
      } catch (pdfErr) {
        console.error("⚠️ iLovePDF failed – serving DOCX fallback:", pdfErr.message);
        responseBuffer = docxBuffer;
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        fileName = `bill-${billId}.docx`;
      }

      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
      res.setHeader("Content-Type", contentType);
      res.send(responseBuffer);
    } catch (err) {
      console.error("Error downloading bill:", err);
      res.status(500).json({
        error: "Internal server error.",
        message: err.message,
        stack: err.stack,
      });
    } finally {
      try {
        await fs.unlink(tmpDocxPath);
      } catch (cleanupErr) {
        // Silently ignore cleanup errors
      }
    }
  }
);

app.get(
  "/bills-history",
  authenticateToken,
  attachDbModels,
  async (req, res) => {
    const Bill = req.db.Bill;
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
    const Bill = req.db.Bill;
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
    const Bill = req.db.Bill;
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
