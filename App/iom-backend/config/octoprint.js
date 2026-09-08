const prefixes = {
  ED1: "OCTOPRINT_ED1",
  ED2: "OCTOPRINT_ED2",
  EnderDirect: "OCTOPRINT_ED1",
  EnderMultiColor: "OCTOPRINT_ED2",
};

function getOctoPrintConfig(printer = "EnderDirect", env = process.env) {
  if (!Object.hasOwn(prefixes, printer)) throw new Error(`Unknown printer: ${printer}`);
  const prefix = prefixes[printer];

  const legacyPrefix = prefix === "OCTOPRINT_ED1" ? "OCTOPRINT_DIRECT" : "OCTOPRINT_MULTICOLOR";
  const base = (env.OCTOPRINT_BASE_URL || "").replace(/\/+$/, "");
  const path = (env[`${legacyPrefix}_PATH`] || "").replace(/^\/+|\/+$/g, "");
  const baseUrl = (env[`${prefix}_URL`] || env[`${legacyPrefix}_URL`] || (base && `${base}${path ? `/${path}` : ""}`))
    .replace(/\/+$/, "");
  const apiKey = env[`${prefix}_API_KEY`] || env[`${legacyPrefix}_API_KEY`] || env.OCTOPRINT_API_KEY;
  if (!baseUrl || !apiKey) {
    throw new Error(`OctoPrint URL and API key must be configured for ${printer}`);
  }
  let url;
  try { url = new URL(baseUrl); } catch {
    throw new Error(`Invalid OctoPrint URL for ${printer}`);
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error(`Invalid OctoPrint URL for ${printer}`);
  }
  return { baseUrl, apiKey };
}

module.exports = { getOctoPrintConfig };
