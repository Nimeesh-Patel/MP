import React, { useState } from "react";
import "./auth.css";
import loginImage from "./Assets/signin-image.jpg";
import { Link, useHistory } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const history = useHistory();

const handleChange = (e) => {
  if (!e.target || !e.target.name) {
    console.warn("Invalid input change event:", e.target);
    return;
  }

  const { name, value, type, checked } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8003/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log(data)
      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("token", data.access_token);
localStorage.setItem("userId", data.userId);
localStorage.setItem("username", data.username);
localStorage.setItem("email", data.email);
localStorage.setItem("avatar", data.profile_photo || "/default_avatar.png");
      alert("Login successful!");
      history.push("/"); // Redirect to homepage
    } catch (err) {
      console.error("Login error:", err);
      alert(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-img">
          <img src={loginImage} alt="login visual" />
        </div>
        <div className="auth-form-container">
          <h2 className="auth-title">Sign in</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
              />
            </div>
            <div className="auth-input-group">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
              />
            </div>
            <div className="auth-remember">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <button className="auth-button" type="submit">Log in</button>
          </form>
          <Link to="/signup" className="auth-link">Create an account</Link>
          <div className="auth-social">
            <p>Or login with</p>
            <div className="social-icons">
              <i className="bi bi-facebook"></i>
              <i className="bi bi-twitter-x"></i>
              <i className="bi bi-instagram"></i>
              <i className="bi bi-google"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;