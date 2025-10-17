import React from "react";
import Home from "./Components/Home/Home";
import Register from "./Components/Register/Register";
import Login from "./Components/Login/Login";

import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
// import { UserProvider } from "./FrontEnd/components/UserContext";

function App() {
  return (
    // <UserProvider>
      
    <Router>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/play/:movieId" element={<GamePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/highscore" element={<Highscore />} />
        <Route path="/Signout" element={<Signout />} />
        <Route path="/feedback" element={<FeedbackForm />} /> */}
      </Routes>
      </Router>
    // </UserProvider>
  );
}

export default App;
