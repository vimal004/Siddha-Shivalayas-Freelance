const express = require("express");
const router = express.Router();
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { attachDbModels } = require("../middleware/dbSwitcher");

// Apply authentication and database switching to all routes
router.use(authenticateToken);
router.use(attachDbModels);

// Create a new Purchase Record - Admin only
router.post("/", requireAdmin, async (req, res) => {
  try {
    const Purchase = req.db.Purchase; // Use dynamic Purchase model based on user role
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
    const Purchase = req.db.Purchase; // Use dynamic Purchase model based on user role
    const purchases = await Purchase.find().sort({ invoiceDate: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a Purchase Record - Admin only
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const Purchase = req.db.Purchase; // Use dynamic Purchase model based on user role
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase)
      return res.status(404).json({ message: "Purchase record not found" });
    res.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
