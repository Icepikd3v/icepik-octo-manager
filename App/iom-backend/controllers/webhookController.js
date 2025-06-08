// controllers/webhookController.js

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/Users");

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const priceToTier = {
  [process.env.STRIPE_PRICE_BRONZE]: "bronze",
  [process.env.STRIPE_PRICE_SILVER]: "silver",
  [process.env.STRIPE_PRICE_GOLD]: "gold",
};

module.exports = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const subscriptionId = session.subscription;

    // New API — safer lookup
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      limit: 1,
    });
    const priceId = lineItems.data[0]?.price?.id;

    const tier = priceToTier[priceId] || "basic";

    try {
      const updated = await User.findByIdAndUpdate(userId, {
        subscriptionTier: tier,
        stripeSubscriptionId: subscriptionId,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      console.log(`✅ User ${updated?.username} updated to ${tier}`);
    } catch (err) {
      console.error("❌ Failed to update user subscription:", err);
    }
  }

  res.sendStatus(200);
};
