import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Optional: Refetch or refresh user info here
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
