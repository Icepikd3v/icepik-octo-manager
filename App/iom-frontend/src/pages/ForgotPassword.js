// src/pages/ForgotPassword.js
import React, { useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      await api.post("/auth/forgot-password", { email });
      setMessage("Password reset instructions have been sent to your email.");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Failed to send reset instructions. Try again later.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryTeal"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            className="w-full bg-primaryTeal text-black py-2 rounded-md hover:bg-blue-300"
          >
            Send Reset Link
          </button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="mt-4 text-sm text-blue-600 hover:underline w-full text-center"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
