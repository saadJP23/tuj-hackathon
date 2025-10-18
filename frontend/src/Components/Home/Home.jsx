
import './Home.css'
// import axios from "axios";
// import React, { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {



  return (
    <>

    <div>Hello from Home</div>

      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
    </>


  )
}

export default Home