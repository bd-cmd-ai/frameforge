const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { createPublicKey, createVerify } = require("node:crypto");

const STATIC_MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const GOOGLE_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);
let googleCertCache = {
  expiresAt: 0,
  keys: new Map(),
};

const COLLECTIONS = new Set(["schedule", "scenes", "contacts", "tasks", "budget", "assets"]);
const MODULE_KEYS = ["project", "schedule", "scenes", "callsheet", "contacts", "tasks", "budget", "assets", "team"];
const ROLE_TEMPLATES = {
  Producer: createAccess("edit"),
  Admin: createAccess("edit"),
  Viewer: {
    project: "view",
    schedule: "view",
    scenes: "view",
    callsheet: "view",
    contacts: "none",
    tasks: "none",
    budget: "none",
    assets: "view",
    team: "none",
  },
  Crew: {
    project: "view",
    schedule: "edit",
    scenes: "edit",
    callsheet: "view",
    contacts: "view",
    tasks: "edit",
    budget: "none",
    assets: "view",
    team: "none",
  },
  "1st AD": {
    project: "view",
    schedule: "edit",
    scenes: "edit",
    callsheet: "edit",
    contacts: "edit",
    tasks: "edit",
    budget: "none",
    assets: "view",
    team: "none",
  },
};

const DEFAULT_DB = {
  users: [
    {
      id: "user-prod-1",
      name: "Miles Ortega",
      email: "producer@frameforge.app",
      password: "demo123",
      googleSubject: "",
      role: "Producer",
      title: "Executive Producer",
      department: "Production",
      access: createAccess("edit"),
    },
    {
      id: "user-ad-1",
      name: "Petra Kranjc",
      email: "ad@frameforge.app",
      password: "demo123",
      googleSubject: "",
      role: "1st AD",
      title: "1st Assistant Director",
      department: "AD",
      access: ROLE_TEMPLATES["1st AD"],
    },
    {
      id: "user-view-1",
      name: "Lena Fischer",
      email: "viewer@frameforge.app",
      password: "demo123",
      googleSubject: "",
      role: "Viewer",
      title: "Financier",
      department: "Stakeholders",
      access: createAccess("view"),
    },
  ],
  project: {
    id: "project-midnight-sun",
    title: "Midnight Sun",
    tagline: "Feature thriller balancing prep, principal photography, and post.",
    status: "Active shoot",
    startDate: "2026-05-12",
    wrapDate: "2026-07-02",
    director: "Nadia Verhoeven",
    producer: "Miles Ortega",
    weather: "8°C / light wind / overcast",
    location: "Ljubljana Unit + Nordic exteriors",
    logline: "An Arctic investigator hunts a buried conspiracy before the midnight sun reveals the wrong truth.",
  },
  schedule: [
    {
      id: "day-12",
      day: "Day 12",
      date: "2026-05-27",
      location: "Warehouse Stage B",
      callTime: "06:00",
      notes: "Rain FX, car rig, stunt rehearsal at 08:00.",
      scenes: ["24A", "24B", "25"],
      status: "shooting",
    },
    {
      id: "day-13",
      day: "Day 13",
      date: "2026-05-28",
      location: "Harbor Exterior",
      callTime: "05:30",
      notes: "Golden hour opening shot. Marine safety briefing required.",
      scenes: ["32", "33", "33A"],
      status: "ready",
    },
    {
      id: "day-14",
      day: "Day 14",
      date: "2026-05-29",
      location: "Police Station Set",
      callTime: "07:15",
      notes: "Background talent heavy. Wardrobe continuity check on all principals.",
      scenes: ["37", "38", "40"],
      status: "risk",
    },
  ],
  scenes: [
    {
      id: "scene-24A",
      code: "24A",
      title: "Mara corners the informant",
      location: "Warehouse Stage B",
      setup: "Interior / Night",
      pages: "2 1/8",
      cast: "Mara, Ilan, Guard",
      elements: ["Hero prop weapon", "Rain FX", "Forklift picture vehicle"],
    },
    {
      id: "scene-32",
      code: "32",
      title: "Dawn pursuit on the pier",
      location: "Harbor Exterior",
      setup: "Exterior / Dawn",
      pages: "3 3/8",
      cast: "Mara, Jonas, Dock workers",
      elements: ["Drone unit", "Marine safety", "Stunt runner", "Smoke pots"],
    },
    {
      id: "scene-37",
      code: "37",
      title: "Interrogation room pivot",
      location: "Police Station Set",
      setup: "Interior / Day",
      pages: "5/8",
      cast: "Mara, Chief Edda",
      elements: ["Two-camera setup", "Hero files", "Glass practical"],
    },
  ],
  contacts: [
    {
      id: "contact-1",
      name: "Nadia Verhoeven",
      role: "Director",
      dept: "Direction",
      phone: "+31 20 555 0198",
      email: "nadia@frameforge.demo",
    },
    {
      id: "contact-2",
      name: "Miles Ortega",
      role: "Producer",
      dept: "Production",
      phone: "+1 323 555 0144",
      email: "miles@frameforge.demo",
    },
    {
      id: "contact-3",
      name: "Petra Kranjc",
      role: "1st AD",
      dept: "AD",
      phone: "+386 40 555 212",
      email: "petra@frameforge.demo",
    },
  ],
  tasks: [
    {
      id: "task-1",
      title: "Confirm marine police permit",
      owner: "Production Office",
      due: "2026-05-26",
      priority: "high",
      status: "In Progress",
    },
    {
      id: "task-2",
      title: "Lock pier drone exclusion zone",
      owner: "Locations",
      due: "2026-05-27",
      priority: "medium",
      status: "Not Started",
    },
    {
      id: "task-3",
      title: "Update continuity stills after scene 24B",
      owner: "Script Supervisor",
      due: "2026-05-27",
      priority: "medium",
      status: "Done",
    },
  ],
  budget: [
    { id: "budget-1", category: "Cast", estimated: 135000, actual: 129400 },
    { id: "budget-2", category: "Crew", estimated: 246000, actual: 252900 },
    { id: "budget-3", category: "Camera & Grip", estimated: 92000, actual: 88700 },
    { id: "budget-4", category: "Locations", estimated: 48000, actual: 43150 },
    { id: "budget-5", category: "Art Department", estimated: 77000, actual: 81500 },
    { id: "budget-6", category: "Post", estimated: 164000, actual: 133000 },
  ],
  assets: [
    {
      id: "asset-1",
      name: "Warehouse lighting plot v7",
      type: "PDF",
      owner: "Lighting",
      updated: "2026-05-25",
      tag: "Tech scout",
    },
    {
      id: "asset-2",
      name: "Harbor drone risk assessment",
      type: "DOC",
      owner: "Production",
      updated: "2026-05-24",
      tag: "Safety",
    },
    {
      id: "asset-3",
      name: "Scene 24A storyboard",
      type: "PNG",
      owner: "Direction",
      updated: "2026-05-26",
      tag: "Creative",
    },
  ],
};

