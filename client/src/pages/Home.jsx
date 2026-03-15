import React from "react"
import {useState} from "react";
import { useNavigate } from "react-router-dom";

export default function Home(){

    const navigate = useNavigate();

    return(
        <div className="home-Container">
            <h1>Yo this is homepage my friends this is homepage</h1>
            <button onClick={()=>{navigate("/Register")}}>Register</button>
            <button onClick={()=>{navigate("/Login")}}>Login</button>

        </div>
    );
}