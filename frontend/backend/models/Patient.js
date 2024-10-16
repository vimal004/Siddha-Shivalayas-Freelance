const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  treatmentOrMedicine: { type: String },
});

module.exports = mongoose.model("Patient", patientSchema);
