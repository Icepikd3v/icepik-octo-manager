const { test } = require("node:test");
const assert = require("node:assert/strict");
const { getOctoPrintConfig } = require("../config/octoprint");

const env = {
  OCTOPRINT_ED1_URL: "http://printer/ED1/",
  OCTOPRINT_ED1_API_KEY: "first-test-key",
  OCTOPRINT_ED2_URL: "http://printer/ED2",
  OCTOPRINT_ED2_API_KEY: "second-test-key",
};

test("each instance and its legacy name resolve to their own credentials", () => {
  for (const [name, alias, path, apiKey] of [
    ["ED1", "EnderDirect", "ED1", "first-test-key"],
    ["ED2", "EnderMultiColor", "ED2", "second-test-key"],
  ]) {
    const expected = { baseUrl: `http://printer/${path}`, apiKey };
    assert.deepEqual(getOctoPrintConfig(name, env), expected);
    assert.deepEqual(getOctoPrintConfig(alias, env), expected);
  }
});

test("legacy shared settings still resolve", () => {
  assert.deepEqual(getOctoPrintConfig("EnderDirect", {
    OCTOPRINT_BASE_URL: "http://printer/",
    OCTOPRINT_DIRECT_PATH: "/direct/",
    OCTOPRINT_API_KEY: "legacy-test-key",
  }), { baseUrl: "http://printer/direct", apiKey: "legacy-test-key" });
});

test("unknown printers and incomplete or unsafe URLs fail closed", () => {
  assert.throws(() => getOctoPrintConfig("typo", env), /Unknown printer/);
  assert.throws(() => getOctoPrintConfig("ED1", {}), /must be configured/);
  for (const url of ["invalid", "ftp://printer", "http://user:secret@printer", "http://printer?key=secret"]) {
    assert.throws(() => getOctoPrintConfig("ED1", { ...env, OCTOPRINT_ED1_URL: url }), /Invalid OctoPrint URL/);
  }
});

test("all printer requests use the selected instance key, including print start", async () => {
  Object.assign(process.env, env);
  const axios = require("axios");
  const calls = [];
  const originals = { get: axios.get, post: axios.post, delete: axios.delete };
  for (const method of Object.keys(originals)) {
    axios[method] = async (url, ...args) => {
      calls.push({ method, url, options: args.at(-1) });
      return { data: { files: [] } };
    };
  }
  try {
    const service = require("../services/octoprintServices");
    const { startPrintJob } = require("../controllers/printController");
    for (const printer of ["ED1", "ED2", "EnderDirect", "EnderMultiColor"]) {
      calls.length = 0;
      await service.getPrintStatus(printer);
      await service.getPrinterFiles(printer);
      await service.pausePrint(printer);
      await service.resumePrint(printer);
      await service.cancelPrint(printer);
      await service.deleteOctoPrintFile("test.gcode", printer);
      assert.deepEqual(await startPrintJob({ printer, filename: "test.gcode" }), { success: true });
      const expected = getOctoPrintConfig(printer, env);
      assert.equal(calls.length, 7);
      for (const call of calls) {
        assert.ok(call.url.startsWith(`${expected.baseUrl}/api/`));
        assert.equal(call.options.headers["X-Api-Key"], expected.apiKey);
      }
    }
  } finally {
    Object.assign(axios, originals);
  }
});
