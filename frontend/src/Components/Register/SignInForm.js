import React from 'react';

const SignInForm = () => {
  return (
    <div className="form-container sign-in-container">
      <form action="#">
        <h1>Sign in</h1>
        <span>Use your account</span>
        <input type="email" placeholder="Email" required />
        <input type="password" placeholder="Password" required />
        <a href="#">Forgot your password?</a>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default SignInForm;