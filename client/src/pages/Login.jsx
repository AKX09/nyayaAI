import React,{ useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login(){

    const [email,setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e)=>{
        e.preventDefault();

        try{
            const response = await fetch("http://localhost:5000/api/login",{
                method:"POST",
                headers:{"Content-type":"application/json"},
                body:JSON.stringify({email,password})
            });

            if(response.ok){
                navigate("/register");
            }
            else{
                const data = await response.json();
                throw new Error(data.message);
            }
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