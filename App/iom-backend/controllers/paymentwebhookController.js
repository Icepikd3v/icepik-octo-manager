// controllers/paymentWebhookController.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/Users");

module.exports = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const subscriptionId = session.subscription;
    const customerId = session.customer;

    try {
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"],
      });

      const priceId = fullSession.line_items?.data[0]?.price?.id;

      const tierMap = {
        [process.env.STRIPE_PRICE_BRONZE]: "bronze",
        [process.env.STRIPE_PRICE_SILVER]: "silver",
        [process.env.STRIPE_PRICE_GOLD]: "gold",
      };
      const subscriptionTier = tierMap[priceId] || "basic";

      let user = await User.findOne({ stripeCustomerId: customerId });

      if (!user) {
        const customer = await stripe.customers.retrieve(customerId);
        const customerEmail = customer.email;
        user = await User.findOne({ email: customerEmail });
      }

      if (!user) {
        console.warn("⚠️ No user found for Stripe customer or email.");
        return res.status(404).send("User not found");
      }

      user.subscriptionTier = subscriptionTier;
      user.stripeSubscriptionId = subscriptionId;
      user.stripeCustomerId = customerId;
      user.subscriptionStartDate = new Date();
      user.subscriptionEndDate = null;
      await user.save();

      console.log(`✅ ${user.email} upgraded to ${subscriptionTier}`);
    } catch (err) {
      console.error("❌ Webhook processing error:", err.message);
      return res.status(500).send("Webhook processing failed");
    }
  }

  res.json({ received: true });
};
