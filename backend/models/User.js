import mongoose from 'mongoose';

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true ,  
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{ 
        type:String,
        required:true,
        minlength:6
    },
    role:{
        type:String,
        enum:['Student','admin'],
        default:'Student'
    },
    profilePicture: {
        type: String,
        default: ''
    },
    collegeRollNo: {
        type: String,
        default: ''
    },
    department: {
        type: String,
        default: ''
    },
    universityRollNo: {
        type: String,
        default: ''
    },
    year: {
        type: String,
        default: ''
    },

},{timestamps:true})

export default mongoose.model('User',userSchema);