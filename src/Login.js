// src/Login.js
import React from "react";
import "./auth.css";
import loginImage from "./Assets/signin-image.jpg";
import { Link } from "react-router-dom";

function Login() {
  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-img">
          <img src={loginImage} alt="login visual" />
        </div>
        <div className="auth-form-container">
          <h2 className="auth-title">Sign in</h2>
          <form className="auth-form">
            <div className="auth-input-group">
              <input type="text" placeholder="Username" required />
            </div>
            <div className="auth-input-group">
              <input type="password" placeholder="Password" required />
            </div>
            <div className="auth-remember">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <button className="auth-button">Log in</button>
          </form>
          <Link to="/signup" className="auth-link">Create an account</Link>
          <div className="auth-social">
            <p>Or login with</p>
            <div className="social-icons">
              <i class="bi bi-facebook"></i>
              <i class="bi bi-twitter-x"></i>
              <i class="bi bi-instagram"></i>
              <i class="bi bi-google"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;