const express = require("express");
const router = express.Router();
const Request = require("../models/request");

// GET /api/requests — fetch all requests newest first
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch requests", error: error.message });
  }
});

// POST /api/requests — create a new request
router.post("/", async (req, res) => {
  try {
    const {
      category, craneType, location, requiredFrom,
      requiredTill, budgetPerMonth, description,
      contactName, contactNumber,
    } = req.body;

    const requestData = {
      category,
      craneType: category === "Crane" ? craneType : null,
      location,
      requiredFrom: new Date(requiredFrom),
      requiredTill: requiredTill ? new Date(requiredTill) : null,
      budgetPerMonth: budgetPerMonth ? Number(budgetPerMonth) : null,
      description,
      contactName,
      contactNumber,
    };

    const newRequest = new Request(requestData);
    const saved = await newRequest.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Failed to create request", error: error.message });
  }
});

// DELETE /api/requests/:id
router.delete("/:id", async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ success: true, message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete request", error: error.message });
  }
});

module.exports = router;