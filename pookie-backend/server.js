import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("💖 Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schema for memories
const MemorySchema = new mongoose.Schema({
  date: String,
  text: String,
  mood: String,
  images: [String],
}, { timestamps: true });

const Memory = mongoose.model("Memory", MemorySchema);

// Routes
app.get("/", (req, res) => res.send("Pookie Backend Working 💞"));

app.post("/memories", async (req, res) => {
  const memory = await Memory.create(req.body);
  res.json(memory);
});

app.get("/memories", async (req, res) => {
  const memories = await Memory.find().sort({ createdAt: -1 });
  res.json(memories);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
