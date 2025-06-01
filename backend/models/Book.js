import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    rating: Number,
    availability: Boolean,
    image: String,
    source: { type: String, default: "books.toscrape.com" },
  },
  {
    timestamps: true,
  }
);

bookSchema.index({ title: 1 });
bookSchema.index({ createdAt: -1 });

export default mongoose.model("Book", bookSchema);
