import React, { useState } from "react";
import "./auth.css";
import signupImage from "./Assets/signup-image.png";
import { Link, useHistory } from "react-router-dom";

function Signup() {
   const history = useHistory();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    repeatPassword: "",
    terms: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (!e.target || !e.target.name) return;

    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.repeatPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.terms) {
      setError("You must agree to the Terms of Service");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8003/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      alert("Registration successful!");
      history.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-input-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-input-group">
              <input
                type="password"
                name="repeatPassword"
                placeholder="Repeat your password"
                value={formData.repeatPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-remember">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                required
              />
              <label htmlFor="terms">
                I agree to the <a href="/">Terms of Service</a>
              </label>
            </div>
            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            {error && <p className="auth-error">{error}</p>}
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
