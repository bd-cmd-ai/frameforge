const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MODULES = ["dashboard", "project", "callsheets", "assets", "settings", "team"];

const defaultPermissions = (level = "view") =>
  Object.fromEntries(MODULES.map((key) => [key, level]));

const DEFAULT_DB = {
  settings: {
    studioName: "FrameForge",
    companyName: "Production Office",
    locale: "sl-SI",
    currency: "EUR",
    timezone: "Europe/Ljubljana",
    weatherLocation: "Ljubljana, Slovenia",
    weatherUpdatedAt: "",
    forecastDays: [],
  },
  project: {
    title: "Untitled Production",
    format: "Feature",
    stage: "Prep",
    shootStart: "",
    shootEnd: "",
    location: "Ljubljana, Slovenia",
    description: "",
  },
  users: [
    {
      id: "user-producer",
      name: "Producer",
      email: "producer@frameforge.app",
      role: "producer",
      authProvider: "local",
      password: "demo123",
      permissions: defaultPermissions("edit"),
      createdAt: "2026-04-14T08:00:00.000Z",
    },
  ],
  callsheets: [
    {
      id: "cs-1",
      title: "Shoot Day 1",
      shootDate: "",
      location: "Ljubljana, Slovenia",
      crewCall: "07:00",
      firstShot: "08:30",
      wrapTime: "18:00",
      unit: "Main Unit",
      notes: "",
      status: "Draft",
      attachments: [],
      createdAt: "2026-04-14T08:00:00.000Z",
      updatedAt: "2026-04-14T08:00:00.000Z",
    },
  ],
  assets: [],
};

