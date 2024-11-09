const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const songRoutes = require("./routes/songRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Use test database URL when in test environment
const MONGODB_URI =
  "mongodb+srv://ktk2real:krosection999@cluster0.abfalpl.mongodb.net/internshiptest?retryWrites=true&w=majority";

if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

app.use("/api/songs", songRoutes);

// Only start the server if we're not in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = { app, MONGODB_URI };
