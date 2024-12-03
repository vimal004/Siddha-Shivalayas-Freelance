const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");

// Create Patient
router.post("/", async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Read All Patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read Single Patient by ID
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Patient
// Update Patient
router.put("/:id", async (req, res) => {
  try {
    const updatedFields = req.body; // Contains only the fields sent from the client
    const patient = await Patient.findOneAndUpdate(
      { id: req.params.id }, // Query condition
      { $set: updatedFields }, // Update only specified fields
      { new: true } // Return the updated document
    );
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Delete Patient
router.delete("/:id", async (req, res) => {
  try {
    const patient = await Patient.findOneAndDelete({ id: req.params.id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
