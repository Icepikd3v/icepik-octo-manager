// middleware/subscriptionMiddleware.js

const subscriptionLimits = {
  basic: 0,
  bronze: 1,
  silver: 5,
  gold: Infinity,
};

const subscriptionCheck = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const allowed = subscriptionLimits[user.subscriptionTier] > 0;

  if (!allowed) {
    return res.status(403).json({
      message:
        "This feature is only available to users with a paid subscription plan.",
    });
  }

  next();
};

module.exports = subscriptionCheck;
