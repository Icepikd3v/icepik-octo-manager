const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getPrinterStatus } = require("../services/printerStatus");
router.get("/", auth, async (req, res) => {
  const printers = await Promise.all(["ED1", "ED2"].map(getPrinterStatus));
  res.json({ printers });
});
module.exports = router;
