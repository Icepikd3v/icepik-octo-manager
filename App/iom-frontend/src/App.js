import React from "react";
import Header from "./components/header";
import Navbar from "./components/navbar";
import Footer from "./components/footer";
import AppRoutes from "./routes/routes";

function App() {
  // 🔁 Ensure token is re-applied on app load
  React.useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.token) {
      localStorage.setItem("token", storedUser.token);
    }
  }, []);

  return (
    <div className="App min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Header />
      <Navbar />
      <main className="flex-grow p-4">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default App;
