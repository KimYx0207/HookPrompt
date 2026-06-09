#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const hookScript = path.resolve(__dirname, "..", "..", ".claude", "hooks", "user-prompt-submit.js");

let input = "";
try {
  input = fs.readFileSync(0, "utf8");
} catch {
  input = "";
}

const result = spawnSync(process.execPath, [hookScript], {
  input,
  encoding: "utf8",
  timeout: 10000,
  windowsHide: true,
});

if (result.stdout) {
  process.stdout.write(result.stdout);
}

if (result.stderr) {
  process.stderr.write(result.stderr);
}

process.exit(0);
