const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { createApp } = require("./backend");

loadEnvFile(path.join(__dirname, ".env"));

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";

async function start() {
  const app = createApp({
    rootDir: __dirname,
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  });
  await app.init();

  const server = http.createServer((request, response) => app.handleRequest(request, response));

  server.listen(port, host, () => {
    console.log(`FrameForge running on http://${host}:${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
}
