// controllers/webhookController.js

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/Users");
const PrintJob = require("../models/PrintJob");
const { notifyUser } = require("../services/emailManager");
const { logEvent } = require("../services/analyticsService");
const { processNextPrintInQueue } = require("../utils/queueProcessor");

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const priceToTier = {
  [process.env.STRIPE_PRICE_BRONZE]: "bronze",
  [process.env.STRIPE_PRICE_SILVER]: "silver",
  [process.env.STRIPE_PRICE_GOLD]: "gold",
};

module.exports = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const octoHeader = req.headers["x-octoprint-event"];

  // Stripe Webhook Handling
  if (sig) {
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error("⚠️ Stripe webhook signature failed:", err.message);
      return res.status(400).send(`Stripe Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const subscriptionId = session.subscription;

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        {
          limit: 1,
        },
      );
      const priceId = lineItems.data[0]?.price?.id;
      const tier = priceToTier[priceId] || "basic";

      try {
        const updated = await User.findByIdAndUpdate(userId, {
          subscriptionTier: tier,
          stripeSubscriptionId: subscriptionId,
          subscriptionStartDate: new Date(),
          subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        console.log(`✅ User ${updated?.username} upgraded to ${tier}`);
      } catch (err) {
        console.error("❌ Failed to update user subscription:", err);
      }
    }

    return res.sendStatus(200);
  }

  // OctoPrint Webhook Handling
  if (octoHeader && req.body.topic === "PrintDone") {
    const printer = req.body.deviceIdentifier;
    const printName = req.body.print_name;

    try {
      const job = await PrintJob.findOneAndUpdate(
        {
          filename: printName,
          status: { $in: ["printing", "queued", "pending_user_start"] },
        },
        { status: "completed" },
        { new: true },
      );

      if (job) {
        await logEvent(job.userId, "print_completed", {
          printer,
          filename: printName,
        });

        const user = await User.findById(job.userId);
        if (user?.email) {
          await notifyUser("completed", user, {
            printer,
            filename: printName,
          });
        }

        console.log(`✅ Completed: ${printName} on ${printer}`);
        await processNextPrintInQueue(printer);
      } else {
        console.warn(`⚠️ No matching job found for: ${printName}`);
      }
    } catch (err) {
      console.error("❌ OctoPrint webhook error:", err.message);
    }

    return res.sendStatus(200);
  }

  res.status(400).send("Unsupported webhook");
};
