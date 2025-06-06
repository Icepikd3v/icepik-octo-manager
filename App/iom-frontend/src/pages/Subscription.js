// src/pages/Subscription.js
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import api from "../utils/api";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

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
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(null);

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
      const token = localStorage.getItem("token");
      const stripe = await stripePromise;

      const res = await api.post(
        "/payment/create-checkout-session",
        { planId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.data.url) throw new Error("Stripe session ID not returned");
      window.location.href = res.data.url;
    } catch (err) {
      console.error("❌ Checkout error:", err);
      setMessage("Failed to redirect to Stripe. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="flex-grow p-8 text-center bg-secondaryGray text-fontBlack font-paragraph">
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
        <div className="mb-6 text-sm font-paragraph text-red-600">
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
                isCurrent ? "bg-primaryTeal text-black" : "bg-white"
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
                <p className="text-sm font-bold text-green-800">
                  ✔ Current Plan
                </p>
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
