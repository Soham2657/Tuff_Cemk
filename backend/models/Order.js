import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        menuItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "MenuItem",
        },
        quantity: Number,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    totalPrepweight: {
      type: Number,
      default: 0,
    },
    timeOfDay: {
      type: Number,
      default: 0,
    },
    prepTime: {
  type: Number, // actual time taken in minutes
},
    tokenNumber: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["Preparing", "Ready"],
      default: "Preparing",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);