function createId(prefix) {
  return `${prefix}-${crypto.randomBytes(6).toString("hex")}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureDirSync(target) {
  fs.mkdirSync(target, { recursive: true });
}

function normalizePermissions(input, fallback = "view") {
  const normalized = {};
  for (const moduleKey of MODULES) {
    const value = input?.[moduleKey];
    normalized[moduleKey] = value === "edit" || value === "view" || value === "none" ? value : fallback;
  }
  return normalized;
}

function normalizeUser(user) {
  return {
    id: user.id || createId("user"),
    name: String(user.name || "Team Member").trim(),
    email: String(user.email || "").trim().toLowerCase(),
    role: String(user.role || "viewer").trim().toLowerCase(),
    authProvider: user.authProvider || "local",
    password: user.password || "",
    permissions: normalizePermissions(
      user.permissions,
      user.role === "producer" || user.role === "admin" ? "edit" : "view"
    ),
    createdAt: user.createdAt || new Date().toISOString(),
  };
}

function normalizeAsset(asset) {
  return {
    id: asset.id || createId("asset"),
    title: String(asset.title || "Untitled document").trim(),
    category: String(asset.category || "General").trim(),
    mimeType: String(asset.mimeType || "application/octet-stream"),
    fileName: String(asset.fileName || "file"),
    fileUrl: String(asset.fileUrl || ""),
    uploadedAt: asset.uploadedAt || new Date().toISOString(),
    uploadedBy: String(asset.uploadedBy || ""),
  };
}

function normalizeCallsheet(callsheet, fallbackLocation) {
  return {
    id: callsheet.id || createId("cs"),
    title: String(callsheet.title || "Untitled Call Sheet").trim(),
    shootDate: String(callsheet.shootDate || ""),
    location: String(callsheet.location || fallbackLocation || "").trim(),
    crewCall: String(callsheet.crewCall || ""),
    firstShot: String(callsheet.firstShot || ""),
    wrapTime: String(callsheet.wrapTime || ""),
    unit: String(callsheet.unit || "Main Unit").trim(),
    notes: String(callsheet.notes || ""),
    status: ["Draft", "Ready", "Published"].includes(callsheet.status) ? callsheet.status : "Draft",
    attachments: Array.isArray(callsheet.attachments) ? callsheet.attachments.map(String) : [],
    createdAt: callsheet.createdAt || new Date().toISOString(),
    updatedAt: callsheet.updatedAt || new Date().toISOString(),
  };
}

function normalizeSettings(settings) {
  return {
    studioName: String(settings.studioName || DEFAULT_DB.settings.studioName).trim(),
    companyName: String(settings.companyName || DEFAULT_DB.settings.companyName).trim(),
    locale: String(settings.locale || DEFAULT_DB.settings.locale).trim(),
    currency: String(settings.currency || DEFAULT_DB.settings.currency).trim().toUpperCase(),
    timezone: String(settings.timezone || DEFAULT_DB.settings.timezone).trim(),
    weatherLocation: String(settings.weatherLocation || DEFAULT_DB.settings.weatherLocation).trim(),
    weatherUpdatedAt: String(settings.weatherUpdatedAt || ""),
    forecastDays: Array.isArray(settings.forecastDays)
      ? settings.forecastDays.map((item) => ({
          date: String(item.date || ""),
          summary: String(item.summary || ""),
          min: Number.isFinite(item.min) ? item.min : null,
          max: Number.isFinite(item.max) ? item.max : null,
          sunrise: String(item.sunrise || ""),
          sunset: String(item.sunset || ""),
        }))
      : [],
  };
}

function normalizeProject(project) {
  return {
    title: String(project.title || DEFAULT_DB.project.title).trim(),
    format: String(project.format || DEFAULT_DB.project.format).trim(),
    stage: String(project.stage || DEFAULT_DB.project.stage).trim(),
    shootStart: String(project.shootStart || ""),
    shootEnd: String(project.shootEnd || ""),
    location: String(project.location || DEFAULT_DB.project.location).trim(),
    description: String(project.description || ""),
  };
}

function normalizeDb(raw) {
  const settings = normalizeSettings({ ...DEFAULT_DB.settings, ...(raw?.settings || {}) });
  const project = normalizeProject({ ...DEFAULT_DB.project, ...(raw?.project || {}) });
  return {
    settings,
    project,
    users: (raw?.users || DEFAULT_DB.users).map(normalizeUser).filter((user) => user.email),
    callsheets: (raw?.callsheets || DEFAULT_DB.callsheets).map((sheet) =>
      normalizeCallsheet(sheet, project.location || settings.weatherLocation)
    ),
    assets: (raw?.assets || []).map(normalizeAsset),
  };
}

function sanitizeForClient(db) {
  return {
    settings: db.settings,
    project: db.project,
    users: db.users.map(({ password, ...user }) => user),
    callsheets: db.callsheets,
    assets: db.assets,
  };
}

function getRoleLabel(role) {
  if (role === "producer") return "Producer";
  if (role === "admin") return "Admin";
  if (role === "coordinator") return "Coordinator";
  return "Viewer";
}

function signToken(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verifyToken(token, secret) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  if (payload.exp && Date.now() > payload.exp) return null;
  return payload;
}

function decodeJwtPayload(token) {
  if (!token || token.split(".").length < 2) return null;
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

async function readJsonBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_UPLOAD_BYTES * 2) {
      const error = new Error("Payload too large");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error("Invalid JSON body");
    error.statusCode = 400;
    throw error;
  }
}

function getAuthToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function getMimeExtension(mimeType) {
  if (mimeType === "application/pdf") return ".pdf";
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/jpeg") return ".jpg";
  if (mimeType === "image/webp") return ".webp";
  return "";
}

function mapWeatherCode(code) {
  const table = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Cloudy",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Rain",
    63: "Heavy rain",
    65: "Strong rain",
    71: "Snow",
    80: "Rain showers",
    95: "Thunderstorm",
  };
  return table[code] || "Mixed weather";
}

async function geocodeLocation(query) {
  if (!query) return null;
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}.`);
  }
  const data = await response.json();
  const first = data.results?.[0];
  if (!first) return null;
  return {
    label: [first.name, first.admin1, first.country].filter(Boolean).join(", "),
    latitude: first.latitude,
    longitude: first.longitude,
  };
}

async function fetchWeatherForecast(location) {
  if (!location) return [];
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set("daily", "weather_code,temperature_2m_min,temperature_2m_max,sunrise,sunset");
  url.searchParams.set("forecast_days", "14");
  url.searchParams.set("timezone", "auto");
  const response = await fetch(url);
  if (response.status === 429) {
    throw new Error("Weather provider is rate-limiting requests. Retry in a minute.");
  }
  if (!response.ok) {
    throw new Error(`Weather forecast failed with status ${response.status}.`);
  }
  const payload = await response.json();
  const daily = payload.daily || {};
  return (daily.time || []).map((date, index) => ({
    date,
    summary: mapWeatherCode(daily.weather_code?.[index]),
    min: daily.temperature_2m_min?.[index] ?? null,
    max: daily.temperature_2m_max?.[index] ?? null,
    sunrise: daily.sunrise?.[index] || "",
    sunset: daily.sunset?.[index] || "",
  }));
}