function createStore(options = {}) {
  const resolvedOptions = typeof options === "string" ? { dataFile: options } : options;
  const dataFile = resolvedOptions.dataFile;
  const seedFile = resolvedOptions.seedFile || null;
  const defaultData = resolvedOptions.defaultData || DEFAULT_DB;
  let cache = null;
  let saveQueue = Promise.resolve();

  async function init() {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });

    try {
      const raw = await fs.readFile(dataFile, "utf8");
      cache = normalizeDb(JSON.parse(raw));
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }

      cache = await loadSeedState();
      await persist();
    }
  }

  function getState() {
    if (!cache) {
      throw new Error("Store not initialized");
    }

    return cache;
  }

  function publicUser(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return {
      ...safeUser,
      access: normalizeAccess(safeUser.role, safeUser.access),
    };
  }

  async function persist() {
    saveQueue = saveQueue.then(() =>
      fs.writeFile(dataFile, `${JSON.stringify(cache, null, 2)}\n`, "utf8")
    );
    return saveQueue;
  }

  async function reset() {
    cache = await loadSeedState();
    await persist();
    return getPublicState();
  }

  async function loadSeedState() {
    if (seedFile) {
      try {
        const raw = await fs.readFile(seedFile, "utf8");
        return normalizeDb(JSON.parse(raw));
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    }

    return structuredClone(defaultData);
  }

  function getPublicState() {
    const state = getState();
    return {
      project: structuredClone(state.project),
      schedule: structuredClone(state.schedule),
      scenes: structuredClone(state.scenes),
      contacts: structuredClone(state.contacts),
      tasks: structuredClone(state.tasks),
      budget: structuredClone(state.budget),
      assets: structuredClone(state.assets),
      users: state.users.map(publicUser),
      dashboard: buildDashboard(state),
    };
  }

  function getPublicStateForUser(user) {
    const state = getState();
    const filtered = {
      project: canViewModule(user, "project") ? structuredClone(state.project) : {},
      schedule: canViewModule(user, "schedule") ? structuredClone(state.schedule) : [],
      scenes: canViewModule(user, "scenes") ? structuredClone(state.scenes) : [],
      contacts: canViewModule(user, "contacts") ? structuredClone(state.contacts) : [],
      tasks: canViewModule(user, "tasks") ? structuredClone(state.tasks) : [],
      budget: canViewModule(user, "budget") ? structuredClone(state.budget) : [],
      assets: canViewModule(user, "assets") ? structuredClone(state.assets) : [],
      users: canViewModule(user, "team") ? state.users.map(publicUser) : [],
    };

    return {
      ...filtered,
      dashboard: buildDashboard(filtered),
    };
  }

  function authenticate(email, password) {
    const user = getState().users.find((entry) => entry.email === email && entry.password === password);
    return publicUser(user);
  }

  function findUserByEmail(email) {
    return getState().users.find((entry) => entry.email === String(email).toLowerCase());
  }

  function findUserByGoogleSubject(googleSubject) {
    return getState().users.find((entry) => entry.googleSubject && entry.googleSubject === googleSubject);
  }

  function findUserById(id) {
    return publicUser(getState().users.find((entry) => entry.id === id));
  }

  async function createUser(payload) {
    const user = sanitizeUser(payload, createId("user"));
    if (cache.users.some((entry) => entry.email === user.email)) {
      throw new Error("A user with this email already exists.");
    }
    cache.users.push(user);
    await persist();
    return publicUser(user);
  }

  async function updateUser(id, payload) {
    const index = cache.users.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return null;
    }

    const nextUser = sanitizeUser(
      {
        ...cache.users[index],
        ...payload,
        password: payload.password ? payload.password : cache.users[index].password,
        id,
      },
      id
    );

    if (cache.users.some((entry, candidateIndex) => candidateIndex !== index && entry.email === nextUser.email)) {
      throw new Error("A user with this email already exists.");
    }

    cache.users[index] = nextUser;
    await persist();
    return publicUser(nextUser);
  }

  async function deleteUser(id, actorId) {
    const index = cache.users.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return { ok: false, reason: "not-found" };
    }

    if (id === actorId) {
      return { ok: false, reason: "self-delete" };
    }

    const target = cache.users[index];
    const remainingManagers = cache.users.filter(
      (entry) => entry.id !== id && canEditModule(publicUser(entry), "team")
    );

    if (canEditModule(publicUser(target), "team") && remainingManagers.length === 0) {
      return { ok: false, reason: "last-manager" };
    }

    cache.users.splice(index, 1);
    await persist();
    return { ok: true };
  }

  async function linkGoogleIdentity(id, googleSubject) {
    const index = cache.users.findIndex((entry) => entry.id === id);
    if (index === -1) {
      return null;
    }

    cache.users[index] = {
      ...cache.users[index],
      googleSubject,
    };
    await persist();
    return publicUser(cache.users[index]);
  }

  async function updateProject(payload) {
    cache.project = { ...cache.project, ...sanitizeProject(payload) };
    await persist();
    return structuredClone(cache.project);
  }

  async function createItem(collection, payload) {
    const record = sanitizeCollectionItem(collection, payload, createId(collection));
    cache[collection].unshift(record);
    await persist();
    return structuredClone(record);
  }

  async function updateItem(collection, id, payload) {
    const index = cache[collection].findIndex((entry) => entry.id === id);
    if (index === -1) {
      return null;
    }

    cache[collection][index] = sanitizeCollectionItem(
      collection,
      { ...cache[collection][index], ...payload, id },
      id
    );
    await persist();
    return structuredClone(cache[collection][index]);
  }

  async function deleteItem(collection, id) {
    const index = cache[collection].findIndex((entry) => entry.id === id);
    if (index === -1) {
      return false;
    }

    cache[collection].splice(index, 1);
    await persist();
    return true;
  }

  return {
    init,
    getPublicState,
    getPublicStateForUser,
    reset,
    authenticate,
    findUserByEmail,
    findUserByGoogleSubject,
    findUserById,
    updateProject,
    createUser,
    updateUser,
    deleteUser,
    linkGoogleIdentity,
    createItem,
    updateItem,
    deleteItem,
  };
}

