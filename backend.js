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
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
};

const GOOGLE_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);
let googleCertCache = {
  expiresAt: 0,
  keys: new Map(),
};

const COLLECTIONS = new Set(["schedule", "scenes", "contacts", "tasks", "budget", "assets"]);
const MODULE_KEYS = ["project", "settings", "schedule", "scenes", "callsheet", "contacts", "tasks", "budget", "assets", "team"];
const ROLE_TEMPLATES = {
  Producer: createAccess("edit"),
  Admin: createAccess("edit"),
  Viewer: {
    project: "view",
    settings: "none",
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
    settings: "none",
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
    settings: "none",
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
    location: "Ljubljana Unit + Nordic exteriors",
    locationLabel: "Ljubljana Unit + Nordic exteriors",
    latitude: 0,
    longitude: 0,
    timezone: "Europe/Ljubljana",
    weather: "Weather sync pending",
    weatherUpdatedAt: "",
    sunrise: "",
    sunset: "",
    currency: "EUR",
    logline: "An Arctic investigator hunts a buried conspiracy before the midnight sun reveals the wrong truth.",
  },
  settings: {
    studioName: "FrameForge",
    companyName: "FrameForge Productions",
    locale: "en-GB",
    timezone: "Europe/Ljubljana",
    currency: "EUR",
    defaultBasecamp: "Ljubljana production office",
    emergencyHospital: "University Medical Centre Ljubljana",
    emergencyPhone: "+386 1 522 5050",
    transportNotes: "Unit vans depart 45 minutes before crew call. Confirm seat allocations with the transport captain.",
    parkingNotes: "Crew parking is assigned by department. Keep access lanes clear for tech vehicles and emergency services.",
    callSheetFooter: "All departments check in on arrival, confirm safety briefing attendance, and escalate red flags immediately.",
  },
  callsheet: {
    status: "Draft",
    unit: "Main Unit",
    shootDate: "2026-05-27",
    crewCall: "06:00",
    castCall: "06:30",
    firstShot: "07:15",
    mealBreak: "13:00",
    wrapTime: "19:00",
    locationDetails: "Warehouse Stage B",
    basecamp: "Ljubljana production office",
    sceneCodes: ["24A", "24B", "25"],
    parkingNotes: "Crew parking is assigned by department. Keep access lanes clear for tech vehicles and emergency services.",
    transportNotes: "Unit vans depart 45 minutes before crew call. Confirm seat allocations with the transport captain.",
    hospitalName: "University Medical Centre Ljubljana",
    hospitalPhone: "+386 1 522 5050",
    weatherNotes: "",
    additionalNotes: "Rain FX day. Safety rehearsal at 08:00. Confirm hero prop sign-out with props.",
    distribution: "Heads of department, cast, transport captain, production office",
    footer: "All departments check in on arrival, confirm safety briefing attendance, and escalate red flags immediately.",
    attachedAssetIds: ["asset-1", "asset-2"],
    approvalNotes: "",
    approvedBy: "",
    approvedAt: "",
    publishedAt: "",
    lastEditedBy: "",
    lastEditedAt: "",
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
      status: "Approved",
      version: "v7",
      approvalNotes: "Approved after tech scout walkthrough.",
      approvedBy: "Miles Ortega",
      approvedAt: "2026-05-25T18:20:00.000Z",
      lastEditedBy: "Miles Ortega",
      lastEditedAt: "2026-05-25T18:20:00.000Z",
      fileName: "",
      fileUrl: "",
      mimeType: "",
      sizeBytes: 0,
    },
    {
      id: "asset-2",
      name: "Harbor drone risk assessment",
      type: "DOC",
      owner: "Production",
      updated: "2026-05-24",
      tag: "Safety",
      status: "In review",
      version: "v2",
      approvalNotes: "Awaiting final marine coordinator sign-off.",
      approvedBy: "",
      approvedAt: "",
      lastEditedBy: "Petra Kranjc",
      lastEditedAt: "2026-05-24T14:30:00.000Z",
      fileName: "",
      fileUrl: "",
      mimeType: "",
      sizeBytes: 0,
    },
    {
      id: "asset-3",
      name: "Scene 24A storyboard",
      type: "PNG",
      owner: "Direction",
      updated: "2026-05-26",
      tag: "Creative",
      status: "Draft",
      version: "v3",
      approvalNotes: "",
      approvedBy: "",
      approvedAt: "",
      lastEditedBy: "Nadia Verhoeven",
      lastEditedAt: "2026-05-26T09:00:00.000Z",
      fileName: "",
      fileUrl: "",
      mimeType: "",
      sizeBytes: 0,
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
      settings: structuredClone(state.settings),
      callsheet: structuredClone(state.callsheet),
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
      settings: canViewModule(user, "settings") ? structuredClone(state.settings) : {},
      callsheet: canViewModule(user, "callsheet") ? structuredClone(state.callsheet) : {},
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
    cache.project = sanitizeProject({ ...cache.project, ...payload });
    await persist();
    return structuredClone(cache.project);
  }

  async function updateSettings(payload) {
    cache.settings = sanitizeSettings({ ...cache.settings, ...payload });
    await persist();
    return structuredClone(cache.settings);
  }

  async function updateCallsheet(payload) {
    cache.callsheet = sanitizeCallsheet({ ...cache.callsheet, ...payload });
    await persist();
    return structuredClone(cache.callsheet);
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
    updateSettings,
    updateCallsheet,
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
    project: sanitizeProject({ ...DEFAULT_DB.project, ...(source.project || {}) }),
    settings: sanitizeSettings({ ...DEFAULT_DB.settings, ...(source.settings || {}) }),
    callsheet: sanitizeCallsheet({ ...DEFAULT_DB.callsheet, ...(source.callsheet || {}) }),
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
  const pendingApprovals = state.assets.filter((item) => item.status === "In review").length + (state.callsheet.status === "In review" ? 1 : 0);
  return {
    stats: [
      { label: "Scenes", value: state.scenes.length, note: "Tracked scene breakdown cards." },
      { label: "Shoot Days", value: state.schedule.length, note: "Scheduled production days." },
      { label: "Open Tasks", value: state.tasks.filter((item) => item.status !== "Done").length, note: "Action items still in flight." },
      { label: "Pending approvals", value: pendingApprovals, note: "Docs and call sheets waiting on review." },
    ],
    upcomingDays: state.schedule.slice(0, 4),
    priorityTasks: state.tasks.filter((item) => item.priority === "high" || item.status !== "Done").slice(0, 6),
    latestAssets: state.assets.slice(0, 5),
  };
}

function sanitizeProject(payload) {
  return {
    id: stringValue(payload.id) || DEFAULT_DB.project.id,
    title: stringValue(payload.title),
    tagline: stringValue(payload.tagline),
    status: stringValue(payload.status),
    startDate: stringValue(payload.startDate),
    wrapDate: stringValue(payload.wrapDate),
    director: stringValue(payload.director),
    producer: stringValue(payload.producer),
    weather: stringValue(payload.weather),
    location: stringValue(payload.location),
    locationLabel: stringValue(payload.locationLabel) || stringValue(payload.location),
    latitude: numberValue(payload.latitude),
    longitude: numberValue(payload.longitude),
    timezone: stringValue(payload.timezone),
    weatherUpdatedAt: stringValue(payload.weatherUpdatedAt),
    sunrise: stringValue(payload.sunrise),
    sunset: stringValue(payload.sunset),
    currency: normalizeCurrency(payload.currency),
    logline: stringValue(payload.logline),
  };
}

function sanitizeSettings(payload) {
  return {
    studioName: stringValue(payload.studioName),
    companyName: stringValue(payload.companyName),
    locale: normalizeLocale(payload.locale),
    timezone: stringValue(payload.timezone) || "Europe/Ljubljana",
    currency: normalizeCurrency(payload.currency),
    defaultBasecamp: stringValue(payload.defaultBasecamp),
    emergencyHospital: stringValue(payload.emergencyHospital),
    emergencyPhone: stringValue(payload.emergencyPhone),
    transportNotes: stringValue(payload.transportNotes),
    parkingNotes: stringValue(payload.parkingNotes),
    callSheetFooter: stringValue(payload.callSheetFooter),
  };
}

function sanitizeCallsheet(payload) {
  return {
    status: normalizeCallsheetStatus(payload.status),
    unit: stringValue(payload.unit) || "Main Unit",
    shootDate: stringValue(payload.shootDate),
    crewCall: stringValue(payload.crewCall),
    castCall: stringValue(payload.castCall),
    firstShot: stringValue(payload.firstShot),
    mealBreak: stringValue(payload.mealBreak),
    wrapTime: stringValue(payload.wrapTime),
    locationDetails: stringValue(payload.locationDetails),
    basecamp: stringValue(payload.basecamp),
    sceneCodes: normalizeList(payload.sceneCodes),
    parkingNotes: stringValue(payload.parkingNotes),
    transportNotes: stringValue(payload.transportNotes),
    hospitalName: stringValue(payload.hospitalName),
    hospitalPhone: stringValue(payload.hospitalPhone),
    weatherNotes: stringValue(payload.weatherNotes),
    additionalNotes: stringValue(payload.additionalNotes),
    distribution: stringValue(payload.distribution),
    footer: stringValue(payload.footer),
    attachedAssetIds: normalizeList(payload.attachedAssetIds),
    approvalNotes: stringValue(payload.approvalNotes),
    approvedBy: stringValue(payload.approvedBy),
    approvedAt: stringValue(payload.approvedAt),
    publishedAt: stringValue(payload.publishedAt),
    lastEditedBy: stringValue(payload.lastEditedBy),
    lastEditedAt: stringValue(payload.lastEditedAt),
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
        status: normalizeAssetStatus(payload.status),
        version: stringValue(payload.version),
        approvalNotes: stringValue(payload.approvalNotes),
        approvedBy: stringValue(payload.approvedBy),
        approvedAt: stringValue(payload.approvedAt),
        lastEditedBy: stringValue(payload.lastEditedBy),
        lastEditedAt: stringValue(payload.lastEditedAt),
        fileName: stringValue(payload.fileName),
        fileUrl: stringValue(payload.fileUrl),
        mimeType: stringValue(payload.mimeType),
        sizeBytes: numberValue(payload.sizeBytes),
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

function normalizeCurrency(value) {
  const normalized = String(value || "").trim().toUpperCase();
  return ["EUR", "USD", "GBP"].includes(normalized) ? normalized : "EUR";
}

function normalizeLocale(value) {
  const normalized = String(value || "").trim();
  return ["sl-SI", "en-GB", "en-US"].includes(normalized) ? normalized : "en-GB";
}

function normalizeAssetStatus(value) {
  const normalized = String(value || "").trim();
  return ["Draft", "In review", "Approved", "Archived"].includes(normalized) ? normalized : "Draft";
}

function normalizeCallsheetStatus(value) {
  const normalized = String(value || "").trim();
  return ["Draft", "In review", "Approved", "Published"].includes(normalized) ? normalized : "Draft";
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
  const bootstrapAdminEmails = normalizeEmailList(
    options.bootstrapAdminEmails || process.env.BOOTSTRAP_ADMIN_EMAILS || ""
  );
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
      if (!matchedUser && bootstrapAdminEmails.includes(String(claims.email).toLowerCase())) {
        matchedUser = await store.createUser({
          name: claims.name || claims.email.split("@")[0],
          email: claims.email,
          password: crypto.randomUUID(),
          role: "Producer",
          title: "Producer",
          department: "Production",
          access: createAccess("edit"),
          googleSubject: claims.sub,
        });
      }

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
      const currentProject = store.getPublicState().project;
      const project = await store.updateProject(await deriveProjectContext({ ...currentProject, ...body }));
      return sendJson(response, 200, { project });
    }

    if (pathname === "/api/project/refresh-context" && method === "POST") {
      if (!canEditModule(auth.user, "project")) {
        return sendJson(response, 403, { error: "You do not have permission to refresh project context." });
      }
      const currentProject = store.getPublicState().project;
      const project = await store.updateProject(await deriveProjectContext(currentProject));
      return sendJson(response, 200, { project });
    }

    if (pathname === "/api/settings" && method === "PUT") {
      if (!canEditModule(auth.user, "settings")) {
        return sendJson(response, 403, { error: "You do not have permission to edit global settings." });
      }
      const body = await readJsonBody(request);
      const settings = await store.updateSettings(body);
      return sendJson(response, 200, { settings });
    }

    if (pathname === "/api/callsheet" && method === "PUT") {
      if (!canEditModule(auth.user, "callsheet")) {
        return sendJson(response, 403, { error: "You do not have permission to edit the call sheet." });
      }
      const body = await readJsonBody(request);
      const current = store.getPublicState().callsheet;
      const callsheet = await store.updateCallsheet(applyCallsheetWorkflow(current, body, auth.user));
      return sendJson(response, 200, { callsheet });
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
      const payload = collection === "assets"
        ? applyAssetWorkflow(null, await persistAssetUpload(rootDir, body), auth.user)
        : body;
      const item = await store.createItem(collection, payload);
      return sendJson(response, 201, { item });
    }

    if (method === "PUT" && id) {
      if (!canEditModule(auth.user, moduleKey)) {
        return sendJson(response, 403, { error: "You do not have permission to edit this module." });
      }
      const body = await readJsonBody(request);
      const existing = collection === "assets"
        ? store.getPublicState()[collection].find((entry) => entry.id === id) || null
        : null;
      const payload = collection === "assets"
        ? applyAssetWorkflow(existing, await persistAssetUpload(rootDir, body, id, existing), auth.user)
        : body;
      const item = await store.updateItem(collection, id, payload);
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

function normalizeEmailList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim().toLowerCase()).filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

async function deriveProjectContext(project) {
  const locationQuery = stringValue(project.location);
  if (!locationQuery) {
    return {
      ...project,
      locationLabel: "",
      latitude: 0,
      longitude: 0,
      timezone: "",
      weather: "",
      weatherUpdatedAt: "",
      sunrise: "",
      sunset: "",
    };
  }

  const geo = await geocodeLocation(locationQuery);
  if (!geo) {
    throw new Error(`Unable to resolve the project location "${locationQuery}".`);
  }

  const forecast = await fetchWeatherContext(geo.latitude, geo.longitude, geo.timezone);

  return {
    ...project,
    locationLabel: formatResolvedLocation(geo),
    latitude: geo.latitude,
    longitude: geo.longitude,
    timezone: geo.timezone || stringValue(project.timezone),
    weather: formatWeatherSummary(forecast.current),
    weatherUpdatedAt: forecast.current?.time || "",
    sunrise: forecast.daily?.sunrise?.[0] || "",
    sunset: forecast.daily?.sunset?.[0] || "",
  };
}

async function geocodeLocation(query) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed with status ${response.status}.`);
  }

  const payload = await response.json();
  return payload.results?.[0] || null;
}

async function fetchWeatherContext(latitude, longitude, timezone) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("timezone", timezone || "auto");
  url.searchParams.set("current", "temperature_2m,apparent_temperature,weather_code,wind_speed_10m");
  url.searchParams.set("daily", "sunrise,sunset");
  url.searchParams.set("forecast_days", "1");
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("wind_speed_unit", "kmh");

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Weather forecast failed with status ${response.status}.`);
  }

  return response.json();
}

