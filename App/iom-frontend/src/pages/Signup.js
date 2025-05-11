import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, password } = formData;

    if (!name || !email || !password) {
      setError("All fields are required!");
      return;
    }

    // Mock Signup (Replace with backend integration later)
    localStorage.setItem("token", "mock-demo-token");
    localStorage.setItem("user", JSON.stringify({ name, email }));
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center text-fontBlack">
      {/* Signup Box */}
      <div className="bg-gray-300 shadow-lg rounded-lg p-6 w-80 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-heading mb-2">Create an Account</h1>
        <p className="text-sm font-paragraph text-gray-600 mb-4">
          Sign up to start managing your 3D prints.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
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

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500 font-paragraph">{error}</p>
          )}

          {/* Signup Button */}
          <button
            type="submit"
            className="bg-primaryTeal text-black px-4 py-1.5 rounded-md font-subheading hover:bg-blue-300 transition"
          >
            Signup
          </button>
        </form>

        {/* Navigation Link */}
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
