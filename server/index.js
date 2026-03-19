import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt"
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import nodemailer from "nodemailer";
import User from "./model/User.js"
import Otp from "./model/Otp.js";

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

const otpStore = {};


const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL,
        pass:process.env.EMAIL_PASS
    }
})


//sending an otp
app.post("/api/send-otp", async (req,res)=>{
    const {name,email,password} = req.body;

    try{
        const user = await User.findOne({email});

        if(user){
            return res.status(409).json({message:"User already exist"});
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|outlook\.com)$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email domain" });
        }
        
        const otp = Math.floor(100000 + Math.random()*900000);
        const hashPassword = await bcrypt.hash(password,10);
        //store in map

        await Otp.deleteOne({email});

        await Otp.create({
            name,email,otp,password:hashPassword,expiry:Date.now() + 5*60*1000
        })

        await transporter.sendMail({
            from:process.env.EMAIL,
            to:email,
            subject:"Your OTP Code",
            text:`Your OTP IS ${otp}`
        })
        
        res.status(200).json({message:"OTP sent"});

    }
    catch(err){
        res.status(500).json({message:err.message});
    }
})

app.post("/api/verify-email", async(req,res)=>{
    const {email,otp} = req.body;

    try{
        const record = await Otp.findOne({email});

        if(!record){
            return res.json({message:"Wrong OTP"});
        }
        if(record.expiry<Date.now()){
            return res.status(400).json({message:"OTP expired"});
        }
        if(record.otp!=otp){
            return res.status(500).json({message:"Wrong OTP"});
        }


        const user = await User.create({
            name:record.name,email:record.email,password:record.password
        });
        
        await Otp.deleteOne({email});

        res.status(201).json({message:"User succesfully registered"});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }

});


app.post("/api/resend-otp", async(req,res)=>{
    const {email} = req.body;

    try{

        const newOTP = Math.floor(100000 + Math.random()*90000);

        await Otp.updateOne(
            {email},
            {otp:newOTP, expiry:Date.now() + 5*60*1000}
        );

        await transporter.sendMail({
            from:process.env.EMAIL,
            to:email,
            subject:"YOUR OTP CODE",
            text:`YOUR OTP : ${newOTP}`
        })

        res.status(200).json({message:"OTP SENT"});
    }
    catch(err){
        res.json(500).json({message:err.message});
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