// src/components/Footer.js
import React from "react";
import { FaFacebook, FaYoutube, FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-primaryTeal text-black py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-center md:text-left">
        {/* Left spacer for even balance */}
        <div className="w-full md:w-1/3 hidden md:block" />

        {/* Centered Contact Info */}
        <div className="w-full md:w-1/3 mb-4 md:mb-0 text-center">
          <p className="font-heading text-lg mb-1">Contact Us:</p>
          <p className="text-sm font-paragraph">
            📧 sfarmer1@student.fullsail.edu
          </p>
          <p className="text-sm font-paragraph">📧 sam.d3v.35@gmail.com</p>
          <p className="text-sm font-paragraph">📞 (555)-555-5555</p>
          <p className="text-sm font-paragraph">📍 USA, WV</p>
        </div>

        {/* Right-Aligned Social Icons */}
        <div className="w-full md:w-1/3 flex justify-center md:justify-end gap-4 text-2xl">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            <FaFacebook />
          </a>
          <a
            href="https://www.youtube.com/@icepikcrxsi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-red-600"
          >
            <FaYoutube />
          </a>
          <a
            href="https://www.linkedin.com/in/samdev35/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-700"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://github.com/ePortfolios/wdv349-o-FarmerSamuel-FS"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-700"
          >
            <FaGithub />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
