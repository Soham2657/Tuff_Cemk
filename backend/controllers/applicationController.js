import Application from "../models/Application.js";
import Club from "../models/Club.js";

// APPLY TO CLUB
export const applyToClub = async (req, res) => {
  try {
    const club = await Club.findById(req.params.clubId);

    if (!club) {
      return res.status(404).json({ message: "Club not found" });
    }

    if (club.members.some((member) => member.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: "Already a member" });
    }

    const existingApplication = await Application.findOne({
      user: req.user._id,
      club: req.params.clubId,
      status: { $in: ["Pending", "Approved"] },
    });

    if (existingApplication) {
      return res.status(400).json({ message: "Application already submitted" });
    }

    const application = await Application.create({
      user: req.user._id,
      club: req.params.clubId,
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//APPROVE / REJECT (ADMIN)
export const updateApplication = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id);

    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }

    const allowedStatuses = ["Pending", "Approved", "Rejected"];
    if (!allowedStatuses.includes(req.body.status)) {
      return res
        .status(400)
        .json({ message: "Invalid status. Use Pending, Approved, or Rejected." });
    }

    app.status = req.body.status;
    await app.save();

    if (app.status === "Approved") {
      await Club.findByIdAndUpdate(app.club, {
        $addToSet: { members: app.user },
      });
    }

    res.json(app);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET ALL APPLICATIONS (Admin)
export const getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("user", "name email")
      .populate("club", "name");
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};