function normalizeDb(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  return {
    users: Array.isArray(source.users) && source.users.length
      ? source.users.map((entry) => sanitizeUser(entry, entry.id || createId("user")))
      : structuredClone(DEFAULT_DB.users),
    project: { ...DEFAULT_DB.project, ...(source.project || {}) },
    schedule: Array.isArray(source.schedule) ? source.schedule : structuredClone(DEFAULT_DB.schedule),
    scenes: Array.isArray(source.scenes) ? source.scenes : structuredClone(DEFAULT_DB.scenes),
    contacts: Array.isArray(source.contacts) ? source.contacts : structuredClone(DEFAULT_DB.contacts),
    tasks: Array.isArray(source.tasks) ? source.tasks : structuredClone(DEFAULT_DB.tasks),
    budget: Array.isArray(source.budget) ? source.budget : structuredClone(DEFAULT_DB.budget),
    assets: Array.isArray(source.assets) ? source.assets : structuredClone(DEFAULT_DB.assets),
  };
}

function buildDashboard(state) {
  const estimated = state.budget.reduce((sum, item) => sum + Number(item.estimated || 0), 0);
  const actual = state.budget.reduce((sum, item) => sum + Number(item.actual || 0), 0);
  return {
    stats: [
      { label: "Scenes", value: state.scenes.length, note: "Tracked scene breakdown cards." },
      { label: "Shoot Days", value: state.schedule.length, note: "Scheduled production days." },
      { label: "Open Tasks", value: state.tasks.filter((item) => item.status !== "Done").length, note: "Action items still in flight." },
      { label: "Budget Variance", value: actual - estimated, note: "Actual minus estimated spend." },
    ],
    upcomingDays: state.schedule.slice(0, 4),
    priorityTasks: state.tasks.filter((item) => item.priority === "high" || item.status !== "Done").slice(0, 6),
    latestAssets: state.assets.slice(0, 5),
  };
}