async function syncWeather(db) {
  const query = db.project.location || db.settings.weatherLocation;
  const location = await geocodeLocation(query);
  if (!location) {
    return { settings: db.settings, warning: "Location not found, so forecast was not updated." };
  }
  try {
    const forecastDays = await fetchWeatherForecast(location);
    return {
      settings: normalizeSettings({
        ...db.settings,
        weatherLocation: location.label,
        weatherUpdatedAt: new Date().toISOString(),
        forecastDays,
      }),
      warning: "",
    };
  } catch (error) {
    return {
      settings: normalizeSettings({
        ...db.settings,
        weatherLocation: location.label,
        forecastDays: [],
      }),
      warning: error.message,
    };
  }
}

function createStore({ dataFile, seedFile, uploadsDir, bootstrapAdminEmails = [] }) {
  ensureDirSync(path.dirname(dataFile));
  ensureDirSync(path.dirname(seedFile));
  ensureDirSync(uploadsDir);

  let cache = normalizeDb(fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, "utf8")) : fs.existsSync(seedFile) ? JSON.parse(fs.readFileSync(seedFile, "utf8")) : DEFAULT_DB);
  persistSync();

  function persistSync() {
    fs.writeFileSync(dataFile, JSON.stringify(cache, null, 2));
  }

  async function persist() {
    await fsp.writeFile(dataFile, JSON.stringify(cache, null, 2));
  }

  function getState() {
    return sanitizeForClient(cache);
  }

  function getUserByEmail(email) {
    return cache.users.find((user) => user.email === String(email || "").trim().toLowerCase());
  }

  function issueSession(user, secret) {
    return signToken(
      {
        sub: user.id,
        email: user.email,
        exp: Date.now() + SESSION_TTL_MS,
      },
      secret
    );
  }

  function getSessionUser(token, secret) {
    const payload = verifyToken(token, secret);
    if (!payload?.sub) return null;
    const user = cache.users.find((entry) => entry.id === payload.sub);
    return user ? { ...user, password: undefined } : null;
  }

  async function loginWithPassword({ email, password }, secret) {
    const user = getUserByEmail(email);
    if (!user || user.password !== password) {
      const error = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }
    return {
      token: issueSession(user, secret),
      user: sanitizeForClient({ ...DEFAULT_DB, users: [user] }).users[0],
    };
  }

  async function loginWithGoogle({ credential, email, name }, secret, clientId) {
    let googleEmail = String(email || "").trim().toLowerCase();
    let googleName = String(name || "").trim();
    if (credential) {
      const payload = decodeJwtPayload(credential);
      if (!payload) {
        const error = new Error("Invalid Google credential.");
        error.statusCode = 401;
        throw error;
      }
      if (clientId && payload.aud !== clientId) {
        const error = new Error("Google client mismatch.");
        error.statusCode = 401;
        throw error;
      }
      googleEmail = String(payload.email || googleEmail).trim().toLowerCase();
      googleName = String(payload.name || googleName).trim();
      if (!payload.email_verified) {
        const error = new Error("Google email must be verified.");
        error.statusCode = 401;
        throw error;
      }
    }
    if (!googleEmail) {
      const error = new Error("Google login did not include an email.");
      error.statusCode = 400;
      throw error;
    }
    let user = getUserByEmail(googleEmail);
    if (!user && bootstrapAdminEmails.includes(googleEmail)) {
      user = normalizeUser({
        id: createId("user"),
        name: googleName || googleEmail.split("@")[0],
        email: googleEmail,
        role: "producer",
        authProvider: "google",
        permissions: defaultPermissions("edit"),
      });
      cache.users.push(user);
      await persist();
    }
    if (!user) {
      const error = new Error("This Google account is not on the project team yet.");
      error.statusCode = 403;
      throw error;
    }
    return {
      token: issueSession(user, secret),
      user: sanitizeForClient({ ...DEFAULT_DB, users: [user] }).users[0],
    };
  }

  function requireAccess(user, moduleKey, mode = "view") {
    if (!user) {
      const error = new Error("Authentication required.");
      error.statusCode = 401;
      throw error;
    }
    const level = user.permissions?.[moduleKey] || "none";
    if (mode === "view" && level === "none") {
      const error = new Error("No access to this module.");
      error.statusCode = 403;
      throw error;
    }
    if (mode === "edit" && level !== "edit") {
      const error = new Error("Edit access required.");
      error.statusCode = 403;
      throw error;
    }
  }

  async function updateSettings(patch) {
    cache.settings = normalizeSettings({ ...cache.settings, ...patch });
    await persist();
    return cache.settings;
  }

  async function updateProject(patch) {
    cache.project = normalizeProject({ ...cache.project, ...patch });
    await persist();
    return cache.project;
  }

  async function syncProjectWeather() {
    const result = await syncWeather(cache);
    cache.settings = result.settings;
    await persist();
    return result;
  }

  async function createCallsheet(payload) {
    const record = normalizeCallsheet(
      {
        ...payload,
        id: createId("cs"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      cache.project.location || cache.settings.weatherLocation
    );
    cache.callsheets.unshift(record);
    await persist();
    return record;
  }

  async function updateCallsheet(id, patch) {
    const index = cache.callsheets.findIndex((entry) => entry.id === id);
    if (index === -1) {
      const error = new Error("Call sheet not found.");
      error.statusCode = 404;
      throw error;
    }
    const next = normalizeCallsheet(
      {
        ...cache.callsheets[index],
        ...patch,
        id,
        updatedAt: new Date().toISOString(),
      },
      cache.project.location || cache.settings.weatherLocation
    );
    cache.callsheets[index] = next;
    await persist();
    return next;
  }

  async function deleteCallsheet(id) {
    const index = cache.callsheets.findIndex((entry) => entry.id === id);
    if (index === -1) {
      const error = new Error("Call sheet not found.");
      error.statusCode = 404;
      throw error;
    }
    cache.callsheets.splice(index, 1);
    await persist();
  }

  function getForecastForDate(shootDate) {
    return cache.settings.forecastDays.find((entry) => entry.date === shootDate) || null;
  }

  async function uploadAsset({ title, category, fileName, mimeType, contentBase64 }, user) {
    const buffer = Buffer.from(String(contentBase64 || ""), "base64");
    if (!buffer.length) {
      const error = new Error("No file content received.");
      error.statusCode = 400;
      throw error;
    }
    if (buffer.length > MAX_UPLOAD_BYTES) {
      const error = new Error("File is too large.");
      error.statusCode = 413;
      throw error;
    }
    const ext = path.extname(fileName || "") || getMimeExtension(mimeType);
    const fileId = createId("asset-file");
    const storedName = `${fileId}${ext}`;
    const diskPath = path.join(uploadsDir, storedName);
    await fsp.writeFile(diskPath, buffer);
    const asset = normalizeAsset({
      id: createId("asset"),
      title: title || fileName,
      category,
      mimeType,
      fileName,
      fileUrl: `/uploads/assets/${storedName}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: user.email,
    });
    cache.assets.unshift(asset);
    await persist();
    return asset;
  }

  async function deleteAsset(id) {
    const index = cache.assets.findIndex((entry) => entry.id === id);
    if (index === -1) {
      const error = new Error("Asset not found.");
      error.statusCode = 404;
      throw error;
    }
    const [asset] = cache.assets.splice(index, 1);
    if (asset.fileUrl.startsWith("/uploads/assets/")) {
      const diskPath = path.join(uploadsDir, path.basename(asset.fileUrl));
      await fsp.rm(diskPath, { force: true });
    }
    await persist();
  }

  async function addTeamMember(payload) {
    const user = normalizeUser({
      id: createId("user"),
      name: payload.name,
      email: payload.email,
      role: payload.role,
      authProvider: payload.authProvider || "local",
      password: payload.password || "",
      permissions: normalizePermissions(payload.permissions, payload.role === "viewer" ? "view" : "edit"),
    });
    if (getUserByEmail(user.email)) {
      const error = new Error("A user with this email already exists.");
      error.statusCode = 409;
      throw error;
    }
    cache.users.push(user);
    await persist();
    return { ...user, password: undefined };
  }

  return {
    getState,
    getUserByEmail,
    getSessionUser,
    loginWithPassword,
    loginWithGoogle,
    requireAccess,
    updateSettings,
    updateProject,
    syncProjectWeather,
    createCallsheet,
    updateCallsheet,
    deleteCallsheet,
    getForecastForDate,
    uploadAsset,
    deleteAsset,
    addTeamMember,
  };
}

async function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

module.exports = {
  MAX_UPLOAD_BYTES,
  MODULES,
  DEFAULT_DB,
  createStore,
  readJsonBody,
  getAuthToken,
  writeJson,
  getRoleLabel,
  signToken,
  verifyToken,
  decodeJwtPayload,
  normalizePermissions,
  defaultPermissions,
};
