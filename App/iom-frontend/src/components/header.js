import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("token") !== null;
  const user = JSON.parse(localStorage.getItem("user")) || { name: "Guest" };

  const handleAuth = () => {
    if (isAuthenticated) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } else {
      localStorage.setItem("token", "mock-demo-token");
      localStorage.setItem(
        "user",
        JSON.stringify({ name: "Demo User", email: "demo@user.com" }),
      );
    }
    navigate("/");
  };

  return (
    <header className="bg-primaryTeal text-fontBlack font-heading py-4 px-6 flex items-center justify-between shadow-md">
      {/* Logo and Heading */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />
        </Link>
        <h1 className="text-2xl">Icepik's Octo Manager</h1>
      </div>

      {/* User Avatar and Auth Button */}
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-subheading">{user.name}</p>
            <button
              onClick={handleAuth}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
          <img
            src="https://via.placeholder.com/40"
            alt="User Avatar"
            className="h-10 w-10 rounded-full border border-gray-400"
          />
        </div>
      ) : (
        <button
          onClick={handleAuth}
          className="bg-primaryTeal text-black px-4 py-1.5 rounded-md font-subheading hover:bg-blue-300 transition"
        >
          Login
        </button>
      )}
    </header>
  );
};

export default Header;
