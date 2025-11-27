const mongoose = require('mongoose');

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

module.exports = mongoose.model('Purchase', purchaseSchema);