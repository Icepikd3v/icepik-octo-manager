const multer = require("multer");
const path = require("path");

// Upload destination
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter to accept only STL or GCODE
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
