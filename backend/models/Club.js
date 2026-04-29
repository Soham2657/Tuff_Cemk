import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Club name
    },
    description: {
      type: String,
      required: true, // About the club
    },
    image: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin who created
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Users in club
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Club", clubSchema);