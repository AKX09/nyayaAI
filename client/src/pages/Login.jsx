import React,{ useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login(){

    const [email,setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e)=>{
        e.preventDefault();

        try{
            const identifier = email;
            const res = await api.post("/api/login",{identifier,password});
            localStorage.setItem("accessToken",res.data.accessToken);
            navigate("/ai");
        }
        catch(err){
            console.log(err);
        }
    }

    return(
        <div className="login-form">
            <form action="" onSubmit={handleLogin}>
                <input type="text" value={email} onChange={(e)=>{setEmail(e.target.value)}}/>
                <input type="password" value={password} onChange={(e)=>{setPassword(e.target.value)}}/>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}