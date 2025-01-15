const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String },
  phone: { type: String },
  address: { type: String },
  treatmentOrMedicine: { type: String },
  date: { type: Date },
});

module.exports = mongoose.model("Patient", patientSchema);
