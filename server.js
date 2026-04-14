const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { URL } = require("node:url");
const {
  createStore,
  readJsonBody,
  getAuthToken,
  writeJson,
  normalizePermissions,
} = require("./backend");

const cwd = __dirname;
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const uploadsDir = path.join(cwd, "uploads", "assets");
const dataFile = process.env.DATA_FILE || path.join(cwd, "data", "production-db.local.json");
const seedFile = process.env.SEED_FILE || path.join(cwd, "data", "production-db.json");
const sessionSecret = process.env.SESSION_SECRET || "frameforge-dev-secret";
const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const bootstrapAdminEmails = String(process.env.BOOTSTRAP_ADMIN_EMAILS || "")
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

const store = createStore({ dataFile, seedFile, uploadsDir, bootstrapAdminEmails });

const staticFiles = {
  "/": "index.html",
  "/index.html": "index.html",
  "/app.js": "app.js",
  "/styles.css": "styles.css",
};

function contentType(filePath) {
  const ext = path.extname(filePath);
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".js") return "application/javascript; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".pdf") return "application/pdf";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

async function serveFile(res, filePath) {
  try {
    const body = await fsp.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType(filePath) });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

function getCurrentUser(req) {
  return store.getSessionUser(getAuthToken(req), sessionSecret);
}

async function handleApi(req, res, url) {
  const user = getCurrentUser(req);
  const method = req.method || "GET";

  if (method === "GET" && url.pathname === "/api/health") {
    return writeJson(res, 200, { ok: true });
  }

  if (method === "GET" && url.pathname === "/config.js") {
    res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
    res.end(`window.frameForgeConfig = ${JSON.stringify({ googleClientId })};`);
    return;
  }

  if (method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readJsonBody(req);
    const session = await store.loginWithPassword(body, sessionSecret);
    return writeJson(res, 200, session);
  }

  if (method === "POST" && url.pathname === "/api/auth/google") {
    const body = await readJsonBody(req);
    const session = await store.loginWithGoogle(body, sessionSecret, googleClientId);
    return writeJson(res, 200, session);
  }

  if (method === "GET" && url.pathname === "/api/bootstrap") {
    store.requireAccess(user, "dashboard", "view");
    return writeJson(res, 200, {
      user,
      data: store.getState(),
    });
  }

  if (method === "GET" && url.pathname === "/api/settings") {
    store.requireAccess(user, "settings", "view");
    return writeJson(res, 200, store.getState().settings);
  }

  if (method === "PUT" && url.pathname === "/api/settings") {
    store.requireAccess(user, "settings", "edit");
    const body = await readJsonBody(req);
    const settings = await store.updateSettings(body);
    return writeJson(res, 200, settings);
  }

  if (method === "GET" && url.pathname === "/api/project") {
    store.requireAccess(user, "project", "view");
    return writeJson(res, 200, store.getState().project);
  }

  if (method === "PUT" && url.pathname === "/api/project") {
    store.requireAccess(user, "project", "edit");
    const body = await readJsonBody(req);
    const project = await store.updateProject(body);
    return writeJson(res, 200, project);
  }

  if (method === "POST" && url.pathname === "/api/project/weather-sync") {
    store.requireAccess(user, "project", "edit");
    const result = await store.syncProjectWeather();
    return writeJson(res, 200, result);
  }

  if (method === "GET" && url.pathname === "/api/callsheets") {
    store.requireAccess(user, "callsheets", "view");
    const state = store.getState();
    const callsheets = state.callsheets.map((sheet) => ({
      ...sheet,
      forecast: store.getForecastForDate(sheet.shootDate),
    }));
    return writeJson(res, 200, callsheets);
  }

  if (method === "POST" && url.pathname === "/api/callsheets") {
    store.requireAccess(user, "callsheets", "edit");
    const body = await readJsonBody(req);
    const created = await store.createCallsheet(body);
    return writeJson(res, 201, { ...created, forecast: store.getForecastForDate(created.shootDate) });
  }

  if ((method === "PUT" || method === "DELETE") && url.pathname.startsWith("/api/callsheets/")) {
    const id = url.pathname.split("/").pop();
    if (method === "PUT") {
      store.requireAccess(user, "callsheets", "edit");
      const body = await readJsonBody(req);
      const updated = await store.updateCallsheet(id, body);
      return writeJson(res, 200, { ...updated, forecast: store.getForecastForDate(updated.shootDate) });
    }
    store.requireAccess(user, "callsheets", "edit");
    await store.deleteCallsheet(id);
    return writeJson(res, 204, {});
  }

  if (method === "GET" && url.pathname === "/api/assets") {
    store.requireAccess(user, "assets", "view");
    return writeJson(res, 200, store.getState().assets);
  }

  if (method === "POST" && url.pathname === "/api/assets/upload") {
    store.requireAccess(user, "assets", "edit");
    const body = await readJsonBody(req);
    const asset = await store.uploadAsset(body, user);
    return writeJson(res, 201, asset);
  }

  if (method === "DELETE" && url.pathname.startsWith("/api/assets/")) {
    store.requireAccess(user, "assets", "edit");
    const id = url.pathname.split("/").pop();
    await store.deleteAsset(id);
    return writeJson(res, 204, {});
  }

  if (method === "GET" && url.pathname === "/api/team") {
    store.requireAccess(user, "team", "view");
    return writeJson(res, 200, store.getState().users);
  }

  if (method === "POST" && url.pathname === "/api/team") {
    store.requireAccess(user, "team", "edit");
    const body = await readJsonBody(req);
    const member = await store.addTeamMember({
      ...body,
      permissions: normalizePermissions(body.permissions, body.role === "viewer" ? "view" : "edit"),
    });
    return writeJson(res, 201, member);
  }

  return writeJson(res, 404, { error: "Not found" });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || `${host}:${port}`}`);
  try {
    if (url.pathname === "/config.js") {
      res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
      res.end(`window.frameForgeConfig = ${JSON.stringify({ googleClientId })};`);
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    if (url.pathname.startsWith("/uploads/assets/")) {
      const safeName = path.basename(url.pathname);
      await serveFile(res, path.join(uploadsDir, safeName));
      return;
    }

    const staticFile = staticFiles[url.pathname] || "index.html";
    await serveFile(res, path.join(cwd, staticFile));
  } catch (error) {
    const statusCode = error.statusCode || 500;
    writeJson(res, statusCode, { error: error.message || "Internal server error." });
  }
});

server.listen(port, host, () => {
  console.log(`FrameForge running at http://${host}:${port}`);
});
