
//middleware to protect the routes

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async(req,res,next)=>{

    try{

        //step1 first heading the token from header
        const token = req.headers.token;

        //step 2 after got the token we need verify 
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        console.log("decoded",decoded)

        //step3 from the decoded we need to find the userid and using that user id we find data in our databse
        const user = await User.findById(decoded.userId).select("-password");//removing the password from returning the object
        console.log("user auth",user)

        //step4 checking the condition for user existance
        if(!user) return res.json({success:false,message:'user not found'})
        
        //if user exist
        req.user = user //we are storing the user data in req.user to access in controller
        next()
    }
    catch(err){

        console.log("hello there",err.message)
        res.json({success:false,message:err.message})

    }
}