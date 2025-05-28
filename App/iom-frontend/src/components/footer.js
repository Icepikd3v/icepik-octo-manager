import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-primaryTeal text-fontBlack font-subheading text-center py-4 px-4 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Spacer for Alignment */}
      <div className="hidden md:flex md:w-1/4"></div>

      {/* Contact Information (Centered) */}
      <div className="text-center md:w-1/2">
        <h3 className="text-lg font-heading mb-2">Contact Us:</h3>
        <p>
          📧{" "}
          <a
            href="mailto:sfarmer1@student.fullsail.edu"
            className="hover:underline"
          >
            sfarmer1@student.fullsail.edu
          </a>
        </p>
        <p>📞 (555)-555-5555</p>
        <p>📍 USA, WV</p>
      </div>

      {/* Social Media Icons (Right-Aligned) */}
      <div className="flex justify-end gap-4 md:w-1/4">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700"
        >
          <FaFacebook size={28} />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700"
        >
          <FaInstagram size={28} />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700"
        >
          <FaLinkedin size={28} />
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-700"
        >
          <FaGithub size={28} />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
