const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const auth = require("../middleware/authMiddleware");
const ModelFile = require("../models/ModelFile");

router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    const newFile = await ModelFile.create({
      name: req.file.originalname,
      filename: req.file.filename,
      userId: req.user.id,
    });

    res.status(201).json({ message: "File uploaded", file: newFile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
