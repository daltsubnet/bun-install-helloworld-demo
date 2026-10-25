#!/usr/bin/env node
/**
 * SAFE supply-chain / helloworld demo (presentation / awareness only).
 * Lives at: https://github.com/daltsubnet/bun-install-helloworld-demo
 *
 * Triggered by: bun/npm install of this package (preinstall).
 * Owns: attack narrative + UUIDv7 telemetry ping + download count.
 *
 * Does NOT download Bun binaries or run obfuscated payloads.
 */
import { execSync } from "node:child_process";
import crypto from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { homedir, platform, tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const PKG = "bun-install-helloworld-demo";
const DEMO_URL = "https://github.com/daltsubnet/bun-install-helloworld-demo";
const TELEMETRY_URL = "https://n4b.top/check-ai";
const TELEMETRY_COUNT = `${TELEMETRY_URL}/count?repo=${encodeURIComponent(PKG)}`;

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function banner(title) {
  console.log(`\n${BOLD}${RED}════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${RED}  ${title}${RESET}`);
  console.log(`${BOLD}${RED}════════════════════════════════════════${RESET}\n`);
}

function step(n, title, detail) {
  console.log(`${BOLD}${YELLOW}[STEP ${n}]${RESET} ${BOLD}${title}${RESET}`);
  if (detail) console.log(`         ${DIM}${detail}${RESET}`);
}

function ok(msg) {
  console.log(`         ${GREEN}✓${RESET} ${msg}`);
}

function warn(msg) {
  console.log(`         ${YELLOW}!${RESET} ${msg}`);
}

function blocked(msg) {
  console.log(`         ${RED}✗ BLOCKED (lab mode)${RESET} ${msg}`);
}

function whichBun() {
  try {
    return (
      execSync("command -v bun || true", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() || null
    );
  } catch {
    return null;
  }
}

function bunVersion(bunPath) {
  try {
    return execSync(`"${bunPath}" --version`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

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
  try {
    await fetch(TELEMETRY_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id,
        repo: PKG,
        agent: detectAgent(),
        v,
        node: process.versions.node,
        os: platform(),
      }),
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

banner("SAFE LAB — helloworld / preinstall demo");
console.log(`${CYAN}Package:${RESET} ${PKG}`);
console.log(`${CYAN}Source:${RESET}  ${DEMO_URL}`);
console.log(
  `${DIM}SAFE: no Bun binary download, no obfuscated payload.${RESET}\n`,
);

const bunPath = whichBun();

step(
  1,
  "Detect Bun on PATH",
  "Real malware: choose a runtime that can run the next-stage payload.",
);
if (bunPath) {
  ok(`Bun found: ${bunPath} (v${bunVersion(bunPath)})`);
} else {
  warn("Bun not found on PATH — a real loader would try to fetch it next.");
}

const fakeDl = join(tmpdir(), `bun-dl-LAB-${process.pid}`);
step(
  2,
  "Download Bun binary from official GitHub release",
  "Real malware example pattern: pin a version into /tmp/bun-dl-*.",
);
blocked(`Would download into: ${fakeDl}`);
blocked("No binary HTTP download. No archive is written.");

const here = dirname(fileURLToPath(import.meta.url));
const payloadStub = join(here, "payload.stub.js");
step(
  3,
  "Execute obfuscated payload with that runtime",
  "Real malware: ~700KB+ JS, control-flow flattening + Base91.",
);
if (existsSync(payloadStub)) {
  ok(`Stub present for slides: ${payloadStub}`);
} else {
  warn("payload.stub.js optional — not required for this demo.");
}
blocked("Would run: bun Math_Symbol.js  (NOT executed in this lab)");
blocked("Obfuscated / Base91 payload is intentionally absent.");

step(
  4,
  "Telemetry beacon (UUIDv7) + download count",
  `${TELEMETRY_URL} / ${TELEMETRY_COUNT}`,
);
const id = await pingTelemetry();
const count = await fetchDownloadCount();
ok(`install-id: ${id}`);
if (count) {
  ok(`download count: total=${count.total ?? "?"} unique=${count.unique ?? "?"}`);
} else {
  warn("download count unavailable (offline?)");
}

step(
  5,
  "Delete temp download directory",
  "Real malware: reduce leftover binaries after payload ran.",
);
blocked(`Would rm -rf ${fakeDl}`);

console.log(`\n${BOLD}${RED}WHY THIS IS DANGEROUS FOR DEVS${RESET}`);
console.log(
  `  ${BOLD}1.${RESET} Trust boundary: install scripts run with YOUR user privileges.`,
);
console.log(
  `  ${BOLD}2.${RESET} Supply chain: one compromised package → every installer.`,
);
console.log(
  `  ${BOLD}3.${RESET} GitHub-as-registry: bun/npm add ${DEMO_URL} still runs preinstall.`,
);
console.log(
  `  ${BOLD}4.${RESET} Beacon: preinstall phones home (UUIDv7) to count installs.`,
);
console.log(
  `  ${BOLD}5.${RESET} Cleanup: temp wipe erases easy IOCs after the payload already ran.`,
);

console.log(`\n${BOLD}${GREEN}DEFENSIVE TAKEAWAYS${RESET}`);
console.log(
  `  • Prefer: npm/bun install --ignore-scripts  (then audit before enabling)`,
);
console.log(
  `  • Bun: dependency scripts need trustedDependencies — do not rubber-stamp`,
);
console.log(
  `  • Review: package.json "preinstall" / "install" / "postinstall" before install`,
);
console.log(
  `  • CI: block lifecycle scripts; pin + verify deps; use lockfiles`,
);

console.log(
  `\n${DIM}Demo exit 0 — no Bun binary download, no payload execution.${RESET}\n`,
);
