import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  image: {
    type: String,
  },
   createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who created event
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Users who registered
      },
    ],
  }, { timestamps: true });

export default mongoose.model("Event", eventSchema);