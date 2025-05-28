import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-b from-primaryTeal to-blue-300 text-fontBlack py-2 shadow-md">
      <ul className="flex justify-around items-center text-lg font-subheading">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-3 py-1 ${
                isActive
                  ? "border-b-4 border-black font-bold"
                  : "hover:text-gray-700"
              }`
            }
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-3 py-1 ${
                isActive
                  ? "border-b-4 border-black font-bold"
                  : "hover:text-gray-700"
              }`
            }
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/live"
            className={({ isActive }) =>
              `px-3 py-1 ${
                isActive
                  ? "border-b-4 border-black font-bold"
                  : "hover:text-gray-700"
              }`
            }
          >
            Live!
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `px-3 py-1 ${
                isActive
                  ? "border-b-4 border-black font-bold"
                  : "hover:text-gray-700"
              }`
            }
          >
            Upload
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/file-library"
            className={({ isActive }) =>
              `px-3 py-1 ${
                isActive
                  ? "border-b-4 border-black font-bold"
                  : "hover:text-gray-700"
              }`
            }
          >
            File Library
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