function sanitizeProject(payload) {
  return {
    title: stringValue(payload.title),
    tagline: stringValue(payload.tagline),
    status: stringValue(payload.status),
    startDate: stringValue(payload.startDate),
    wrapDate: stringValue(payload.wrapDate),
    director: stringValue(payload.director),
    producer: stringValue(payload.producer),
    weather: stringValue(payload.weather),
    location: stringValue(payload.location),
    logline: stringValue(payload.logline),
  };
}

function sanitizeUser(payload, id) {
  const role = stringValue(payload.role) || "Viewer";
  const access = normalizeAccess(role, payload.access);
  return {
    id,
    name: stringValue(payload.name),
    email: stringValue(payload.email).toLowerCase(),
    password: stringValue(payload.password) || "demo123",
    googleSubject: stringValue(payload.googleSubject),
    role,
    title: stringValue(payload.title),
    department: stringValue(payload.department),
    access,
  };
}

function sanitizeCollectionItem(collection, payload, id) {
  const base = { id };

  switch (collection) {
    case "schedule":
      return {
        ...base,
        day: stringValue(payload.day),
        date: stringValue(payload.date),
        location: stringValue(payload.location),
        callTime: stringValue(payload.callTime),
        notes: stringValue(payload.notes),
        scenes: normalizeList(payload.scenes),
        status: stringValue(payload.status || "ready"),
      };
    case "scenes":
      return {
        ...base,
        code: stringValue(payload.code),
        title: stringValue(payload.title),
        location: stringValue(payload.location),
        setup: stringValue(payload.setup),
        pages: stringValue(payload.pages),
        cast: stringValue(payload.cast),
        elements: normalizeList(payload.elements),
      };
    case "contacts":
      return {
        ...base,
        name: stringValue(payload.name),
        role: stringValue(payload.role),
        dept: stringValue(payload.dept),
        phone: stringValue(payload.phone),
        email: stringValue(payload.email),
      };
    case "tasks":
      return {
        ...base,
        title: stringValue(payload.title),
        owner: stringValue(payload.owner),
        due: stringValue(payload.due),
        priority: stringValue(payload.priority || "medium"),
        status: stringValue(payload.status || "Not Started"),
      };
    case "budget":
      return {
        ...base,
        category: stringValue(payload.category),
        estimated: numberValue(payload.estimated),
        actual: numberValue(payload.actual),
      };
    case "assets":
      return {
        ...base,
        name: stringValue(payload.name),
        type: stringValue(payload.type),
        owner: stringValue(payload.owner),
        updated: stringValue(payload.updated),
        tag: stringValue(payload.tag),
      };
    default:
      throw new Error(`Unknown collection ${collection}`);
  }
}

function stringValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function createId(collection) {
  return `${collection}-${crypto.randomUUID()}`;
}

function createAccess(level) {
  return Object.fromEntries(MODULE_KEYS.map((key) => [key, level]));
}

function normalizeAccess(role, access) {
  const template = ROLE_TEMPLATES[role] || createAccess("view");
  const source = access && typeof access === "object" ? access : {};
  return Object.fromEntries(
    MODULE_KEYS.map((key) => {
      const value = source[key] || template[key] || "view";
      return [key, value === "edit" ? "edit" : value === "view" ? "view" : "none"];
    })
  );
}

function canViewModule(user, moduleKey) {
  const access = normalizeAccess(user.role, user.access);
  return access[moduleKey] === "view" || access[moduleKey] === "edit";
}

function canEditModule(user, moduleKey) {
  const access = normalizeAccess(user.role, user.access);
  return access[moduleKey] === "edit";
}

function createApp(options = {}) {
  const rootDir = options.rootDir || __dirname;
  const dataFile = options.dataFile || path.join(rootDir, "data", "production-db.local.json");
  const seedFile = options.seedFile || path.join(rootDir, "data", "production-db.json");
  const googleClientId = options.googleClientId || process.env.GOOGLE_CLIENT_ID || "";
  const sessions = new Map();
  const store = createStore({ dataFile, seedFile });

  async function init() {
    await store.init();
  }

  async function handleRequest(request, response) {
    try {
      if (request.url.startsWith("/api/")) {
        await handleApiRequest(request, response);
        return;
      }

      if (request.url === "/config.js") {
        response.writeHead(200, { "Content-Type": "text/javascript; charset=utf-8" });
        response.end(
          `window.frameForgeConfig = ${JSON.stringify({ googleClientId })};`
        );
        return;
      }

      await handleStaticRequest(request, response);
    } catch (error) {
      console.error("[FrameForge API Error]", error);
      response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ error: "Internal server error", detail: error.message }));
    }
  }

  async function handleApiRequest(request, response) {
    const url = new URL(request.url, "http://localhost");
    const pathname = url.pathname;
    const method = request.method;

    if (pathname === "/api/health" && method === "GET") {
      return sendJson(response, 200, { ok: true });
    }

    if (pathname === "/api/auth/login" && method === "POST") {
      const body = await readJsonBody(request);
      const user = store.authenticate(body.email, body.password);
      if (!user) {
        return sendJson(response, 401, { error: "Invalid email or password" });
      }

      const token = crypto.randomUUID();
      sessions.set(token, { userId: user.id, createdAt: Date.now() });
      return sendJson(response, 200, { token, user });
    }

    if (pathname === "/api/auth/google" && method === "POST") {
      if (!googleClientId) {
        return sendJson(response, 503, { error: "Google Sign-In is not configured on this server." });
      }

      const body = await readJsonBody(request);
      if (!body.credential) {
        return sendJson(response, 400, { error: "Missing Google credential." });
      }

      const claims = await verifyGoogleIdToken(body.credential, googleClientId);

      if (!claims.email || claims.email_verified !== true) {
        return sendJson(response, 401, { error: "Google account does not expose a verified email address." });
      }

      let matchedUser = store.findUserByGoogleSubject(claims.sub) || store.findUserByEmail(claims.email);
      if (!matchedUser) {
        return sendJson(response, 403, {
          error: "This Google account is not on the project team yet. Add the user in Team & Access first.",
        });
      }

      if (!matchedUser.googleSubject || matchedUser.googleSubject !== claims.sub) {
        matchedUser = await store.linkGoogleIdentity(matchedUser.id, claims.sub);
      }

      const token = crypto.randomUUID();
      sessions.set(token, { userId: matchedUser.id, createdAt: Date.now() });
      return sendJson(response, 200, { token, user: matchedUser });
    }

    const auth = requireAuth(request);
    if (!auth.ok) {
      return sendJson(response, 401, { error: "Unauthorized" });
    }

    if (pathname === "/api/auth/session" && method === "GET") {
      return sendJson(response, 200, { user: auth.user });
    }

    if (pathname === "/api/auth/logout" && method === "POST") {
      sessions.delete(auth.token);
      return sendJson(response, 200, { ok: true });
    }

    if (pathname === "/api/bootstrap" && method === "GET") {
      return sendJson(response, 200, { user: auth.user, ...store.getPublicStateForUser(auth.user) });
    }

    if (pathname === "/api/project" && method === "PUT") {
      if (!canEditModule(auth.user, "project")) {
        return sendJson(response, 403, { error: "You do not have permission to edit the project." });
      }
      const body = await readJsonBody(request);
      const project = await store.updateProject(body);
      return sendJson(response, 200, { project });
    }

    if (pathname === "/api/admin/reset" && method === "POST") {
      if (!canEditModule(auth.user, "team")) {
        return sendJson(response, 403, { error: "You do not have permission to reset demo data." });
      }
      const data = await store.reset();
      return sendJson(response, 200, { user: auth.user, ...store.getPublicStateForUser(auth.user) });
    }

    if (pathname === "/api/users" && method === "GET") {
      if (!canViewModule(auth.user, "team")) {
        return sendJson(response, 403, { error: "You do not have permission to view the team." });
      }
      return sendJson(response, 200, { items: store.getPublicState().users });
    }

    if (pathname === "/api/users" && method === "POST") {
      if (!canEditModule(auth.user, "team")) {
        return sendJson(response, 403, { error: "You do not have permission to manage team access." });
      }
      const body = await readJsonBody(request);
      const item = await store.createUser(body);
      return sendJson(response, 201, { item });
    }

    const userMatch = pathname.match(/^\/api\/users\/([^/]+)$/);
    if (userMatch) {
      if (!canEditModule(auth.user, "team")) {
        return sendJson(response, 403, { error: "You do not have permission to manage team access." });
      }

      const userId = userMatch[1];
      if (method === "PUT") {
        const body = await readJsonBody(request);
        const item = await store.updateUser(userId, body);
        if (!item) {
          return sendJson(response, 404, { error: "User not found" });
        }
        return sendJson(response, 200, { item });
      }

      if (method === "DELETE") {
        const result = await store.deleteUser(userId, auth.user.id);
        if (!result.ok) {
          const errors = {
            "not-found": "User not found",
            "self-delete": "You cannot delete your own account while logged in.",
            "last-manager": "You cannot remove the last user with team management rights.",
          };
          return sendJson(response, result.reason === "not-found" ? 404 : 400, {
            error: errors[result.reason] || "Unable to delete user",
          });
        }
        return sendJson(response, 200, { ok: true });
      }
    }

    const match = pathname.match(/^\/api\/([a-z]+)(?:\/([^/]+))?$/);
    if (!match) {
      return sendJson(response, 404, { error: "Not found" });
    }

    const [, collection, id] = match;
    if (!COLLECTIONS.has(collection)) {
      return sendJson(response, 404, { error: "Unknown collection" });
    }

    const moduleKey = collection;

    if (!canViewModule(auth.user, moduleKey)) {
      return sendJson(response, 403, { error: "You do not have permission to view this module." });
    }

    if (method === "GET" && !id) {
      return sendJson(response, 200, { items: store.getPublicState()[collection] });
    }

    if (method === "POST" && !id) {
      if (!canEditModule(auth.user, moduleKey)) {
        return sendJson(response, 403, { error: "You do not have permission to edit this module." });
      }
      const body = await readJsonBody(request);
      const item = await store.createItem(collection, body);
      return sendJson(response, 201, { item });
    }

    if (method === "PUT" && id) {
      if (!canEditModule(auth.user, moduleKey)) {
        return sendJson(response, 403, { error: "You do not have permission to edit this module." });
      }
      const body = await readJsonBody(request);
      const item = await store.updateItem(collection, id, body);
      if (!item) {
        return sendJson(response, 404, { error: "Record not found" });
      }

      return sendJson(response, 200, { item });
    }

    if (method === "DELETE" && id) {
      if (!canEditModule(auth.user, moduleKey)) {
        return sendJson(response, 403, { error: "You do not have permission to edit this module." });
      }
      const deleted = await store.deleteItem(collection, id);
      if (!deleted) {
        return sendJson(response, 404, { error: "Record not found" });
      }

      return sendJson(response, 200, { ok: true });
    }

    return sendJson(response, 405, { error: "Method not allowed" });
  }

  async function handleStaticRequest(request, response) {
    const requestPath = request.url === "/" ? "/index.html" : request.url;
    const safePath = path.normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = path.join(rootDir, safePath);

    if (!filePath.startsWith(rootDir)) {
      response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Forbidden");
      return;
    }

    try {
      const data = await fs.readFile(filePath);
      response.writeHead(200, {
        "Content-Type": STATIC_MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
      });
      response.end(data);
    } catch (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end(error.code === "ENOENT" ? "Not found" : "Server error");
    }
  }

  function requireAuth(request) {
    const header = request.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";

    if (!token || !sessions.has(token)) {
      return { ok: false };
    }

    const session = sessions.get(token);
    const user = store.findUserById(session.userId);
    if (!user) {
      sessions.delete(token);
      return { ok: false };
    }

    return { ok: true, token, user };
  }

  return {
    init,
    handleRequest,
    store,
  };
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk.toString("utf8");
      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });

    request.on("end", () => {
      if (!body.trim()) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });

    request.on("error", reject);
  });
}

