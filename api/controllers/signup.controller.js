import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

export const signup = async (req,res,next)=>{
    const {username , password, email} = req.body;
    const hashedPassword = bcryptjs.hashSync(password,10);
    const newUser = new User({username, email, password:hashedPassword});
    try {
        await newUser.save()
        console.log("User created succesfully");
        
    res.status(201).json({message :"User created succesfully"})
    } catch (error) {
        next(error);
    }
    
}