// utils/queueHelper.js

const tierPriority = {
  gold: 1,
  silver: 2,
  bronze: 3,
  basic: 4,
};

// Compare print jobs by user tier and submission time
const sortJobsByPriority = async (jobs, userModel) => {
  const users = await userModel
    .find({
      _id: { $in: jobs.map((j) => j.userId) },
    })
    .lean();

  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

  return jobs.sort((a, b) => {
    const userA = userMap[a.userId.toString()];
    const userB = userMap[b.userId.toString()];

    const tierA = tierPriority[userA.subscriptionTier] || 5;
    const tierB = tierPriority[userB.subscriptionTier] || 5;

    if (tierA !== tierB) return tierA - tierB;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
};

module.exports = { sortJobsByPriority };
