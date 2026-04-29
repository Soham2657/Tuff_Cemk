import Club from "../models/Club.js";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "clubs" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });

// CREATE CLUB (Admin)

export const createClub = async (req, res) => {
  try {
    const { name, description } = req.body;
    let imageUrl = "";

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const club = await Club.create({
      name,
      description,
      image: imageUrl,
      createdBy: req.user._id,
    });

    res.status(201).json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//  GET ALL CLUBS

export const getClubs = async (req, res) => {
  try {
    const clubs = await Club.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SEARCH CLUBS
export const searchClubs = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    const clubs = await Club.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//  GET CLUB DETAILS

export const getClubById = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate("members", "name email");

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    res.json(club);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//  JOIN CLUB

export const joinClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (club.members.includes(req.user._id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    club.members.push(req.user._id);
    await club.save();

    res.json({ message: "Joined club" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//LEAVE CLUB

export const leaveClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    club.members = club.members.filter(
      (member) => member.toString() !== req.user._id.toString()
    );

    await club.save();

    res.json({ message: "Left club" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//  DELETE CLUB (Admin)

export const deleteClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    await club.deleteOne();

    res.json({ message: "Club deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};