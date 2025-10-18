import React, { useState } from 'react';
import SignUpForm from './SignUpForm';
import SignInForm from './SignInForm';
import './Register.css'; // Assuming you adapt the CSS file

const Register = () => {
  // State to control the 'active' class, which triggers the CSS animation/slide
  const [isPanelActive, setPanelActive] = useState(false);

  // Class name toggles between '' (for Sign In view) and 'right-panel-active' (for Sign Up view)
  const containerClass = isPanelActive ? 'container right-panel-active' : 'container';

  return (
    <div className="registration-page">
      <h2>Study Space Finder</h2>
      <div className={containerClass} id="container">
        {/* The two forms are placed side-by-side in the DOM */}
        <SignUpForm />
        <SignInForm />

        {/* Overlay Container - handles the sliding panels */}
        <div className="overlay-container">
          <div className="overlay">
            {/* Overlay Left - Visible when Sign Up form is active */}
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button
                className="ghost"
                id="signIn"
                onClick={() => setPanelActive(false)}
              >
                Sign In
              </button>
            </div>
            {/* Overlay Right - Visible when Sign In form is active */}
            <div className="overlay-panel overlay-right">
              <h1>Hello, OWL!</h1>
              <p>Enter your personal details and find an empty study space</p>
              <button
                className="ghost"
                id="signUp"
                onClick={() => setPanelActive(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer>
        {/* Footer content goes here, using standard JSX attributes */}
        <p>
          Created with <i className="fa fa-heart"></i> by
          <a target="_blank" href="https://florin-pop.com" rel="noopener noreferrer">Florin Pop</a>
          - Read how I created this and how you can join the challenge
          <a
            target="_blank"
            href="https://www.florin-pop.com/blog/2019/03/double-slider-sign-in-up-form/"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </p>
      </footer>
    </div>
  );
};

export default Register;