module.exports = {
  COLLECTIONS,
  MODULE_KEYS,
  ROLE_TEMPLATES,
  DEFAULT_DB,
  canEditModule,
  canViewModule,
  createApp,
  createStore,
  normalizeDb,
  normalizeAccess,
  buildDashboard,
  sanitizeCollectionItem,
  sanitizeUser,
  verifyGoogleIdToken,
};

async function verifyGoogleIdToken(idToken, expectedAudience) {
  const [encodedHeader, encodedPayload, encodedSignature] = String(idToken).split(".");
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error("Malformed Google ID token.");
  }

  const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString("utf8"));
  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));

  const certs = await getGoogleCerts();
  const jwk = certs.get(header.kid);
  if (!jwk) {
    throw new Error("Unknown Google signing key.");
  }

  const key = createPublicKey({ key: jwk, format: "jwk" });
  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();
  const validSignature = verifier.verify(key, Buffer.from(encodedSignature, "base64url"));

  if (!validSignature) {
    throw new Error("Invalid Google token signature.");
  }

  if (payload.aud !== expectedAudience) {
    throw new Error("Google token audience mismatch.");
  }

  if (!GOOGLE_ISSUERS.has(payload.iss)) {
    throw new Error("Google token issuer mismatch.");
  }

  if (!payload.exp || Number(payload.exp) * 1000 <= Date.now()) {
    throw new Error("Google token has expired.");
  }

  return payload;
}

async function getGoogleCerts() {
  if (googleCertCache.expiresAt > Date.now() && googleCertCache.keys.size > 0) {
    return googleCertCache.keys;
  }

  const response = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  if (!response.ok) {
    throw new Error("Unable to fetch Google signing certificates.");
  }

  const body = await response.json();
  const cacheControl = response.headers.get("cache-control") || "";
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch ? Number(maxAgeMatch[1]) : 300;

  googleCertCache = {
    expiresAt: Date.now() + maxAgeSeconds * 1000,
    keys: new Map((body.keys || []).map((key) => [key.kid, key])),
  };

  return googleCertCache.keys;
}