function formatResolvedLocation(geo) {
  return [geo.name, geo.admin1, geo.country].filter(Boolean).join(", ");
}

function formatWeatherSummary(current) {
  if (!current) {
    return "Weather unavailable";
  }

  const temperature = Number.isFinite(Number(current.temperature_2m))
    ? `${Math.round(Number(current.temperature_2m))}°C`
    : "—";
  const condition = weatherCodeLabel(current.weather_code);
  const wind = Number.isFinite(Number(current.wind_speed_10m))
    ? `wind ${Math.round(Number(current.wind_speed_10m))} km/h`
    : "";

  return [temperature, condition, wind].filter(Boolean).join(" · ");
}

function weatherCodeLabel(code) {
  const numericCode = Number(code);
  const labels = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Heavy freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Rain showers",
    81: "Heavy rain showers",
    82: "Violent rain showers",
    85: "Snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm with hail",
  };

  return labels[numericCode] || "Weather update";
}

async function persistAssetUpload(rootDir, payload, assetId = createId("asset"), existing = null) {
  const nextPayload = { ...payload };
  const fileContentBase64 = stringValue(payload.fileContentBase64);
  const fileName = stringValue(payload.fileName);
  const mimeType = stringValue(payload.mimeType);

  if (!fileContentBase64 || !fileName) {
    return {
      ...nextPayload,
      fileName: fileName || existing?.fileName || "",
      fileUrl: stringValue(payload.fileUrl) || existing?.fileUrl || "",
      mimeType: mimeType || existing?.mimeType || "",
      sizeBytes: numberValue(payload.sizeBytes) || existing?.sizeBytes || 0,
    };
  }

  const uploadsDir = path.join(rootDir, "uploads", "assets");
  await fs.mkdir(uploadsDir, { recursive: true });

  const extension = sanitizeFileExtension(fileName, mimeType);
  const safeBaseName = slugify(path.basename(fileName, path.extname(fileName)) || nextPayload.name || assetId);
  const storedFileName = `${assetId}-${safeBaseName}${extension}`;
  const absolutePath = path.join(uploadsDir, storedFileName);
  const fileBuffer = Buffer.from(fileContentBase64, "base64");

  await fs.writeFile(absolutePath, fileBuffer);

  return {
    ...nextPayload,
    fileName,
    fileUrl: `/uploads/assets/${storedFileName}`,
    mimeType: mimeType || mimeFromExtension(extension),
    sizeBytes: fileBuffer.byteLength,
    updated: stringValue(nextPayload.updated) || new Date().toISOString().slice(0, 10),
  };
}

