
import jwt from 'jsonwebtoken'

//function to genrate the token for user

export const genarateToken = (userId)=>{

    const token = jwt.sign({userId},process.env.JWT_SECRET);
    return token;
}