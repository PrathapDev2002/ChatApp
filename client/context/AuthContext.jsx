
import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import io from 'socket.io-client'


const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children })=>{

    const[token,setToken] = useState(localStorage.getItem("token"));
    const[authUser,setAuthUser] = useState(null);
    const[onlineUser,setOnlineUser] = useState([]);
    const [socket,setSocket] = useState(null);

    //check if user is authenticated and if so the user data and connect the socket
    const checkAuth = async () =>{

        try{

            const {data} = await axios.get("/api/auth/check");
            if(data.success){

                setAuthUser(data.user)
                connectSocket(data.user)
            }

        }catch(err){

            toast.error(err.message)
        }
    }

    //login or signup fucntion to handle user authentication and socket connection
    const login = async(state,credentials)=>{

        try{

            //first call the api from their fetching the data
            const {data} = await axios.post(`/api/auth/${state}`,credentials);

            //from fethced the data check the data 
            if(data.success){

                //if true set authdatauser as userData
                setAuthUser(data.userData)
                //and connect the socket
                connectSocket(data.userData);
                //storing the data in axios header
                // axios.defaults.headers.common["token"] = data.token
                axios.defaults.headers.common["token"] = data.token;
                //next the store the token in settoken
                setToken(data.token);
                //setthe token in localstorage
                localStorage.setItem("token",data.token)
                toast.success(data.message)

            }else{

                toast.error(data.message)
            }
        }catch(err){
            toast.error(err.message)
        }
    }

    //logout function to handle user to logout and socket disconnection
    const logout = async()=>{
        //first remove the token from localstorage
        localStorage.removeItem("token");
        //set the token,auth,onlineuser
        setAuthUser(null);
        setToken(null);
        setOnlineUser([]);
        //set up axios token as null
        axios.defaults.headers.common["token"] = null;
        toast.success("logout succesfully")

        //disconnect the socket
        socket.disconnect();
    }

    //update profile function to handle user profile updates
    const updateProfile = async(body)=>{

        try{
            //first api call to get the data using put method for updating data
            const { data } = await axios.put('/api/auth/update-profile',body)
            //checkin the condition data succes or not
            if(data.success){

                //setting the user as data.user
                setAuthUser(data.user);
                toast.success("Profile updated succesfully")
            }

        }catch(err){
            toast.error(err.message)
        }
    }

    //connect socket function to handle socket connection and online users updates
    const connectSocket = (userData)=>{

        if(!userData || socket?.connected) return;

        const newSocket = io(backendUrl,{

            query : {
                userId : userData._id,
            }
        })
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUser(userIds);
        })
    }


    ///useffect for whenever page is open its run and verify the check auth 
    useEffect(()=>{

        if(token){
            axios.defaults.headers.common["token"] = token;
        }

        checkAuth();
    },[])


    const value ={
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile,

    }

    return (

        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

