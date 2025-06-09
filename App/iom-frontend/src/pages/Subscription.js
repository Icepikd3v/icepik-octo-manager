// ✅ Subscription.js (Full Updated)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const plans = [
  {
    id: "basic",
    name: "Basic Plan",
    description: "View-only access. No printing included.",
    features: ["Browse models", "View live streams"],
    prints: "0 prints/month",
  },
  {
    id: "bronze",
    name: "Bronze Plan",
    description: "Includes 1 print per month. Ideal for hobbyists.",
    features: ["Everything in Basic", "1 print job/month"],
    prints: "1 print/month",
  },
  {
    id: "silver",
    name: "Silver Plan",
    description: "Up to 5 prints monthly with priority queue access.",
    features: ["Priority queue", "5 print jobs/month"],
    prints: "5 prints/month",
  },
  {
    id: "gold",
    name: "Gold Plan",
    description: "Unlimited printing and premium access.",
    features: ["Unlimited prints", "Priority queue", "Reprint anytime"],
    prints: "Unlimited prints/month",
  },
];

const Subscription = () => {
  const [currentTier, setCurrentTier] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [canceling, setCanceling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setCurrentTier(storedUser.subscriptionTier);
      setUsername(storedUser.username);
    }
  }, []);

  const handleSelect = async (planId) => {
    if (planId === currentTier) return;
    setLoadingPlan(planId);
    try {
      const res = await api.post("/payment/create-checkout-session", {
        planId,
      });
      window.location.href = res.data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      setMessage("Failed to redirect to Stripe. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const performCancel = async () => {
    setShowConfirm(false);
    setCanceling(true);
    setMessage("");
    try {
      await api.delete("/payment/cancel-subscription");
      setCurrentTier("basic");
      const u = JSON.parse(localStorage.getItem("user"));
      u.subscriptionTier = "basic";
      localStorage.setItem("user", JSON.stringify(u));
      setMessage("Subscription cancelled.");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      console.error("Cancel error:", err);
      setMessage("Failed to cancel. Please try again.");
    } finally {
      setCanceling(false);
    }
  };

  const isError = message.toLowerCase().includes("failed");

  return (
    <div className="relative flex-grow p-8 text-center bg-secondaryGray text-fontBlack font-paragraph">
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 text-center shadow-xl">
            <h2 className="text-xl font-heading mb-4">Confirm Cancellation</h2>
            <p className="mb-6">Are you sure you want to cancel?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={canceling}
              >
                No, keep it
              </button>
              <button
                onClick={performCancel}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                disabled={canceling}
              >
                {canceling ? "Cancelling..." : "Yes, cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <h1 className="text-4xl font-heading mb-4">Subscription Plans</h1>
      {username && (
        <p className="text-lg font-medium mb-2">Logged in as: {username}</p>
      )}
      {currentTier && (
        <p className="text-md mb-4">
          Current Subscription: <strong>{currentTier}</strong>
        </p>
      )}
      <p className="text-lg font-paragraph mb-6">
        Choose a plan that fits your needs and take full advantage of Icepik's
        Octo Manager.
      </p>
      {message && (
        <div
          className={`mb-6 text-sm ${isError ? "text-red-600" : "text-green-600"}`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentTier;
          return (
            <div
              key={plan.id}
              className={`p-6 border rounded-md shadow-md transition relative ${
                isCurrent
                  ? "bg-primaryTeal text-black border-4 border-primaryBlue"
                  : "bg-white"
              }`}
            >
              <h2 className="text-2xl font-subheading mb-2 font-bold">
                {plan.name}
              </h2>
              <p className="text-sm mb-3">{plan.description}</p>
              <ul className="text-sm text-left list-disc list-inside mb-4">
                {plan.features.map((feat, idx) => (
                  <li key={idx}>{feat}</li>
                ))}
              </ul>
              <p className="font-semibold mb-4">{plan.prints}</p>

              {isCurrent ? (
                <>
                  <p className="text-sm font-bold text-green-800 mb-2">
                    ✔ Current Plan
                  </p>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                    disabled={canceling}
                  >
                    Cancel Subscription
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleSelect(plan.id)}
                  disabled={loadingPlan === plan.id}
                  className="mt-2 px-4 py-2 bg-primaryTeal text-black rounded hover:bg-blue-300 transition disabled:opacity-50"
                >
                  {loadingPlan === plan.id ? "Processing..." : "Upgrade Plan"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Subscription;
