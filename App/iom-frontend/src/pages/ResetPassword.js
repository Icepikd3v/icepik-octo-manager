// src/pages/ResetPassword.js
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setStatus("success");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setStatus("failed");
      setError("Reset failed. Link may be expired.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen p-4 text-center">
      <div className="bg-gray-200 p-8 rounded shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">🔒 Reset Your Password</h2>

        {status === "success" ? (
          <p className="text-green-700">✅ Password reset! Redirecting...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full p-2 border border-gray-300 rounded"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-primaryTeal hover:bg-blue-400 text-black p-2 rounded"
            >
              Reset Password
            </button>
          </form>
        )}

        {status === "failed" && (
          <p className="text-red-600 mt-4 text-sm">
            ❌ Reset failed. Try again or request a new link.
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
