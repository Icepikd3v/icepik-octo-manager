import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const HomePage = () => {
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
          Please log in or sign up to continue.
        </p>

        {/* Input Fields */}
        <form className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryTeal"
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryTeal"
          />

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
