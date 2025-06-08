// src/components/Header.js
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import useUserInfo from "../hooks/useUserInfo";

const Header = () => {
  const navigate = useNavigate();
  const { name: username, avatar } = useUserInfo();

  const isAuthenticated = localStorage.getItem("token") !== null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userChanged"));
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

      {/* User Info */}
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-subheading">{username}</p>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
          <img
            src={avatar}
            alt="User Avatar"
            className="h-10 w-10 rounded-full border border-gray-400 object-cover"
          />
        </div>
      ) : (
        <Link
          to="/"
          className="bg-primaryTeal text-black px-4 py-1.5 rounded-md font-subheading hover:bg-blue-300 transition"
        >
          Login
        </Link>
      )}
    </header>
  );
};

export default Header;
