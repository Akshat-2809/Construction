const express = require("express");
const router = express.Router();
const Machine = require("../models/machine");

// GET /api/machines
router.get("/", async (req, res) => {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch machines", error: error.message });
  }
});

// POST /api/machines
router.post("/", async (req, res) => {
  try {
    const {
      category, craneType, company, model, image, location, pricePerMonth,
      modelYear, hoursUsed, availability, availableFrom,
      ownerName, ownerContact, description,
    } = req.body;

    const machineData = {
      category,
      craneType: category === "Crane" ? craneType : null,
      company, model, image, location,
      pricePerMonth: Number(pricePerMonth),
      modelYear: modelYear ? Number(modelYear) : undefined,
      hoursUsed: hoursUsed ? Number(hoursUsed) : undefined,
      availability: availability === "no" ? "no" : "yes",
      availableFrom: availability === "no" && availableFrom ? new Date(availableFrom) : null,
      ownerName, ownerContact, description,
      editCount: 0,
      contactVerified: false,
    };

    const newMachine = new Machine(machineData);
    const saved = await newMachine.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: "Failed to create machine", error: error.message });
  }
});

// PUT /api/machines/:id — verified owners: unlimited edits, unverified: max 1
router.put("/:id", async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    if (!machine.contactVerified && machine.editCount >= 1) {
      return res.status(403).json({
        message: "Unverified listings can only be edited once. Verify your contact to unlock unlimited edits.",
      });
    }

    const {
      pricePerMonth, location, ownerName, ownerContact,
      description, availability, availableFrom, modelYear, hoursUsed,
    } = req.body;

    const contactChanged =
      ownerContact &&
      ownerContact.replace(/\s/g, "") !== machine.ownerContact.replace(/\s/g, "");

    const updates = {
      pricePerMonth: Number(pricePerMonth),
      location, ownerName, ownerContact, description,
      availability: availability === "no" ? "no" : "yes",
      availableFrom: availability === "no" && availableFrom ? new Date(availableFrom) : null,
      ...(modelYear !== undefined && { modelYear: Number(modelYear) }),
      ...(hoursUsed !== undefined && { hoursUsed: Number(hoursUsed) }),
      ...(contactChanged && { contactVerified: false }),
      ...(!machine.contactVerified && { $inc: { editCount: 1 } }),
    };

    const updated = await Machine.findByIdAndUpdate(
      req.params.id,
      updates,
      { returnDocument: "after", runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update machine", error: error.message });
  }
});

// DELETE /api/machines/:id
router.delete("/:id", async (req, res) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) return res.status(404).json({ message: "Machine not found" });
    res.json({ success: true, message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete machine", error: error.message });
  }
});

// PATCH /api/machines/:id/verify
router.patch("/:id/verify", async (req, res) => {
  try {
    const machine = await Machine.findByIdAndUpdate(
      req.params.id,
      { contactVerified: true },
      { returnDocument: "after" }
    );
    if (!machine) return res.status(404).json({ message: "Machine not found" });
    res.json({ success: true, contactVerified: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify contact", error: error.message });
  }
});

module.exports = router;