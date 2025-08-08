

import mongoose from "mongoose";

//function for connecting mongodb connection

export const connectDB = async()=>{

    try{

        mongoose.connection.on('connected',()=>console.log('Database Connected'))
        await mongoose.connect(`${process.env.MONGODB_URL}/chatApp`)
    }
    catch(err){
        console.log(err)
    }
}