// src/pages/SubscriptionSuccess.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpdatedUser = async () => {
      try {
        const res = await api.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const fullUser = { ...res.data.user, token: res.data.token };
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(fullUser));
        window.dispatchEvent(new Event("userChanged"));

        console.log("✅ User refreshed after subscription.");
      } catch (err) {
        console.error("❌ Failed to refresh user info:", err.message);
      }
    };

    fetchUpdatedUser();

    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="text-center mt-20 font-paragraph">
      <h1 className="text-3xl font-heading text-green-600 mb-4">
        🎉 Subscription Successful!
      </h1>
      <p className="text-lg">
        Thank you for subscribing. Redirecting to your dashboard...
      </p>
    </div>
  );
};

export default SubscriptionSuccess;
