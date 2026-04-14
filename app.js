const API_BASE = "/api";
const TOKEN_KEY = "frameforge-token";
const runtimeConfig = window.frameForgeConfig || {};

const navItems = [
  ["dashboard", "Dashboard"],
  ["project", "Project"],
  ["callsheets", "Call Sheets"],
  ["assets", "Assets"],
  ["settings", "Settings"],
  ["team", "Team"],
];

const state = {
  token: localStorage.getItem(TOKEN_KEY) || "",
  user: null,
  data: null,
  view: "dashboard",
  flash: "",
  flashType: "info",
  loading: false,
  selectedCallsheetId: "",
  selectedAssetId: "",
  search: "",
};

function canAccess(moduleKey, mode = "view") {
  const level = state.user?.permissions?.[moduleKey];
  if (!level || level === "none") return false;
  if (mode === "edit") return level === "edit";
  return true;
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }
  return payload;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatMoney(value) {
  return new Intl.NumberFormat(state.data?.settings?.locale || "sl-SI", {
    style: "currency",
    currency: state.data?.settings?.currency || "EUR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "TBD";
  try {
    return new Intl.DateTimeFormat(state.data?.settings?.locale || "sl-SI", {
      dateStyle: "medium",
      timeZone: state.data?.settings?.timezone || "Europe/Ljubljana",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function showFlash(message, type = "info") {
  state.flash = message;
  state.flashType = type;
  render();
}

async function bootstrap() {
  if (!state.token) {
    render();
    return;
  }
  try {
    const payload = await api("/bootstrap", { method: "GET" });
    state.user = payload.user;
    state.data = payload.data;
    state.selectedCallsheetId ||= payload.data.callsheets?.[0]?.id || "";
    state.selectedAssetId ||= payload.data.assets?.[0]?.id || "";
  } catch (error) {
    localStorage.removeItem(TOKEN_KEY);
    state.token = "";
    state.user = null;
    state.data = null;
    showFlash(error.message, "error");
  }
  render();
}

function setToken(token) {
  state.token = token;
  localStorage.setItem(TOKEN_KEY, token);
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  state.token = "";
  state.user = null;
  state.data = null;
  state.view = "dashboard";
  render();
}

function findSelectedCallsheet() {
  return state.data?.callsheets?.find((sheet) => sheet.id === state.selectedCallsheetId) || state.data?.callsheets?.[0] || null;
}

function findSelectedAsset() {
  return state.data?.assets?.find((asset) => asset.id === state.selectedAssetId) || state.data?.assets?.[0] || null;
}

function getSearchResults() {
  const query = state.search.trim().toLowerCase();
  if (!query || !state.data) return [];
  const rows = [];
  rows.push({
    module: "project",
    title: state.data.project.title,
    meta: "Project",
    onClick: () => {
      state.view = "project";
      state.search = "";
      render();
    },
  });
  for (const sheet of state.data.callsheets) {
    if (`${sheet.title} ${sheet.location} ${sheet.shootDate}`.toLowerCase().includes(query)) {
      rows.push({
        module: "callsheets",
        title: sheet.title,
        meta: `Call sheet · ${sheet.shootDate || "No date"}`,
        onClick: () => {
          state.view = "callsheets";
          state.selectedCallsheetId = sheet.id;
          state.search = "";
          render();
        },
      });
    }
  }
  for (const asset of state.data.assets) {
    if (`${asset.title} ${asset.category} ${asset.fileName}`.toLowerCase().includes(query)) {
      rows.push({
        module: "assets",
        title: asset.title,
        meta: `Asset · ${asset.category}`,
        onClick: () => {
          state.view = "assets";
          state.selectedAssetId = asset.id;
          state.search = "";
          render();
        },
      });
    }
  }
  for (const user of state.data.users) {
    if (`${user.name} ${user.email} ${user.role}`.toLowerCase().includes(query)) {
      rows.push({
        module: "team",
        title: user.name,
        meta: `Team · ${user.role}`,
        onClick: () => {
          state.view = "team";
          state.search = "";
          render();
        },
      });
    }
  }
  return rows.slice(0, 8);
}

function renderLogin() {
  return `
    <section class="login-shell">
      <div class="login-brand">
        <div class="brand-mark">FF</div>
        <div>
          <p class="eyebrow">Fresh foundation</p>
          <h1>FrameForge</h1>
          <p class="lede">New clean baseline for production planning, call sheets, documents, and team access.</p>
        </div>
      </div>
      <div class="login-card">
        <h2>Sign in</h2>
        <p class="muted">Use Google if your email is invited, or fall back to local producer login while we build out the new stack.</p>
        <form id="login-form" class="stack-md">
          <input name="email" type="email" placeholder="Email" value="producer@frameforge.app" required />
          <input name="password" type="password" placeholder="Password" value="demo123" required />
          <button class="btn btn-primary" type="submit">Sign in with email</button>
        </form>
        ${
          runtimeConfig.googleClientId
            ? `<div class="stack-sm">
                <div id="google-button"></div>
              </div>`
            : `<div class="notice">Google login is disabled until <code>GOOGLE_CLIENT_ID</code> is configured.</div>`
        }
      </div>
    </section>
  `;
}

function renderSidebar() {
  const items = navItems
    .filter(([key]) => canAccess(key, "view"))
    .map(
      ([key, label]) => `
        <button class="nav-item ${state.view === key ? "active" : ""}" data-nav="${key}">
          <span>${label}</span>
        </button>
      `
    )
    .join("");
  return `
    <aside class="sidebar">
      <div class="sidebar-top">
        <div class="brand-lockup">
          <div class="brand-mark">FF</div>
          <div>
            <strong>${escapeHtml(state.data.settings.studioName)}</strong>
            <p>${escapeHtml(state.data.project.title)}</p>
          </div>
        </div>
        <div class="sidebar-card">
          <span class="eyebrow">Shoot window</span>
          <h3>${escapeHtml(state.data.project.stage)}</h3>
          <p>${escapeHtml(state.data.project.location || state.data.settings.weatherLocation)}</p>
          <div class="meta-grid">
            <div><span>Start</span><strong>${escapeHtml(state.data.project.shootStart || "TBD")}</strong></div>
            <div><span>End</span><strong>${escapeHtml(state.data.project.shootEnd || "TBD")}</strong></div>
          </div>
        </div>
      </div>
      <nav class="nav-list">${items}</nav>
      <div class="user-chip">
        <strong>${escapeHtml(state.user.name)}</strong>
        <span>${escapeHtml(state.user.email)}</span>
        <button class="text-link" data-action="logout">Log out</button>
      </div>
    </aside>
  `;
}

function renderTopbar() {
  const searchResults = getSearchResults();
  return `
    <header class="topbar">
      <div>
        <p class="eyebrow">Film production suite</p>
        <h1>${escapeHtml(navItems.find(([key]) => key === state.view)?.[1] || "Dashboard")}</h1>
      </div>
      <div class="topbar-actions">
        <div class="search-shell">
          <input id="global-search" type="search" value="${escapeHtml(state.search)}" placeholder="Search call sheets, assets, team..." />
          ${
            searchResults.length
              ? `<div class="search-results">
                  ${searchResults
                    .map(
                      (item, index) => `
                        <button class="search-result" data-search-index="${index}">
                          <strong>${escapeHtml(item.title)}</strong>
                          <span>${escapeHtml(item.meta)}</span>
                        </button>
                      `
                    )
                    .join("")}
                </div>`
              : ""
          }
        </div>
        <button class="btn btn-primary" data-nav="callsheets">Call sheets</button>
      </div>
    </header>
  `;
}

function renderDashboard() {
  const nextSheet = state.data.callsheets[0];
  const nextForecast = nextSheet?.forecast;
  return `
    <section class="dashboard-grid">
      <article class="panel hero-panel">
        <span class="eyebrow">Production health</span>
        <h2>${escapeHtml(state.data.project.title)}</h2>
        <p>${escapeHtml(state.data.project.description || "Start with project settings, then plan your shooting days and document packet.")}</p>
        <div class="metric-row">
          <div><span>Call sheets</span><strong>${state.data.callsheets.length}</strong></div>
          <div><span>Documents</span><strong>${state.data.assets.length}</strong></div>
          <div><span>Team</span><strong>${state.data.users.length}</strong></div>
        </div>
      </article>
      <article class="panel">
        <h3>Weather sync</h3>
        <p class="muted">${escapeHtml(state.data.settings.weatherLocation)}</p>
        <p class="weather-big">${escapeHtml(nextForecast?.summary || "No forecast synced yet")}</p>
        <p class="muted">${nextForecast ? `${nextForecast.min}° / ${nextForecast.max}°` : "Run weather sync in Project."}</p>
      </article>
      <article class="panel">
        <h3>Next call sheet</h3>
        ${
          nextSheet
            ? `<strong>${escapeHtml(nextSheet.title)}</strong>
               <p class="muted">${escapeHtml(nextSheet.shootDate || "No date")} · ${escapeHtml(nextSheet.location || "No location")}</p>
               <p>${escapeHtml(nextSheet.notes || "No notes yet.")}</p>`
            : `<p class="muted">Create your first call sheet to start planning daily packets.</p>`
        }
      </article>
    </section>
  `;
}

function renderProject() {
  const settings = state.data.settings;
  const forecastCards = settings.forecastDays
    .slice(0, 6)
    .map(
      (day) => `
        <article class="forecast-card">
          <strong>${escapeHtml(day.date)}</strong>
          <span>${escapeHtml(day.summary)}</span>
          <small>${day.min}° / ${day.max}°</small>
        </article>
      `
    )
    .join("");
  return `
    <div class="content-grid two-col">
      <section class="panel">
        <h3>Project info</h3>
        <form id="project-form" class="form-grid">
          <input name="title" placeholder="Production title" value="${escapeHtml(state.data.project.title)}" ${canAccess("project", "edit") ? "" : "disabled"} />
          <input name="format" placeholder="Format" value="${escapeHtml(state.data.project.format)}" ${canAccess("project", "edit") ? "" : "disabled"} />
          <input name="stage" placeholder="Stage" value="${escapeHtml(state.data.project.stage)}" ${canAccess("project", "edit") ? "" : "disabled"} />
          <input name="location" placeholder="Primary shoot location" value="${escapeHtml(state.data.project.location)}" ${canAccess("project", "edit") ? "" : "disabled"} />
          <input name="shootStart" type="date" value="${escapeHtml(state.data.project.shootStart)}" ${canAccess("project", "edit") ? "" : "disabled"} />
          <input name="shootEnd" type="date" value="${escapeHtml(state.data.project.shootEnd)}" ${canAccess("project", "edit") ? "" : "disabled"} />
          <textarea name="description" placeholder="Short production brief" ${canAccess("project", "edit") ? "" : "disabled"}>${escapeHtml(state.data.project.description)}</textarea>
          ${
            canAccess("project", "edit")
              ? `<div class="form-actions">
                  <button class="btn btn-primary" type="submit">Save project</button>
                  <button class="btn" type="button" data-action="sync-weather">Refresh weather</button>
                </div>`
              : ""
          }
        </form>
      </section>
      <section class="panel">
        <h3>Forecast preview</h3>
        <p class="muted">${escapeHtml(settings.weatherLocation)} · ${escapeHtml(settings.weatherUpdatedAt ? `Updated ${formatDate(settings.weatherUpdatedAt)}` : "Not synced yet")}</p>
        <div class="forecast-grid">${forecastCards || `<p class="muted">No forecast data yet.</p>`}</div>
      </section>
    </div>
  `;
}

function renderCallsheets() {
  const selected = findSelectedCallsheet();
  const list = state.data.callsheets
    .map(
      (sheet) => `
        <button class="list-row ${selected?.id === sheet.id ? "active" : ""}" data-callsheet="${sheet.id}">
          <strong>${escapeHtml(sheet.title)}</strong>
          <span>${escapeHtml(sheet.shootDate || "No date")} · ${escapeHtml(sheet.status)}</span>
        </button>
      `
    )
    .join("");
  const forecast = selected?.forecast;
  return `
    <div class="content-grid call-sheet-layout">
      <section class="panel list-panel">
        <div class="panel-head">
          <h3>Daily packets</h3>
          ${canAccess("callsheets", "edit") ? `<button class="btn btn-primary" data-action="new-callsheet">New call sheet</button>` : ""}
        </div>
        <div class="list-stack">${list || `<p class="muted">No call sheets yet.</p>`}</div>
      </section>
      <section class="panel">
        ${
          selected
            ? `
              <form id="callsheet-form" class="form-grid">
                <input type="hidden" name="id" value="${escapeHtml(selected.id)}" />
                <input name="title" placeholder="Title" value="${escapeHtml(selected.title)}" ${canAccess("callsheets", "edit") ? "" : "disabled"} />
                <input name="shootDate" type="date" value="${escapeHtml(selected.shootDate)}" ${canAccess("callsheets", "edit") ? "" : "disabled"} />
                <input name="location" placeholder="Shoot location" value="${escapeHtml(selected.location)}" ${canAccess("callsheets", "edit") ? "" : "disabled"} />
                <input name="unit" placeholder="Unit" value="${escapeHtml(selected.unit)}" ${canAccess("callsheets", "edit") ? "" : "disabled"} />
                <input name="crewCall" type="time" value="${escapeHtml(selected.crewCall)}" ${canAccess("callsheets", "edit") ? "" : "disabled"} />
                <input name="firstShot" type="time" value="${escapeHtml(selected.firstShot)}" ${canAccess("callsheets", "edit") ? "" : "disabled"} />
                <input name="wrapTime" type="time" value="${escapeHtml(selected.wrapTime)}" ${canAccess("callsheets", "edit") ? "" : "disabled"} />
                <select name="status" ${canAccess("callsheets", "edit") ? "" : "disabled"}>
                  ${["Draft", "Ready", "Published"]
                    .map((status) => `<option value="${status}" ${selected.status === status ? "selected" : ""}>${status}</option>`)
                    .join("")}
                </select>
                <textarea name="notes" placeholder="Daily notes" ${canAccess("callsheets", "edit") ? "" : "disabled"}>${escapeHtml(selected.notes)}</textarea>
                ${
                  canAccess("callsheets", "edit")
                    ? `<div class="form-actions">
                        <button class="btn btn-primary" type="submit">Save call sheet</button>
                        <button class="btn btn-danger" type="button" data-action="delete-callsheet" data-id="${escapeHtml(selected.id)}">Delete</button>
                      </div>`
                    : ""
                }
              </form>
              <div class="callout">
                <h4>Forecast for shoot day</h4>
                ${
                  forecast
                    ? `<p><strong>${escapeHtml(forecast.summary)}</strong> · ${forecast.min}° / ${forecast.max}°</p>
                       <p class="muted">Sunrise ${escapeHtml(forecast.sunrise || "TBD")} · Sunset ${escapeHtml(forecast.sunset || "TBD")}</p>`
                    : `<p class="muted">No forecast matched this shooting date yet. Sync weather in Project after setting the location.</p>`
                }
              </div>
            `
            : `<p class="muted">Select or create a call sheet.</p>`
        }
      </section>
    </div>
  `;
}

function renderAssets() {
  const selected = findSelectedAsset();
  const list = state.data.assets
    .map(
      (asset) => `
        <button class="list-row ${selected?.id === asset.id ? "active" : ""}" data-asset="${asset.id}">
          <strong>${escapeHtml(asset.title)}</strong>
          <span>${escapeHtml(asset.category)} · ${escapeHtml(asset.fileName)}</span>
        </button>
      `
    )
    .join("");
  const preview = (() => {
    if (!selected) return `<p class="muted">Upload your first document to preview it here.</p>`;
    if (selected.mimeType === "application/pdf") {
      return `<iframe class="asset-frame" src="${escapeHtml(selected.fileUrl)}"></iframe>`;
    }
    if (selected.mimeType.startsWith("image/")) {
      return `<img class="asset-image" src="${escapeHtml(selected.fileUrl)}" alt="${escapeHtml(selected.title)}" />`;
    }
    return `<a class="btn btn-primary" href="${escapeHtml(selected.fileUrl)}" target="_blank" rel="noreferrer">Open document</a>`;
  })();
  return `
    <div class="content-grid asset-layout">
      <section class="panel list-panel">
        <h3>Document library</h3>
        <div class="list-stack">${list || `<p class="muted">No documents uploaded yet.</p>`}</div>
      </section>
      <section class="panel">
        <div class="panel-head">
          <div>
            <h3>${escapeHtml(selected?.title || "Preview")}</h3>
            <p class="muted">${escapeHtml(selected?.fileName || "Upload a file to start.")}</p>
          </div>
          ${
            selected && canAccess("assets", "edit")
              ? `<button class="btn btn-danger" data-action="delete-asset" data-id="${escapeHtml(selected.id)}">Delete</button>`
              : ""
          }
        </div>
        <div class="asset-preview">${preview}</div>
        ${
          canAccess("assets", "edit")
            ? `<form id="asset-form" class="form-grid stack-top">
                <input name="title" placeholder="Document title" required />
                <input name="category" placeholder="Category" value="Call Sheet" />
                <input name="file" type="file" accept=".pdf,image/*" required />
                <button class="btn btn-primary" type="submit">Upload document</button>
              </form>`
            : ""
        }
      </section>
    </div>
  `;
}

function renderSettings() {
  return `
    <section class="panel">
      <h3>Global settings</h3>
      <form id="settings-form" class="form-grid">
        <input name="studioName" placeholder="Studio name" value="${escapeHtml(state.data.settings.studioName)}" ${canAccess("settings", "edit") ? "" : "disabled"} />
        <input name="companyName" placeholder="Company name" value="${escapeHtml(state.data.settings.companyName)}" ${canAccess("settings", "edit") ? "" : "disabled"} />
        <input name="locale" placeholder="Locale" value="${escapeHtml(state.data.settings.locale)}" ${canAccess("settings", "edit") ? "" : "disabled"} />
        <input name="currency" placeholder="Currency" value="${escapeHtml(state.data.settings.currency)}" ${canAccess("settings", "edit") ? "" : "disabled"} />
        <input name="timezone" placeholder="Timezone" value="${escapeHtml(state.data.settings.timezone)}" ${canAccess("settings", "edit") ? "" : "disabled"} />
        <input name="weatherLocation" placeholder="Default weather location" value="${escapeHtml(state.data.settings.weatherLocation)}" ${canAccess("settings", "edit") ? "" : "disabled"} />
        ${canAccess("settings", "edit") ? `<div class="form-actions"><button class="btn btn-primary" type="submit">Save settings</button></div>` : ""}
      </form>
    </section>
  `;
}

function renderTeam() {
  const rows = state.data.users
    .map(
      (user) => `
        <tr>
          <td>${escapeHtml(user.name)}</td>
          <td>${escapeHtml(user.email)}</td>
          <td>${escapeHtml(user.role)}</td>
          <td>${Object.entries(user.permissions)
            .filter(([, value]) => value !== "none")
            .map(([key, value]) => `${key}:${value}`)
            .join(", ")}</td>
        </tr>
      `
    )
    .join("");
  return `
    <div class="content-grid two-col">
      <section class="panel">
        <h3>Team</h3>
        <table class="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Access</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
      <section class="panel">
        <h3>Add member</h3>
        ${
          canAccess("team", "edit")
            ? `<form id="team-form" class="form-grid">
                <input name="name" placeholder="Full name" required />
                <input name="email" type="email" placeholder="Email" required />
                <select name="role">
                  <option value="viewer">Viewer</option>
                  <option value="coordinator">Coordinator</option>
                  <option value="admin">Admin</option>
                </select>
                <input name="password" type="text" placeholder="Local password (optional)" />
                <button class="btn btn-primary" type="submit">Invite member</button>
              </form>`
            : `<p class="muted">You have view-only access to team settings.</p>`
        }
      </section>
    </div>
  `;
}

function renderCurrentView() {
  if (state.view === "project") return renderProject();
  if (state.view === "callsheets") return renderCallsheets();
  if (state.view === "assets") return renderAssets();
  if (state.view === "settings") return renderSettings();
  if (state.view === "team") return renderTeam();
  return renderDashboard();
}

function renderApp() {
  return `
    <div class="app-shell">
      ${renderSidebar()}
      <main class="main-shell">
        ${renderTopbar()}
        ${state.flash ? `<div class="flash ${state.flashType}">${escapeHtml(state.flash)}</div>` : ""}
        ${renderCurrentView()}
      </main>
    </div>
  `;
}

function render() {
  const app = document.getElementById("app");
  app.innerHTML = state.user && state.data ? renderApp() : renderLogin();

  if (!state.user && runtimeConfig.googleClientId && window.google?.accounts?.id) {
    window.google.accounts.id.initialize({
      client_id: runtimeConfig.googleClientId,
      callback: async (response) => {
        try {
          const session = await api("/auth/google", {
            method: "POST",
            body: JSON.stringify({ credential: response.credential }),
          });
          setToken(session.token);
          await bootstrap();
          showFlash("Signed in with Google.", "success");
        } catch (error) {
          showFlash(error.message, "error");
        }
      },
    });
    window.google.accounts.id.renderButton(document.getElementById("google-button"), {
      theme: "outline",
      size: "large",
      width: "320",
    });
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    const session = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    setToken(session.token);
    await bootstrap();
    showFlash("Signed in.", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
}

async function handleProjectSave(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    await api("/project", {
      method: "PUT",
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    await bootstrap();
    showFlash("Project saved.", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
}

async function handleSettingsSave(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    await api("/settings", {
      method: "PUT",
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    await bootstrap();
    showFlash("Settings saved.", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
}

async function handleCallsheetSave(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = Object.fromEntries(form.entries());
  try {
    await api(`/callsheets/${payload.id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    await bootstrap();
    state.selectedCallsheetId = payload.id;
    showFlash("Call sheet saved.", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
}

async function handleCallsheetCreate() {
  try {
    const created = await api("/callsheets", {
      method: "POST",
      body: JSON.stringify({
        title: `Shoot Day ${state.data.callsheets.length + 1}`,
        shootDate: state.data.project.shootStart || "",
        location: state.data.project.location || state.data.settings.weatherLocation,
      }),
    });
    await bootstrap();
    state.view = "callsheets";
    state.selectedCallsheetId = created.id;
    showFlash("New call sheet created.", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
}

async function handleDeleteCallsheet(id) {
  if (!window.confirm("Delete this call sheet?")) return;
  try {
    await api(`/callsheets/${id}`, { method: "DELETE" });
    await bootstrap();
    state.selectedCallsheetId = state.data.callsheets?.[0]?.id || "";
    showFlash("Call sheet deleted.", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
}

async function handleWeatherSync() {
  try {
    const result = await api("/project/weather-sync", { method: "POST", body: JSON.stringify({}) });
    await bootstrap();
    showFlash(result.warning || "Weather synced.", result.warning ? "warning" : "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
}

async function fileToBase64(file) {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function handleAssetUpload(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const file = form.get("file");
  if (!(file instanceof File) || !file.size) {
    showFlash("Choose a file first.", "warning");
    return;
  }
  try {
    const asset = await api("/assets/upload", {
      method: "POST",
      body: JSON.stringify({
        title: form.get("title"),
        category: form.get("category"),
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        contentBase64: await fileToBase64(file),
      }),
    });
    await bootstrap();
    state.selectedAssetId = asset.id;
    showFlash("Document uploaded.", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
}

async function handleDeleteAsset(id) {
  if (!window.confirm("Delete this document?")) return;
  try {
    await api(`/assets/${id}`, { method: "DELETE" });
    await bootstrap();
    state.selectedAssetId = state.data.assets?.[0]?.id || "";
    showFlash("Document deleted.", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
}

async function handleTeamAdd(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const role = String(form.get("role"));
  const defaultLevel = role === "viewer" ? "view" : "edit";
  try {
    await api("/team", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        role,
        password: form.get("password"),
        permissions: Object.fromEntries(navItems.map(([key]) => [key, defaultLevel])),
      }),
    });
    await bootstrap();
    showFlash("Team member added.", "success");
  } catch (error) {
    showFlash(error.message, "error");
  }
}

document.addEventListener("submit", (event) => {
  if (event.target.matches("#login-form")) return handleLogin(event);
  if (event.target.matches("#project-form")) return handleProjectSave(event);
  if (event.target.matches("#settings-form")) return handleSettingsSave(event);
  if (event.target.matches("#callsheet-form")) return handleCallsheetSave(event);
  if (event.target.matches("#asset-form")) return handleAssetUpload(event);
  if (event.target.matches("#team-form")) return handleTeamAdd(event);
});

document.addEventListener("input", (event) => {
  if (event.target.id === "global-search") {
    state.search = event.target.value;
    render();
  }
});

document.addEventListener("click", async (event) => {
  const nav = event.target.closest("[data-nav]")?.dataset.nav;
  if (nav) {
    state.view = nav;
    render();
    return;
  }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "logout") return logout();
  if (action === "sync-weather") return handleWeatherSync();
  if (action === "new-callsheet") return handleCallsheetCreate();
  if (action === "delete-callsheet") return handleDeleteCallsheet(event.target.closest("[data-action]").dataset.id);
  if (action === "delete-asset") return handleDeleteAsset(event.target.closest("[data-action]").dataset.id);

  const callsheetId = event.target.closest("[data-callsheet]")?.dataset.callsheet;
  if (callsheetId) {
    state.selectedCallsheetId = callsheetId;
    render();
    return;
  }
  const assetId = event.target.closest("[data-asset]")?.dataset.asset;
  if (assetId) {
    state.selectedAssetId = assetId;
    render();
    return;
  }
  const searchIndex = event.target.closest("[data-search-index]")?.dataset.searchIndex;
  if (searchIndex !== undefined) {
    const item = getSearchResults()[Number(searchIndex)];
    item?.onClick();
  }
});

bootstrap();
