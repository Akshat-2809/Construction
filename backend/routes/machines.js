const express = require("express");
const router = express.Router();
const Machine = require("../models/machine");
const authMiddleware = require("../middleware/auth");
const { broadcastNewListing } = require("../utils/broadcast");

// GET /api/machines — public
router.get("/", async (req, res) => {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });
    res.json(machines);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch machines", error: error.message });
  }
});

// POST /api/machines — must be logged in
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      category, craneType, company, model, image, location, currentLocation,
      pricePerMonth, modelYear, hoursUsed, availability, availableFrom,
      ownerName, ownerContact, description,
      operatorAvailable, fuelIncluded, transportAvailable, transportCharges,
    } = req.body;

    const newMachine = new Machine({
      ownerId: req.user._id,
      category,
      craneType: category === "Crane" ? craneType : null,
      company, model, image,
      location,
      currentLocation: currentLocation ?? "",
      pricePerMonth: Number(pricePerMonth),
      modelYear: modelYear ? Number(modelYear) : undefined,
      hoursUsed: hoursUsed ? Number(hoursUsed) : undefined,
      availability: availability === "no" ? "no" : "yes",
      availableFrom: availability === "no" && availableFrom ? new Date(availableFrom) : null,
      ownerName, ownerContact, description,
      contactVerified: true,
      operatorAvailable: operatorAvailable === "yes" ? "yes" : "no",
      fuelIncluded: fuelIncluded === "yes" ? "yes" : "no",
      transportAvailable: transportAvailable === "yes" ? "yes" : "no",
      transportCharges: transportAvailable === "yes" && transportCharges ? Number(transportCharges) : null,
    });

    const saved = await newMachine.save();
    res.status(201).json(saved);

    // Notify WhatsApp subscribers — fire-and-forget, doesn't block the response
    // or fail the listing creation if WhatsApp sending has issues.
    broadcastNewListing(saved).catch((err) =>
      console.error("⚠️ broadcastNewListing failed:", err.message)
    );
  } catch (error) {
    res.status(400).json({ message: "Failed to create machine", error: error.message });
  }
});

// PUT /api/machines/:id — must be logged in AND be the owner
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    if (String(machine.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorised to edit this listing" });
    }

    const {
      pricePerMonth, location, ownerName, ownerContact,
      description, availability, availableFrom, modelYear, hoursUsed,
      operatorAvailable, fuelIncluded, transportAvailable, transportCharges,
    } = req.body;

    const updated = await Machine.findByIdAndUpdate(
      req.params.id,
      {
        pricePerMonth: Number(pricePerMonth),
        location, ownerName, ownerContact, description,
        availability: availability === "no" ? "no" : "yes",
        availableFrom: availability === "no" && availableFrom ? new Date(availableFrom) : null,
        ...(modelYear !== undefined && { modelYear: Number(modelYear) }),
        ...(hoursUsed !== undefined && { hoursUsed: Number(hoursUsed) }),
        ...(operatorAvailable !== undefined && { operatorAvailable: operatorAvailable === "yes" ? "yes" : "no" }),
        ...(fuelIncluded !== undefined && { fuelIncluded: fuelIncluded === "yes" ? "yes" : "no" }),
        ...(transportAvailable !== undefined && { transportAvailable: transportAvailable === "yes" ? "yes" : "no" }),
        ...(transportCharges !== undefined && { transportCharges: transportAvailable === "yes" && transportCharges ? Number(transportCharges) : null }),
      },
      { returnDocument: "after", runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: "Failed to update machine", error: error.message });
  }
});

// DELETE /api/machines/:id — must be logged in AND be the owner
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: "Machine not found" });

    if (String(machine.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorised to delete this listing" });
    }

    await Machine.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete machine", error: error.message });
  }
});

module.exports = router;