function sanitizeFileExtension(fileName, mimeType) {
  const fromName = path.extname(fileName || "").toLowerCase();
  if (fromName) {
    return fromName;
  }

  const mimeMap = {
    "application/pdf": ".pdf",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "text/plain": ".txt",
  };

  return mimeMap[mimeType] || "";
}

function mimeFromExtension(extension) {
  return STATIC_MIME_TYPES[extension] || "application/octet-stream";
}

function applyAssetWorkflow(existing, payload, user) {
  const now = new Date().toISOString();
  const previous = existing || {};
  const nextStatus = normalizeAssetStatus(payload.status || previous.status);
  const next = {
    ...previous,
    ...payload,
    status: nextStatus,
    lastEditedBy: user.name,
    lastEditedAt: now,
  };

  if (nextStatus === "Approved") {
    next.approvedBy = user.name;
    next.approvedAt = now;
  }

  if (nextStatus === "Draft" || nextStatus === "In review") {
    next.approvedBy = previous.approvedBy || "";
    next.approvedAt = previous.approvedAt || "";
  }

  return next;
}

function applyCallsheetWorkflow(existing, payload, user) {
  const now = new Date().toISOString();
  const previous = existing || {};
  const nextStatus = normalizeCallsheetStatus(payload.status || previous.status);
  const next = {
    ...previous,
    ...payload,
    status: nextStatus,
    lastEditedBy: user.name,
    lastEditedAt: now,
  };

  if (nextStatus === "Approved" || nextStatus === "Published") {
    next.approvedBy = user.name;
    next.approvedAt = now;
  }

  if (nextStatus === "Published") {
    next.publishedAt = now;
  } else {
    next.publishedAt = previous.publishedAt || "";
  }

  return next;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
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
  normalizeEmailList,
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
