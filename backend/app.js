import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bookRoutes from "./routes/books.js";
import scrapeRoutes from "./routes/scrape.js";
import { errorMiddleware } from "./utils/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/books", bookRoutes);
app.use("/api/scrape", scrapeRoutes);


app.use(errorMiddleware);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
