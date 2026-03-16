import React, { use } from "react"
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AI(){


    const navigate = useNavigate();

    const handleLogout = async ()=>{
        const res = await api.post("/api/logout");
        localStorage.removeItem("accessToken");
        navigate("/");
    }

    return(
        <div className="ai-container">
            <h1>This is AI page</h1>
            <button onClick={handleLogout}>LOGOUT </button>
        </div>
    )
}