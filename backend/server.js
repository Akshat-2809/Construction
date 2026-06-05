require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const machineRoutes = require("./routes/machines");
const requestRoutes = require("./routes/requests");

connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://construction-chi-six.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
  })
);

app.use(express.json());

app.use("/api/machines", machineRoutes);
app.use("/api/requests", requestRoutes);

app.get("/", (req, res) => {
  res.send("ACE backend is running 🚀");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});