// import { set } from "mongoose";
import React,{ useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register(){
    const [name,setName] = useState("");
    const [email,setEmail] = useState("");
    const [password, setPass] = useState("");
    const [otp,setOTP] = useState("");
    const [step,setStep] = useState(1);
    const [exist,setExist] = useState(1);
    const [wrongOTP,setWrongOTP] = useState(1);

    const navigate = useNavigate();

    const registerUser = async (e)=>{
        e.preventDefault();
        try{
            if(step===1){
                const response = await fetch("http://localhost:5000/api/send-otp",{
                    method:"POST",
                    headers:{"Content-type":"application/json"},
                    body:JSON.stringify({name,email,password})
                });

                if(response.ok){
                    setStep(2);
                }
                else if(response.status===409){
                    setExist(2);
                }
                else{
                    const data = await response.json();
                    throw new Error(data.message);
                }

            }
            else{
                const newResponse = await fetch("http://localhost:5000/api/verify-email",{
                    method:"POST",
                    headers:{"Content-type":"application/json"},
                    body:JSON.stringify({email,otp})
                })

                if(newResponse.ok){
                    navigate("/login");
                }
                else if(newResponse.status === 400 || newResponse.status===500){
                    setWrongOTP(2);
                }
                else{
                    const data = await newResponse.json();
                    throw new Error(data.message);
                }
            }
        }
        catch(err){
            console.log(err); 
            navigate("/register"); 
        }
    }

    const resendOTP = async (e)=>{
        e.preventDefault();

        try{
            const response = await fetch("http://localhost:5000/api/resend-otp",{
                method:"POST",
                headers:{"Content-type":"application/json"},
                body:JSON.stringify({email})
            })

            if(response.ok){
                setWrongOTP(3);
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

                {step===1 && (
<>                <input type="text" placeholder="Name" value={name} onChange={(e)=>{setName(e.target.value)}}></input>
                <input type="email" placeholder="Email" value={email} onChange={(e)=>{setEmail(e.target.value)}}></input>
                <input type="password" placeholder="Password" value={password} onChange={(e)=>{setPass(e.target.value)}}></input></>
                )}
                {step===2 && (
                    <>
                    <input type="text" placeholder="OTP" value={otp} maxLength={6} inputMode="numeric" onChange={(e)=>{setOTP(e.target.value)}}></input>
                    </>
                )}


                <button type="submit">{step==1?"Register": "Enter otp"}</button>
            </form>
            {exist===2 && (
                <><p>User already Exist</p></>
            )}
            {wrongOTP===2 && (<><button onClick={resendOTP}>Resend OTP</button></>)}
            {wrongOTP===3 && (<><p>OTP RESENT</p></>)}
        </div>
    );
}