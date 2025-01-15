const express = require("express");
const router = express.Router();
const Stock = require("../models/Stock");

// Create Stock
router.post("/", async (req, res) => {
  try {
    const existingStock = await Stock.findOne({ stockId: req.body.stockId });
    if (existingStock) {
      return res
        .status(400)
        .json({ message: "Stock with this ID already exists" });
    }
    const stock = new Stock(req.body);
    await stock.save();
    res.status(201).json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Read All Stocks
router.get("/", async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Read Single Stock by Stock ID
router.get("/:id", async (req, res) => {
  try {
    const stock = await Stock.findOne({ stockId: req.params.id });
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Stock by Stock ID
router.put("/:id", async (req, res) => {
  try {
    const stock = await Stock.findOne({ stockId: req.params.id });
    if (!stock) return res.status(404).json({ message: "Stock not found" });

    if (req.body.quantity !== undefined && req.body.quantity < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    // Check if the request specifies the update mode
    if (req.body.updateMode === "add") {
      // Addition mode: Add the provided quantity to the existing quantity
      stock.quantity += Number(req.body.quantity);
    } else if (req.body.updateMode === "set") {
      // Set mode: Replace the existing quantity with the provided value
      stock.quantity = Number(req.body.quantity);
    }

    // Update other fields if provided
    Object.keys(req.body).forEach((key) => {
      if (req.body[key] !== undefined && key !== "quantity" && key !== "updateMode") {
        stock[key] = req.body[key];
      }
    });

    await stock.save();
    res.status(200).json({ message: "Stock updated successfully", stock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Stock by Stock ID
router.delete("/:id", async (req, res) => {
  try {
    const stock = await Stock.findOneAndDelete({ stockId: req.params.id });
    if (!stock) return res.status(404).json({ message: "Stock not found" });
    res.json({ message: "Stock deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
