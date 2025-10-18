import React from 'react';

const SignUpForm = () => {
  return (
    <div className="form-container sign-up-container">
      <form action="#">
        <h1>Create Account</h1>
        <span>Use your email for registration</span>
        <input type="text" placeholder="Name" required />
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUpForm;