
import User from "../models/User.js";
import bcrypt from 'bcryptjs'
import { genarateToken } from "../lib/util.js";
import cloudinary from "../lib/cloudinary.js";
import 'dotenv/config';
///signup new user
export const signup = async(req,res)=>{

    const {fullName,email,password,bio} = req.body;

    try{

        //condition for prevent the missing details
        if(!fullName || !email || !password || !bio){

            return res.json({success:false,message:'Details are missing'})
        }

        //condition for verify the email already exist or not
        const user = await User.findOne({email})
        if(user){
            return res.json({success:false,message:'Account already exist'})
        }

        //after verify the email genarating the hashing the password
        const salt = await bcrypt.genSalt(10);
        console.log(salt)
        const hashPassword = await bcrypt.hash(password,salt)

        //creating the new user
        const newUser = await User.create({

            fullName,email,bio,password:hashPassword
        })

        //creating the token for user
        const token = genarateToken(newUser._id)

        //sending the response after saving successfully
        res.json({success:true,message:'Account created succesfully',userData:newUser,token})
    }
    catch(err){

        console.log(err.message)
        res.json({success:false,message:err.message})
    }

}


//controller for login user
export const login = async(req,res)=>{

    try{

        //first getting the data from user req body
        const {email,password} = req.body;

        //getting the that user data from databse if exist
        const userData = await User.findOne({email})

        //comparing the passwort using bcrypt
        const isPasswordCorrect = await bcrypt.compare(password,userData.password);
        console.log(isPasswordCorrect)

        //condition to check the password verification
        if(!isPasswordCorrect){

            return res.json({success:false,message:"invalid credential"})
        }

        //after password verication success we are genarating the token
        const token = genarateToken(userData._id);

        //after token genarated we are sending the success message
        res.json({success:true,userData,token,message:'Login succesful'})

    }catch(err){
        console.log(err.message)
        res.json({success:false,message:err.message})
    }
}


///controller check the user authenticated
export const checkAuth = (req,res)=>{
    res.json({success:true,user:req.user});
}

//controller to user profile
export const updateProfile = async(req,res)=>{

    try{

        //first we need get the data from request body
        const {profilePic,bio,fullName} = req.body;
        console.log(cloudinary.config())

        //second get the user id from request
        const userId = req.user._id
        console.log(userId)

        //variable for to update user data
        let updatedUser;

        //condition to check the user uploading the image not
        if(!profilePic){
            //user didnt upload the below block will be execute
            updatedUser = await User.findByIdAndUpdate(userId,{bio,fullName},{new:true})
        }
        else{

            //if user update the profile pic also the below block will be execute
            const uploadCloudinary = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadCloudinary.secure_url,bio,fullName},{new:true})
        }
        //sending the response
        res.json({success:true,user:updatedUser})

    }
    catch(err){

        console.log("hello",err.message);
        res.json({success:false,message:err.message})
    }
}