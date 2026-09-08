// macOS: makes website copies; never changes the supplied originals.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const source = path.resolve(__dirname, "../public");
const destination = path.join(source, "printing");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "ironroot-photo-crops-"));
// Photo-only rectangles: [top, left, height, width]. The right trim removes
// Instagram's scroll indicator. Coordinates refer to the original PNG pixels.
const crops = {
  IMG_8630: [510, 0, 1508, 1180],
  IMG_8631: [744, 0, 1504, 1180],
  IMG_8632: [558, 0, 1506, 1180],
};
const sips = args => execFileSync("/usr/bin/sips", args, { stdio: "pipe" });
fs.mkdirSync(destination, { recursive: true });
try {
  for (const file of fs.readdirSync(source).filter(name => /^IMG_.*\.HEIC$/.test(name) || Object.hasOwn(crops, path.parse(name).name))) {
    const name = path.parse(file).name;
    let input = path.join(source, file);
    if (crops[name]) {
      const [top, left, height, width] = crops[name];
      const cropped = path.join(temporary, `${name}.png`);
      sips(["-c", String(height), String(width), "--cropOffset", String(top), String(left), input, "--out", cropped]);
      input = cropped;
    }
    for (const [suffix, width, quality] of [["", 1080, 78], ["-small", 480, 76]]) {
      sips(["-s", "format", "jpeg", "-s", "formatOptions", String(quality), "--resampleWidth", String(width), input, "--out", path.join(destination, `${name}${suffix}.jpg`)]);
    }
    console.log(`Prepared ${name}`);
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
