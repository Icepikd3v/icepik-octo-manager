import React from "react";
import Header from "./components/header";
import Navbar from "./components/navbar";
import Footer from "./components/footer";

import AppRoutes from "./routes/routes";

function App() {
  return (
    <div className="App min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow p-4">
        <AppRoutes />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
