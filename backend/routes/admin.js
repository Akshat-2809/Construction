const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");
const User = require("../models/user");
const Machine = require("../models/machine");
const Request = require("../models/request");

router.use(authMiddleware, adminMiddleware);

// GET /api/admin/stats — overview numbers + breakdowns
router.get("/stats", async (req, res) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalMachines,
      totalRequests,
      newUsersThisWeek,
      newMachinesThisWeek,
      newRequestsThisWeek,
      machinesByCategory,
      machinesByLocation,
      requestsByCategory,
    ] = await Promise.all([
      User.countDocuments(),
      Machine.countDocuments(),
      Request.countDocuments(),
      User.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Machine.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Request.countDocuments({ createdAt: { $gte: oneWeekAgo } }),
      Machine.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Machine.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
      Request.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      totals: {
        users: totalUsers,
        machines: totalMachines,
        requests: totalRequests,
      },
      thisWeek: {
        users: newUsersThisWeek,
        machines: newMachinesThisWeek,
        requests: newRequestsThisWeek,
      },
      machinesByCategory: machinesByCategory.map((m) => ({
        name: m._id || "Unknown",
        count: m.count,
      })),
      machinesByLocation: machinesByLocation.map((m) => ({
        name: m._id || "Unknown",
        count: m.count,
      })),
      requestsByCategory: requestsByCategory.map((r) => ({
        name: r._id || "Unknown",
        count: r.count,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats", error: err.message });
  }
});

// GET /api/admin/users — list all users with listing counts
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-__v");

    // Get listing counts per user in one query
    const counts = await Machine.aggregate([
      { $group: { _id: "$ownerId", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => { countMap[String(c._id)] = c.count; });

    const result = users.map((u) => ({
      _id: u._id,
      name: u.name,
      phone: u.phone,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
      listingCount: countMap[String(u._id)] || 0,
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// GET /api/admin/machines — all machines (reuses existing data, sorted)
router.get("/machines", async (req, res) => {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });
    res.json(machines);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch machines", error: err.message });
  }
});

// GET /api/admin/requests — all requests
router.get("/requests", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch requests", error: err.message });
  }
});

// DELETE /api/admin/machines/:id — admin can delete any listing
router.delete("/machines/:id", async (req, res) => {
  try {
    const machine = await Machine.findByIdAndDelete(req.params.id);
    if (!machine) return res.status(404).json({ message: "Machine not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete", error: err.message });
  }
});

// DELETE /api/admin/requests/:id — admin can delete any request
router.delete("/requests/:id", async (req, res) => {
  try {
    const request = await Request.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete", error: err.message });
  }
});

module.exports = router;