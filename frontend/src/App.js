import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home.jsx";
import Login from "./Components/Login/Login.jsx";
import Register from "./Components/Register/Register.jsx";

export default function App() {
  return (
    <BrowserRouter>
      {/* keep your existing Navbar/Footer components outside Routes if you have them */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}