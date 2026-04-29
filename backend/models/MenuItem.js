import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    prepWeight: {
      type: Number,
      default: 5,
    },
    image: {
      type: String,
    },
    available: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      enum: ["snacks", "breakfast", "lunch", "dinner", "beverages", "desserts"],
      default: "snacks",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);