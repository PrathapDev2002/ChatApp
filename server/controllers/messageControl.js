import Message from "../models/Message.js";
import User from "../models/User.js"
import cloudinary from "../lib/cloudinary.js";
import { io,userSocketMap } from "../server.js"

//get all user except logged in user
export const getUserForSidebar = async(req,res)=>{

    try{

        //get the user id
        const userId = req.user._id
        console.log("userId",userId)
        
        //filter the data exclude the current user id
        const filterUser = await User.find({_id:{$ne: userId}}).select("-password");

        //count number of message not seen object
        const unseenMessages = {}

        //map the all user to find unseen message from other users
        const promises = filterUser.map(async(user)=>{

            //finding the the unseen message data
            const messages = await Message.find({senderId:user._id,receiverId:userId,seen:false})
            console.log("messages",messages)

            //condition to check whether the data lenght 
            if(messages.length > 0){

                //we will store those count in unseenMessages object along with user id
                unseenMessages[user._id] = messages.length;
            }
        })
        //this promise for when we use map function along with async we need use promise.all to wait the response
        await Promise.all(promises);

        res.json({success:true,users:filterUser,unseenMessages})
        
    }
    
    catch(err){
        console.log(err.message);
        res.json({success:true,message:err.message})
    }
}

//get all messages for selected user
export const getMessages = async(req,res)=>{

    try{

        //getting the user selectd id through params
        const {id:selectedUserId} = req.params;
        //getting current login id based on auth middleware
        const myId = req.user._id;

        //fetching the all messgaes belong this logged userid and selected user id
        const messages = await Message.find({
            $or:[
                {senderId:myId,receiverId:selectedUserId},
                {senderId:selectedUserId,receiverId:myId}
            ]
        })

        console.log('get all user message ',messages)

        //update the all message after open the chat as seen 
        await Message.updateMany({senderId:selectedUserId,receiverId:myId},{seen:true})

        //sending the response
        res.json({success:true,messages})

    }catch(err){
        console.log(err.message)
        res.json({success:false,message:err.message})
    }
}


//api to mark message as seen using message id
export const markMessageSeen = async(req,res)=>{

    try{

        //👉 We get the message ID from the request URL.
        const {id} = req.params;

        //It finds the message by its ID from the Message collection in the database,and updates it to say seen: true.
        await Message.findByIdAndUpdate(id,{seen:true})

        res.json({success:true})


    }catch(err){
        console.log(err.message)
        res.json({success:false,message:err.message})
    }
}


//send message to selected user
export const sendMessage = async(req,res)=>{

    try{

        const{text,image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;

        if(image){

            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,receiverId,text,image:imageUrl
        })

        //emit the new message reciver socket
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }


        res.json({success:true,newMessage})
    }
    catch(err){
        console.log(err.message)
        res.json({success:false,message:err.message})
    }
}