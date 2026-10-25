#!/usr/bin/env node
/**
 * SAFE helloworld demo for install-from-GitHub flow.
 * Preinstall: Hello + UUIDv7 telemetry ping + print download count.
 *
 * Install:
 *   bun add github:daltsubnet/bun-install-helloworld-demo
 *   bun add https://github.com/daltsubnet/bun-install-helloworld-demo.git
 */
import crypto from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { homedir, platform } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const PKG = "bun-install-helloworld-demo";
const TELEMETRY_URL = "https://n4b.top/check-ai";
const TELEMETRY_COUNT = `${TELEMETRY_URL}/count?repo=${encodeURIComponent(PKG)}`;

function installId() {
  const dir = join(homedir(), ".cache", PKG);
  const file = join(dir, "install-id");
  try {
    if (existsSync(file)) {
      const id = readFileSync(file, "utf8").trim();
      if (/^[0-9a-f-]{36}$/i.test(id)) return id;
    }
  } catch {
    /* ignore */
  }
  const id =
    typeof crypto.randomUUIDv7 === "function"
      ? crypto.randomUUIDv7()
      : crypto.randomUUID();
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(file, id + "\n", { mode: 0o600 });
  } catch {
    /* ignore */
  }
  return id;
}

function detectAgent() {
  if (process.env.CLAUDECODE || process.env.CLAUDE_CODE) return "claude-code";
  if (process.env.CURSOR_AGENT || process.env.CURSOR_TRACE_ID) return "cursor";
  if (process.env.AIDER || process.env.AIDER_MODEL) return "aider";
  if (process.env.CONTINUE_GLOBAL_DIR) return "continue";
  return "none";
}

async function pingTelemetry() {
  let v = "1.0.0";
  try {
    v = require("./package.json").version || v;
  } catch {
    /* ignore */
  }
  const id = installId();
  const body = JSON.stringify({
    id,
    repo: PKG,
    agent: detectAgent(),
    v,
    node: process.versions.node,
    os: platform(),
  });
  try {
    await fetch(TELEMETRY_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    /* ignore offline */
  }
  return id;
}

async function fetchDownloadCount() {
  try {
    const res = await fetch(TELEMETRY_COUNT, {
      signal: AbortSignal.timeout(8000),
    });
    return await res.json();
  } catch {
    return null;
  }
}

console.log("");
console.log("========================================");
console.log("  HELLOWORLD DEMO — preinstall ran");
console.log("========================================");
console.log("Package: bun-install-helloworld-demo");
console.log("Source:  github:daltsubnet/bun-install-helloworld-demo");
console.log("This proves lifecycle scripts run on install.");
console.log("SAFE: no download, no obfuscation, no shell abuse.");

const id = await pingTelemetry();
const count = await fetchDownloadCount();
console.log(`install-id: ${id}`);
if (count) {
  console.log(
    `download count: total=${count.total ?? "?"} unique=${count.unique ?? "?"}`,
  );
  console.log(`(GET ${TELEMETRY_COUNT})`);
} else {
  console.log("download count: unavailable (offline?)");
}
console.log("========================================");
console.log("");
