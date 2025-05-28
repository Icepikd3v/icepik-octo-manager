import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-5xl font-heading text-primaryTeal mb-4">404</h1>
      <h2 className="text-2xl font-subheading mb-2">Page Not Found</h2>
      <p className="text-md font-paragraph mb-4">
        Oops! The page you're looking for doesn't exist or you're not authorized
        to view it.
      </p>
      <Link
        to="/"
        className="px-4 py-2 bg-primaryTeal text-black font-subheading rounded-md hover:bg-blue-300 transition"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
