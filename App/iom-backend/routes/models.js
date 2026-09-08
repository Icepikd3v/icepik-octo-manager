const router = require("express").Router();
const upload = require("../middleware/uploadMiddleware");
const auth = require("../middleware/authMiddleware");
const ModelFile = require("../models/ModelFile");
const { handleModelUpload } = require("../controllers/uploadController");
router.post("/upload", auth, (req, res, next) => {
  upload.single("file")(req, res, err => err ? res.status(400).json({ message: err.code === "LIMIT_FILE_SIZE" ? "Files must be 50 MB or smaller." : err.message }) : next());
}, handleModelUpload);
router.get("/", auth, async (req, res) => {
  try { res.json(await ModelFile.find({ userId: req.user.id }).sort({ uploadDate: -1 })); }
  catch { res.status(503).json({ message: "Your file library is unavailable. Please try again." }); }
});
module.exports = router;
