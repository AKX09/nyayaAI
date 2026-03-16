import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import User from "./model/User.js"
import bcrypt from "bcrypt"
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const app = express();
const PORT = process.env.PORT;
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}
));

app.use(express.json());
app.use(cookieParser());

app.post("/api/register",async (req,res)=>{
    const {name,email,password} = req.body;

    try{
        const user = await User.findOne({email});

        if(user){
            return res.status(409).json({message:"User already exist"});
        }

        const hashPassword = await bcrypt.hash(password,10);

        const newUser = await User.create({
            name,email,password:hashPassword
        });

        res.status(201).json({success:true,message:"User registered succesfully"});

    }
    catch(err){
        res.status(500).json({message:err.message});
    }
})

app.post("/api/login",async (req,res)=>{
    const {identifier,password} = req.body;

    try{
        const user = await User.findOne({
            $or: [{name:identifier},{email:identifier}]
        });
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(401).json({message:"Wrong password"});
        }

        const accessToken = jwt.sign(
            {id:user._id,role:user.role},
            process.env.JWT_SECRET,
            {expiresIn:"15m"}
        );

        const refreshToken = jwt.sign(
            {id:user._id,email:user.email},
            process.env.JWT_REFRESH_SECRET,
            {expiresIn:"7d"}
        );

        res.status(200).cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
      }).json({success:true, accessToken });
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
})

app.post("/api/refresh", async (req,res)=>{
    const token = req.cookies.refreshToken;
    if(!token){
        return res.status(401).json({message:"No refresh Token"});
    }

    try{
        const payload = jwt.verify(token,process.env.JWT_REFRESH_SECRET);

        const newAccessToken = jwt.sign(
            {user:payload.id,email:payload.email},
            process.env.JWT_SECRET,
            {expiresIn:"15m"}
        )

        res.status(200).json({accessToken:newAccessToken});
    }
    catch(err){
        res.status(403).json({message:"Invalid refresh token"});
    }
});

app.post("/api/logout",(req,res)=>{
    res.clearCookie("refreshToken");
    res.json({message:"Succesfuly logged out"});
})

app.listen(PORT,(req,res)=>{
    console.log("Listening at port ");
})