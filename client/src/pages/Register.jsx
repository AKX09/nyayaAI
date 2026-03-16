import React,{ useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register(){
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [password, setPass] = useState("");

    const navigate = useNavigate();

    const registerUser = async (e)=>{
        e.preventDefault();
        try{
            const response = await fetch("http://localhost:5000/api/register",{
                method:"POST",
                headers:{"Content-type":"application/json"},
                body:JSON.stringify({name,email,password})
            });

            if(response.ok){
                navigate("/login");
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
        <div className="register-container">
            <form action="" onSubmit={registerUser}>
                <input type="text" placeholder="Name" value={name} onChange={(e)=>{setName(e.target.value)}}></input>
                <input type="email" placeholder="Email" value={email} onChange={(e)=>{setEmail(e.target.value)}}></input>
                <input type="password" placeholder="Password" value={password} onChange={(e)=>{setPass(e.target.value)}}></input>
                <button type="submit">Register</button>
            </form>
        </div>
    );
}