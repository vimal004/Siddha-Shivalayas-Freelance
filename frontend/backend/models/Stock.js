const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  stockId: { type: String, required: true, unique: true },
  productName: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  hsnCode: { type: String },
  discount: { type: Number },
  gst: { type: Number },
});

module.exports = mongoose.model("Stock", stockSchema);
