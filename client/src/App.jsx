import {BrowserRouter, Route, Routes} from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import AI from "./pages/AI.jsx"
import ProtectedRoute from "./ProtectedRoute.jsx";
import './App.css'

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/ai" element={<ProtectedRoute><AI/></ProtectedRoute>}/>
    </Routes>
    </BrowserRouter>
  )
}

export default App
