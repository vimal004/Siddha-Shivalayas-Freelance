const express = require("express");
const router = express.Router();
const Purchase = require("../models/Purchase");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

// Apply authentication to all routes
router.use(authenticateToken);

// Create a new Purchase Record - Admin only
router.post("/", requireAdmin, async (req, res) => {
  try {
    const purchase = new Purchase(req.body);
    await purchase.save();
    res.status(201).json(purchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all Purchases - All authenticated users
router.get("/", async (req, res) => {
  try {
    const purchases = await Purchase.find().sort({ invoiceDate: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a Purchase Record - Admin only
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase)
      return res.status(404).json({ message: "Purchase record not found" });
    res.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
