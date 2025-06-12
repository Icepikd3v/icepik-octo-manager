// src/pages/HomePage.js

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import api from "../utils/api";
import YouTubeSidebar from "../components/YouTubeSidebar";

const HomePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setError("Email and password are required!");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });

      // ✅ Ensure token is saved inside user object
      const fullUser = { ...res.data.user, token: res.data.token };
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(fullUser));
      window.dispatchEvent(new Event("userChanged"));

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err.response?.data?.message);
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4 text-fontBlack">
      <YouTubeSidebar />
      <div className="bg-gray-300 shadow-lg rounded-lg p-6 w-80 text-center">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
        </div>
        <h1 className="text-xl font-heading mb-2">
          Welcome to Icepik's Octo Manager
        </h1>
        <p className="text-sm font-paragraph text-gray-600 mb-4">
          Please log in or sign up to continue.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline mt-1"
          >
            Forgot Password?
          </Link>
          <div className="flex justify-center gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={`bg-primaryTeal text-black px-4 py-1.5 rounded-md font-subheading transition ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-300"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <Link
              to="/signup"
              className="bg-gray-200 text-black px-4 py-1.5 rounded-md font-subheading hover:bg-gray-300 transition"
            >
              Signup
            </Link>
          </div>
        </form>
      </div>

      <section className="bg-gray-300 shadow-md rounded-md p-4 w-full md:w-1/4">
        <h2 className="text-xl font-subheading mb-2 border-b pb-2">
          📢 Site Updates
        </h2>
        <ul className="text-sm font-paragraph space-y-2 list-disc list-inside">
          <li>🚧 Staging application ready</li>
          <li>🔑 Forgot Password feature implemented</li>
          <li>🔓 Login/Signup flows live</li>
          <li>📺 YouTubeSidebar integration working</li>
          <li>👤 Header now shows username & avatar</li>
          <li>📊 Dashboard profile & subscription info done</li>
          <li>💳 Stripe checkout wired up</li>
          <li>📡 Live page fetching printer status</li>
          <li>📤 Upload page tier-based auto-start logic</li>
          <li>📁 File Library filters & reprint button</li>
        </ul>
      </section>
    </div>
  );
};

export default HomePage;
