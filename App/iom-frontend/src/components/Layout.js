import React from "react";

const Layout = ({ title, children }) => {
  return (
    <div className="min-h-screen bg-secondaryGray text-fontBlack font-paragraph">
      {/* Header */}
      <header className="bg-primaryTeal text-fontBlack font-heading text-3xl text-center py-4">
        {title}
      </header>

      {/* Main Content */}
      <main className="p-8 text-center">{children}</main>

      {/* Footer */}
      <footer className="bg-primaryTeal text-fontBlack font-subheading text-center py-2">
        © {new Date().getFullYear()} Icepik's Octo Manager. All Rights
        Reserved.
      </footer>
    </div>
  );
};

export default Layout;
