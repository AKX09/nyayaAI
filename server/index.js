import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import User from "./model/User.js"
import bcrypt from "bcrypt"
import mongoose from "mongoose";



dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const app = express();
const PORT = process.env.PORT;
app.use(cors());

app.use(express.json());

app.post("/api/register",async (req,res)=>{
    const {name,email,password} = req.body;

    try{
        const user = await User.findOne({email});

        if(user){
            return res.json({message:"User already exist"});
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
    const {email,password} = req.body;

    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(401).json({message:"Wrong password"});
        }

        res.status(200).json({success:true,message:"Login succesful"});
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
})

app.listen(PORT,(req,res)=>{
    console.log("Listening at port ")
})