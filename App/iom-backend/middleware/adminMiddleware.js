module.exports = (req, res, next) => req.account?.isAdmin === true ? next() : res.status(403).json({ message: 'Administrator access is required.' });
