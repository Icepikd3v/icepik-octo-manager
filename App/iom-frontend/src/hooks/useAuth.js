import { useState, useEffect } from "react";

const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Example: Fetch user data or check authentication token
    const token = localStorage.getItem("authToken");
    if (token) {
      setUser({ name: "John Doe" });
    }
  }, []);

  return { user, setUser };
};

export default useAuth;
