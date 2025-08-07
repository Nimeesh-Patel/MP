// src/Signup.js
import React, { useState } from "react";
import "./auth.css";
import signupImage from "./Assets/signup-image.png";
import { Link, useHistory } from "react-router-dom";

function Signup() {
  const navigate = useHistory();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    repeatPassword: "",
    termsAccepted: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!formData.termsAccepted) {
      alert("Please accept the terms of service.");
      return;
    }

    if (formData.password !== formData.repeatPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8003/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail || "Registration failed");
        return;
      }

      alert("Registration successful!");
      navigate.push("/login"); // Redirect to login page if successful
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <div className="auth-img">
          <img src={signupImage} alt="signup visual" />
        </div>
        <div className="auth-form-container">
          <h2 className="auth-title">Sign up</h2>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="auth-input-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="auth-input-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="auth-input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="auth-input-group">
              <input
                type="password"
                name="repeatPassword"
                placeholder="Repeat your password"
                required
                value={formData.repeatPassword}
                onChange={handleChange}
              />
            </div>
            <div className="auth-remember">
              <input
                type="checkbox"
                name="termsAccepted"
                id="terms"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <label htmlFor="terms">
                I agree to the <a href="/">Terms of Service</a>
              </label>
            </div>
            <button type="submit" className="auth-button">
              Register
            </button>
          </form>
          <Link to="/login" className="auth-link">
            I am already a member
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Signup;
