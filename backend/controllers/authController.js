import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import generateToken from "../utils/generateToken.js";

const buildAuthResponse = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture || '',
    collegeRollNo: user.collegeRollNo || '',
    department: user.department || '',
    universityRollNo: user.universityRollNo || '',
    year: user.year || '',
    token: generateToken(user._id),
});

// Register a new user
export const registerUser =async (req,res)=>{
    const {name,email,password,collegeRollNo,department,universityRollNo,year}=req.body || {};
    
    // Explicitly prevent role from being set during registration
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'role')) {
      delete req.body.role;
    }
    
    if (!name || !email || !password) {
        return res.status(400).json({message:'name, email and password are required'});
    }
    try {
        // Check if user already exists
        const userExists=await User.findOne({email});
        if(userExists){
            return res.status(400).json({message:'User already exists'});
        }
        // Hash the password        
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);
        // Create new user with default Student role
        const user=await User.create({
            name,
            email,
            password:hashedPassword,
            role: 'Student', // Explicitly set default role
            collegeRollNo: collegeRollNo || '',
            department: department || '',
            universityRollNo: universityRollNo || '',
            year: year || ''
        });
                res.status(201).json(buildAuthResponse(user));
}catch (error) {
        res.status(500).json({message:'Server error'});
    }
};
// Login user
export const loginUser =async (req,res)=>{
    const {email,password}=req.body || {};
    if (!email || !password) {
        return res.status(400).json({message:'email and password are required'});
    }
    try {
        // Check if user exists
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:'Invalid credentials'});
        }   
        // Check password
        const isMatch=await bcrypt.compare(password,user.password);     
        if(!isMatch){
            return res.status(400).json({message:'Invalid credentials'});
        }
        res.status(200).json(buildAuthResponse(user));
    }catch (error) {
        res.status(500).json({message:'Server error'});
    }
};