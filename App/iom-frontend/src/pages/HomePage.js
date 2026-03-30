import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { DEMO_EMAIL, DEMO_NAME, DEMO_PASSWORD, DEMO_TOKEN } from "../constants/demoAuth";

const HomePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      setError("Invalid demo credentials. Use the frontend-only test login listed on the resume showcase.");
      return;
    }

    localStorage.setItem("token", DEMO_TOKEN);
    localStorage.setItem("authMode", "frontend-demo");
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: DEMO_NAME,
        email: DEMO_EMAIL,
      }),
    );
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 p-4 text-fontBlack">
      {/* 3D Printing News/Updates (Left Side) */}
      <section className="bg-gray-300 shadow-md rounded-md p-4 w-full md:w-1/4">
        <h2 className="text-xl font-subheading mb-2 border-b pb-2">
          3D Printing News/Updates
        </h2>
        <ul className="text-sm font-paragraph space-y-2">
          <li>📰 New filament types are now available!</li>
          <li>⚙️ Latest firmware update improves print quality.</li>
          <li>📅 Upcoming 3D printing webinar next week.</li>
        </ul>
      </section>

      {/* Login/Signup Box (Center) */}
      <div className="bg-gray-300 shadow-lg rounded-lg p-6 w-80 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
        </div>

        {/* Welcome Message */}
        <h1 className="text-xl font-heading mb-2">
          Welcome to Icepik's Octo Manager
        </h1>
        <p className="text-sm font-paragraph text-gray-600 mb-4">
          Demo mode is frontend-only while printer and OctoPrint services are offline.
        </p>

        {/* Input Fields */}
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
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
          <p className="text-xs text-left text-gray-700">
            Demo login: <strong>{DEMO_EMAIL}</strong> / <strong>{DEMO_PASSWORD}</strong>
          </p>
          {error ? <p className="text-sm text-red-700 text-left">{error}</p> : null}

          {/* Buttons */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              type="submit"
              className="bg-primaryTeal text-black px-4 py-1.5 rounded-md font-subheading hover:bg-blue-300 transition"
            >
              Login
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

      {/* Site Updates (Right Side) */}
      <section className="bg-gray-300 shadow-md rounded-md p-4 w-full md:w-1/4">
        <h2 className="text-xl font-subheading mb-2 border-b pb-2">
          Site Updates
        </h2>
        <ul className="text-sm font-paragraph space-y-2">
          <li>🌟 New dashboard features have been added.</li>
          <li>🔒 Improved security for user accounts.</li>
          <li>📢 Maintenance scheduled for next Monday.</li>
        </ul>
      </section>
    </div>
  );
};

export default HomePage;
