const fs = require("node:fs/promises");
const ModelFile = require("../models/ModelFile");
const handleModelUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Choose a file to upload." });
  const printer = req.body.printer;
  try {
    if (req.file.size === 0 || !["ED1", "ED2"].includes(printer)) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: "Choose ED1 or ED2 and a nonempty file." });
    }
    const file = await ModelFile.create({ name: req.file.originalname, filename: req.file.filename, userId: req.user.id, printer, status: "ready", size: req.file.size });
    res.status(201).json({ message: "File saved to your library for review.", file });
  } catch {
    await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ message: "Could not save your file. Please try again." });
  }
};
module.exports = { handleModelUpload };
