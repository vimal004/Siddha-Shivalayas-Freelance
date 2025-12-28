/**
 * Database Switcher Middleware
 *
 * This middleware switches the database connection based on user role:
 * - admin/staff: Uses the original SiddhaShivalayas database (production data)
 * - visitor: Uses the dummy database (demo/recruiter data - no sensitive info)
 */

const mongoose = require("mongoose");

// MongoDB URIs
const MONGO_URI_ORIGINAL =
  "mongodb+srv://2004vimal:zaq1%40wsx@cluster0.kfsrfxi.mongodb.net/SiddhaShivalayas";
const MONGO_URI_DUMMY =
  "mongodb+srv://2004vimal:zaq1%40wsx@cluster0.kfsrfxi.mongodb.net/dummy";

// Create separate connections for each database
const originalConnection = mongoose.createConnection(MONGO_URI_ORIGINAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const dummyConnection = mongoose.createConnection(MONGO_URI_DUMMY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Log connection status
originalConnection.on("connected", () =>
  console.log("✅ MongoDB (Original/SiddhaShivalayas) connected")
);
originalConnection.on("error", (err) =>
  console.error("❌ MongoDB (Original) connection error:", err)
);

dummyConnection.on("connected", () =>
  console.log("✅ MongoDB (Dummy) connected for recruiter demos")
);
dummyConnection.on("error", (err) =>
  console.error("❌ MongoDB (Dummy) connection error:", err)
);

// Define schemas (same structure for both databases)
const stockSchema = new mongoose.Schema({
  stockId: { type: String, required: true, unique: true },
  productName: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  hsnCode: { type: String },
  discount: { type: Number },
  gst: { type: Number },
});

const patientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String },
  phone: { type: String },
  address: { type: String },
  age: { type: Number },
  date: { type: Date },
});

const purchaseSchema = new mongoose.Schema({
  vendorName: { type: String, required: true },
  invoiceNo: { type: String, required: true },
  invoiceDate: { type: Date, required: true },
  gstin: { type: String },
  items: [
    {
      productName: String,
      batchNo: String,
      hsnCode: String,
      expiryDate: String,
      mrp: Number,
      rate: Number,
      qty: Number,
      discountPercent: Number,
      gstPercent: Number,
    },
  ],
  totals: {
    taxableAmount: Number,
    cgst: Number,
    sgst: Number,
    roundOff: Number,
    grandTotal: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

const billSchema = new mongoose.Schema({
  id: String,
  name: String,
  phone: String,
  address: String,
  age: Number,
  type: String,
  date: Date,
  items: Array,
  discount: { type: Number, default: 0 },
  typeOfPayment: String,
  consultingFee: { type: Number, default: 0 },
  treatmentFee: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

// Create models for each connection
const models = {
  original: {
    Stock: originalConnection.model("Stock", stockSchema),
    Patient: originalConnection.model("Patient", patientSchema),
    Purchase: originalConnection.model("Purchase", purchaseSchema),
    Bill: originalConnection.model("Bill", billSchema),
  },
  dummy: {
    Stock: dummyConnection.model("Stock", stockSchema),
    Patient: dummyConnection.model("Patient", patientSchema),
    Purchase: dummyConnection.model("Purchase", purchaseSchema),
    Bill: dummyConnection.model("Bill", billSchema),
  },
};

/**
 * Middleware to attach the correct database models to the request
 * based on the user's role (determined after authentication)
 */
const attachDbModels = (req, res, next) => {
  // If user is a visitor (recruiter demo), use dummy database
  // Otherwise use original database for admin/staff
  if (req.user && req.user.role === "visitor") {
    req.db = models.dummy;
    req.dbName = "dummy";
  } else {
    req.db = models.original;
    req.dbName = "original";
  }
  next();
};

/**
 * Helper function to get models based on role (for use outside middleware chain)
 */
const getModelsForRole = (role) => {
  return role === "visitor" ? models.dummy : models.original;
};

module.exports = {
  originalConnection,
  dummyConnection,
  models,
  attachDbModels,
  getModelsForRole,
};
