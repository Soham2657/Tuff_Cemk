import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "profiles" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });

const serializeUserProfile = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profilePicture: user.profilePicture || "",
  collegeRollNo: user.collegeRollNo || "",
  department: user.department || "",
  universityRollNo: user.universityRollNo || "",
  year: user.year || "",
});

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(serializeUserProfile(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const upsertMyProfile = async (req, res) => {
  try {
    console.log('=== PROFILE UPDATE START ===');
    console.log('Received profile update request:', req.body);
    
    // Explicitly ignore any incoming 'role' to prevent privilege changes from client-side
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'role')) {
      delete req.body.role;
    }

    const { collegeRollNo, department, universityRollNo, year, name, email } = req.body || {};
    console.log('Profile fields extracted:', { collegeRollNo, department, universityRollNo, year, name, email });

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update name if provided
    if (typeof name === 'string' && name.trim().length > 0) {
      user.name = name.trim();
    }

    // Update email if provided and not used by another user
    if (typeof email === 'string' && email.trim().length > 0 && email.trim() !== user.email) {
      const existing = await User.findOne({ email: email.trim() });
      if (existing && String(existing._id) !== String(user._id)) {
        return res.status(400).json({ message: 'Email already in use by another account.' });
      }
      user.email = email.trim();
    }

    user.collegeRollNo = String(collegeRollNo || "").trim();
    user.department = String(department || "").trim();
    user.universityRollNo = String(universityRollNo || "").trim();
    user.year = String(year || "").trim();

    console.log('Saving user with updates:', { name: user.name, email: user.email, collegeRollNo: user.collegeRollNo, department: user.department, universityRollNo: user.universityRollNo, year: user.year });

    const updatedUser = await user.save();
    console.log('User saved successfully:', updatedUser._id);
    
    const responseData = serializeUserProfile(updatedUser);
    console.log('About to send response with status 200:', responseData);
    
    res.status(200).json(responseData);
    console.log('=== PROFILE UPDATE SUCCESS ===');
  } catch (error) {
    console.error('=== PROFILE UPDATE ERROR ===');
    console.error('Profile update error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const uploadMyProfilePicture = async (req, res) => {
  try {
    console.log('Received picture upload request. File:', req.file ? { fieldname: req.file.fieldname, mimetype: req.file.mimetype, size: req.file.size } : 'NO FILE');
    
    if (!req.file) {
      return res.status(400).json({ message: "Profile picture file is required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log('Uploading to Cloudinary...');
    const uploadedImage = await uploadToCloudinary(req.file.buffer);
    console.log('Cloudinary upload successful:', uploadedImage.secure_url);
    
    user.profilePicture = uploadedImage.secure_url;

    const updatedUser = await user.save();
    console.log('User profile picture updated in DB');
    
    res.status(200).json(serializeUserProfile(updatedUser));
  } catch (error) {
    console.error('Picture upload error:', error.message);
    res.status(500).json({ message: error.message });
  }
};
