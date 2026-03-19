import mongoose, { mongo } from "mongoose";

const OtpSchema = new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
    },
    otp:{
        type:String,
    },
    password:{
        type:String,
    },
    expiry:{
        type:Date,
    },
},{timestamps:true});

export default mongoose.model("Otp",OtpSchema);