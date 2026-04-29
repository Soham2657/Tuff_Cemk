import Announcement from "../models/Announcement.js";
import Notification from "../models/Notifications.js";
import User from "../models/User.js";

//create announcement (Admin)
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const announcement = await Announcement.create({
      title,
      message,
      createdBy: req.user._id,
    });

    const users = await User.find({}, "_id");

    if (users.length > 0) {
      const notifications = users.map((user) => ({
        user: user._id,
        message: `Announcement: ${title} - ${message}`,
      }));

      await Notification.insertMany(notifications);
    }

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all announcements (Everyone can see)
export const getAnnouncements = async (req, res) => {
  try {
    const data = await Announcement.find()
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//delete announcement (Admin)
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    announcement.remove();
    res.json({ message: "Announcement removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });   
  }
};