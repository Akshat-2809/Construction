
adminRouter.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(target._id) === String(req.user._id)) {
      return res.status(400).json({
        message: "You can't delete your own account from here — use 'Delete my account' from your profile menu.",
      });
    }

    await Promise.all([
      Machine.deleteMany({ ownerId: target._id }),
      Request.deleteMany({ contactNumber: target.phone }),
    ]);

    await User.findByIdAndDelete(target._id);

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Failed to delete user:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = { authRouter, adminRouter };