const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { attachDbModels } = require("../middleware/dbSwitcher");

// Apply authentication and database switching to all routes
router.use(authenticateToken);
router.use(attachDbModels);

// Create Patient - Admin only
router.post("/", requireAdmin, async (req, res) => {
  try {
    const Patient = req.db.Patient; // Use dynamic Patient model based on user role
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Read All Patients - All authenticated users
router.get("/", async (req, res) => {
  try {
    const Patient = req.db.Patient; // Use dynamic Patient model based on user role
    const patients = await Patient.find();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read Single Patient by ID - All authenticated users
router.get("/:id", async (req, res) => {
  try {
    const Patient = req.db.Patient; // Use dynamic Patient model based on user role
    const patient = await Patient.findOne({ id: req.params.id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Patient - Admin only
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const Patient = req.db.Patient; // Use dynamic Patient model based on user role
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

// Delete Patient - Admin only
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const Patient = req.db.Patient; // Use dynamic Patient model based on user role
    const patient = await Patient.findOneAndDelete({ id: req.params.id });
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
