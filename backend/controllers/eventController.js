import Event from "../models/Event.js";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "events" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });

export const createEvent = async (req,res)=>{
    try{
        const { title, description, date, time, location } = req.body;
        let imageUrl = "";

        if (req.file) {
          const result = await uploadToCloudinary(req.file.buffer);
          imageUrl = result.secure_url;
        }

        const event = new Event({
            title,
            description,
            date,
            time,
            location,
            image: imageUrl,
            createdBy: req.user._id
        });
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });

    }
};
//  GET ALL EVENTS (Everyone can see)
export const getEvents = async (req,res)=>{
    try{
        const events = await Event.find().populate('createdBy', 'name email').sort({ date: 1 });//upcoming first
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// SEARCH EVENTS
export const searchEvents = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json([]);
    }

    const events = await Event.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } }
      ]
    })
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//get single event details 
export const getEventById = async (req,res)=>{
     try {
    const event = await Event.findById(req.params.id)
      .populate("participants", "name email");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//register for event
export const registerEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Prevent duplicate registration
    if (event.participants.includes(req.user._id)) {
      return res.status(400).json({ message: "Already registered" });
    }

    event.participants.push(req.user._id);
    await event.save();

    res.json({ message: "Registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//delete event (admin only)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);  
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    await event.deleteOne();
    res.json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET events the current user is registered for
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await Event.find({ participants: userId })
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};