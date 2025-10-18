
import "./Register.css";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const Register = () => {

  const API_URL = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();
  let [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const registerMe = async (e) => {
    e.preventDefault();
    // console.log("Rigestration button clicked ") // debugging -- leave in case it braks again

    try {
      let response = await axios.post(
        `${API_URL}/register`,
        newUser
      );
      if (response.data.message === "Email already registered") {
        setError("Email aready exist.");
      } else {
        login(newUser.email, newUser.password);
      }
    } catch (err) {
      setError("Registration error occured.");
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    if (response.status === 200) {
    //   const userInfo = {
    //     userId: response.data.userId,
    //     username: response.data.username,
    //     highestScore: response.data.highestScore,
    //   };

    //   localStorage.setItem("user_data", JSON.stringify(userInfo));
      navigate("/");
    }
  };

  return (
    <div className="container">
      <div className="head">
        <div className="maintext">Register</div>
        <div className="underline"></div>
      </div>

      <form onSubmit={registerMe}>
        <div className="inputs">
          <div className="input">
            {/* <img src={email_icon} alt="Email Icon" /> */}
            <input
              type="name"
              name="username"
              placeholder="Name"
              value={newUser.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input">
            {/* <img src={email_icon} alt="Email Icon" /> */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={newUser.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input">
            {/* <img src={password_icon} alt="Password Icon" /> */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={newUser.password}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="submit_container">
          <button type="submit" className="submit">
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
