// routes/payment.js
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/Users");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const bodyParser = require("body-parser");

// 📦 Create Checkout Session
router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  try {
    const { planId } = req.body;

    // ✅ Block unverified users
    if (!req.user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before upgrading." });
    }

    const priceLookup = {
      basic: process.env.STRIPE_PRICE_BRONZE,
      bronze: process.env.STRIPE_PRICE_BRONZE,
      silver: process.env.STRIPE_PRICE_SILVER,
      gold: process.env.STRIPE_PRICE_GOLD,
    };

    const price = priceLookup[planId];
    if (!price) {
      return res.status(400).json({ message: "Invalid plan selected." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price, quantity: 1 }],
      mode: "subscription",
      customer_email: req.user.email,
      success_url: `${process.env.CLIENT_URL}/subscription-success`,
      cancel_url: `${process.env.CLIENT_URL}/subscription-cancel`,
      metadata: {
        planId,
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("❌ create-checkout-session error:", err);
    res.status(500).json({ message: "Failed to create checkout session." });
  }
});
// ❌ Cancel Subscription
router.delete("/cancel-subscription", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ message: "No active subscription." });
    }

    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    user.subscriptionTier = "basic";
    user.stripeSubscriptionId = undefined;
    await user.save();

    res.json({ message: "Subscription cancelled." });
  } catch (err) {
    console.error("❌ cancel-subscription error:", err);
    res.status(500).json({ message: "Failed to cancel subscription." });
  }
});

// ✅ Stripe Webhook
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }), // must use raw body for Stripe
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("❌ Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("✅ Stripe event received:", event.type);

    // ✅ Subscription completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const subscriptionId = session.subscription;
      const planId = session.metadata?.planId || "bronze";
      const stripeCustomerId = session.customer;

      try {
        // Fallback: fetch email using customer ID
        const customer = await stripe.customers.retrieve(stripeCustomerId);
        const customerEmail = customer.email;

        const user = await User.findOne({ email: customerEmail });
        if (!user) {
          console.warn("⚠️ No user found for email:", customerEmail);
          return res.status(404).send("User not found");
        }

        user.subscriptionTier = planId;
        user.stripeSubscriptionId = subscriptionId;
        user.stripeCustomerId = stripeCustomerId;
        await user.save();

        console.log(`✅ Updated ${user.username} to tier: ${planId}`);
      } catch (err) {
        console.error("❌ Webhook processing error:", err.message);
        return res.status(500).send("Webhook processing failed");
      }
    }

    res.status(200).json({ received: true });
  },
);

module.exports = router;
