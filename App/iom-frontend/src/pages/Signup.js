// src/pages/Signup.js

import React, { useState } from "react";
import logo from "../assets/logo.png";
import api from "../utils/api";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = formData;

    if (!username || !email || !password) {
      setError("All fields are required!");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        username,
        email,
        password,
      });

      // Store token temporarily but don't navigate yet
      const fullUser = { ...res.data.user, token: res.data.token };
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(fullUser));
      window.dispatchEvent(new Event("userChanged"));

      setMessage(
        "✅ Signup successful! Check your email to verify before logging in.",
      );
    } catch (err) {
      console.error("Signup error:", err.response?.data?.message);
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-fontBlack">
      <div className="bg-gray-300 shadow-lg rounded-lg p-6 w-80 text-center">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
        </div>

        <h1 className="text-xl font-heading mb-2">Create an Account</h1>
        <p className="text-sm font-paragraph text-gray-600 mb-4">
          Sign up to start managing your 3D prints.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryTeal"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryTeal"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryTeal"
          />

          {error && (
            <p className="text-sm text-red-500 font-paragraph">{error}</p>
          )}
          {message && (
            <p className="text-sm text-green-600 font-paragraph">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-primaryTeal text-black px-4 py-1.5 rounded-md font-subheading hover:bg-blue-300 transition"
          >
            {loading ? "Creating..." : "Signup"}
          </button>
        </form>

        <p className="text-sm mt-4 font-paragraph">
          Already have an account?{" "}
          <a
            href="/"
            className="text-primaryTeal font-subheading hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
