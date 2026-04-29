import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Announcement", announcementSchema);