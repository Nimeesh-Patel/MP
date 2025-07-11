// src/Signup.js
import React from "react";
import "./auth.css";
import signupImage from "./Assets/signup-image.png";
import { Link } from "react-router-dom";

function Signup() {
  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-img">
          <img src={signupImage} alt="signup visual" />
        </div>
        <div className="auth-form-container">
          <h2 className="auth-title">Sign up</h2>
          <form className="auth-form">
            <div className="auth-input-group">
              <input type="text" placeholder="Your Name" required />
            </div>
            <div className="auth-input-group">
              <input type="email" placeholder="Your Email" required />
            </div>
            <div className="auth-input-group">
              <input type="text" placeholder="Username" required />
            </div>
            <div className="auth-input-group">
              <input type="password" placeholder="Password" required />
            </div>
            <div className="auth-input-group">
              <input type="password" placeholder="Repeat your password" required />
            </div>
            <div className="auth-remember">
              <input type="checkbox" id="terms" />
              <label htmlFor="terms">
                I agree to the <a href="/">Terms of Service</a>
              </label>
            </div>
            <button className="auth-button">Register</button>
          </form>
          <Link to="/" className="auth-link">I am already member</Link>
        </div>
      </div>
    </section>
  );
}

export default Signup;