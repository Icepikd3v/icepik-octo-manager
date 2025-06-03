// src/components/Header.js
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "Guest",
    avatar: "https://via.placeholder.com/40",
  });

  const isAuthenticated = localStorage.getItem("token") !== null;

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      const avatar = storedUser.avatar?.startsWith("http")
        ? storedUser.avatar
        : `http://localhost:3001${storedUser.avatar}`;

      setUser({
        name: storedUser.username || storedUser.name || "User",
        avatar: avatar,
      });
    }
  }, []);

  const handleAuth = () => {
    if (isAuthenticated) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/");
    } else {
      const demoUser = {
        name: "Demo User",
        email: "demo@user.com",
        avatar: "https://via.placeholder.com/40",
      };
      localStorage.setItem("token", "mock-demo-token");
      localStorage.setItem("user", JSON.stringify(demoUser));
      setUser(demoUser);
    }
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
            src={user.avatar}
            alt="User Avatar"
            className="h-10 w-10 rounded-full border border-gray-400 object-cover"
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
