// routes/payment.js
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const auth = require("../middleware/authMiddleware");

router.post("/create-checkout-session", auth, async (req, res) => {
  const { planId } = req.body;

  const prices = {
    bronze: process.env.STRIPE_PRICE_BRONZE,
    silver: process.env.STRIPE_PRICE_SILVER,
    gold: process.env.STRIPE_PRICE_GOLD,
  };

  const priceId = prices[planId];
  if (!priceId) {
    return res.status(400).json({ error: "Invalid plan selected" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: req.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
      metadata: {
        userId:
          req.user._id?.toString?.() || req.user.id?.toString?.() || "unknown",
        selectedPlan: planId,
      },
    });

    if (!session?.url) {
      return res.status(500).json({ error: "Stripe session ID not returned" });
    }

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ Stripe session error:", err);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
});

module.exports = router;
