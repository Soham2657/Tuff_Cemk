import Notification from "../models/Notifications.js";
//get my notifications
export const getMyNotifications = async (req, res) => {
  try {
    const data = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//mark as read
export const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);

    notif.read = true;
    await notif.save();

    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};