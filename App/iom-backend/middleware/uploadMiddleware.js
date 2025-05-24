const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sanitize = require("sanitize-filename");

// Ensure uploads/ directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const original = sanitize(file.originalname);
    const ext = path.extname(original);
    const base = path.basename(original, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});

// Accept only .stl or .gcode files
const fileFilter = (req, file, cb) => {
  const allowed = [".stl", ".gcode"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only .stl and .gcode files are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
