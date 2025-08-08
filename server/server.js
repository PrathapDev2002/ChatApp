

import express from 'express'
import 'dotenv/config';
import cors from 'cors';
import http from 'http'
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoute.js';
import msgRouter from './routes/messageRoute.js';
import { Server } from 'socket.io';

//create express app and http server
const app = express();
//we are using http for socket io only support hhtp server
const server = http.createServer(app);

//intalize socket.io server
export const io = new Server(server,{

    cors:{origin:"*"}
})


//store online users
export const userSocketMap = {};//{ userId: socketId}

//socet.io connection handler
io.on("connection",(socket)=>{

    const userId = socket.handshake.query.userId;
    console.log("user Connected",userId);

    if(userId) userSocketMap[userId] = socket.id;

    //emit online users to all connected clients
    io.emit('getOnlineUsers',Object.keys(userSocketMap));

    
    socket.on('disconnect',()=>{

        console.log("user disconnected",userId)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

//middleware setup for fetching json type data from client
app.use(express.json({limit:'4mb'}));
//Middleware to allow all the url to our backend
app.use(cors())

//to verify the server.running or not
app.use("/api/status",(req,res)=>{

    res.send("server is live")
})
//for user api 
app.use('/api/auth',userRouter)
//for messages api
app.use('/api/messages',msgRouter)

//connect MongoDB
await connectDB();

//port for where our will be run
const port = process.env.PORT || 3000;
server.listen(port,()=>console.log("server is connected : " + port))