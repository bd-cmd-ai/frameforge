const API_BASE = "/api";
const TOKEN_KEY = "frameforge-api-token";
const runtimeConfig = window.frameForgeConfig || {};

const navItems = [
  ["overview", "Overview"],
  ["project", "Project"],
  ["settings", "Global Settings"],
  ["team", "Team & Access"],
  ["schedule", "Schedule"],
  ["breakdown", "Breakdown"],
  ["callsheet", "Call Sheet"],
  ["contacts", "Contacts"],
  ["tasks", "Tasks"],
  ["budget", "Budget"],
  ["assets", "Assets"],
];

const collectionLabels = {
  schedule: "shoot day",
  scenes: "scene",
  contacts: "contact",
  tasks: "task",
  budget: "budget line",
  assets: "asset",
  users: "team member",
};

const permissionModules = [
  ["project", "Project"],
  ["settings", "Global Settings"],
  ["schedule", "Schedule"],
  ["scenes", "Breakdown"],
  ["callsheet", "Call Sheet"],
  ["contacts", "Contacts"],
  ["tasks", "Tasks"],
  ["budget", "Budget"],
  ["assets", "Assets"],
  ["team", "Team & Access"],
];

const state = {
  token: window.localStorage.getItem(TOKEN_KEY) || "",
  user: null,
  data: null,
  currentView: "overview",
  search: "",
  notificationsOpen: false,
  loading: true,
  flash: "",
  error: "",
  assetPreviewId: "",
  editing: {
    project: false,
    users: null,
    schedule: null,
    scenes: null,
    contacts: null,
    tasks: null,
    budget: null,
    assets: null,
  },
};

const root = document.querySelector("#app");

root.addEventListener("click", handleClick);
root.addEventListener("submit", handleSubmit);
root.addEventListener("input", handleInput);

boot();

async function boot() {
  render();

  if (!state.token) {
    state.loading = false;
    render();
    return;
  }

  try {
    const session = await api("/auth/session");
    state.user = session.user;
    await refreshData();
  } catch {
    clearSession();
    state.loading = false;
    render();
  }
}

async function refreshData() {
  state.loading = true;
  state.error = "";
  render();
  const bootstrap = await api("/bootstrap");
  state.user = bootstrap.user;
  state.data = bootstrap;
  state.assetPreviewId = bootstrap.assets?.[0]?.id || "";
  if (!canViewModule(state.currentView)) {
    state.currentView = firstVisibleView();
  }
  state.loading = false;
  render();
}

function render() {
  if (state.loading) {
    root.innerHTML = `<div class="auth-shell"><div class="flash">Loading FrameForge…</div></div>`;
    return;
  }

  if (!state.token || !state.user || !state.data) {
    root.innerHTML = renderAuth();
    initializeGoogleAuth();
    return;
  }

  root.innerHTML = renderApp();
}

function renderAuth() {
  return `
    <div class="screen auth-shell">
      <section class="auth-card">
        <div class="auth-copy">
          <div class="brand-row">
            <div class="brand-mark">FF</div>
            <div>
              <strong>FrameForge</strong>
              <div class="muted" style="color: rgba(255,247,239,0.72)">Film Production Operating System</div>
            </div>
          </div>
          <div class="eyebrow" style="margin-top: 28px">Production workspace</div>
          <h1>Production control, without the chaos.</h1>
          <p>
            This build now runs on a Node API with disk persistence, authenticated sessions, editable project data,
            schedule management, scene breakdowns, contacts, tasks, budget lines, and production assets.
          </p>
          <div class="auth-stats">
            <div class="auth-stat"><strong>API-backed</strong><span>Node server + JSON database on disk.</span></div>
            <div class="auth-stat"><strong>Studio workflow</strong><span>Project, stripboard, call sheet, breakdown, crew, tasks, budget, assets.</span></div>
            <div class="auth-stat"><strong>Access control</strong><span>Google sign-in plus role-based permissions for every module.</span></div>
          </div>
        </div>
        <div class="auth-form">
          <div>
            <h2>Sign in</h2>
            <p>Use Google if your email is already in Team & Access, or sign in with your assigned email and password.</p>
          </div>
          ${state.error ? `<div class="flash error">${escapeHtml(state.error)}</div>` : ""}
          <div id="google-auth-slot"></div>
          ${
            runtimeConfig.googleClientId
              ? `<div class="demo-note">Google sign-in is enabled for invited team emails.</div>`
              : `<div class="demo-note">Google sign-in is not configured yet. Add <strong>GOOGLE_CLIENT_ID</strong> to <strong>.env</strong> to enable it.</div>`
          }
          <form id="login-form" class="auth-grid">
            <input class="input" name="email" type="email" placeholder="Email" required />
            <input class="input" name="password" type="password" placeholder="Password" required />
            <button class="button" type="submit">Enter production office</button>
          </form>
        </div>
      </section>
    </div>
  `;
}

function renderApp() {
  const { project, dashboard, settings } = state.data;
  const viewTitle = navItems.find(([key]) => key === state.currentView)?.[1] || "Overview";
  const visibleNav = navItems.filter(([key]) => canViewModule(key));
  const notifications = deriveNotifications(state.data);
  const searchResults = deriveGlobalSearchResults(state.data, state.search);

  return `
    <div class="screen app-shell">
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="brand-row">
            <div class="brand-mark">FF</div>
            <div>
              <strong>${escapeHtml(settings.studioName || "FrameForge")}</strong>
              <div style="color: rgba(255,248,238,0.68)">${escapeHtml(settings.companyName || "Production OS")}</div>
            </div>
          </div>
          <section class="project-card">
            <span class="pill dark">${escapeHtml(project.status)}</span>
            <h1>${escapeHtml(project.title)}</h1>
            <p>${escapeHtml(project.tagline)}</p>
            <div class="project-meta">
              <div class="meta-block">
                <span>Start</span>
                <strong>${formatDate(project.startDate)}</strong>
              </div>
              <div class="meta-block">
                <span>Wrap</span>
                <strong>${formatDate(project.wrapDate)}</strong>
              </div>
            </div>
          </section>
          <nav class="nav">
            ${visibleNav
              .map(
                ([key, label]) => `
                  <button class="nav-button ${state.currentView === key ? "active" : ""}" data-nav="${key}">
                    <span>${label}</span>
                    <span>•</span>
                  </button>
                `
              )
              .join("")}
          </nav>
        </div>
        <div class="sidebar-footer">
          <div class="callout" style="padding: 16px; border-color: rgba(255,255,255,0.08); background: rgba(255,255,255,0.05); color: #fff8ef; box-shadow: none;">
            <strong>${escapeHtml(state.user.name)}</strong>
            <div style="color: rgba(255,248,238,0.7); margin-top: 6px;">${escapeHtml(state.user.role)} · ${canEditModule("team") ? "full access" : "limited access"}</div>
          </div>
          <button class="button-ghost" data-action="logout">Logout</button>
        </div>
      </aside>

      <main class="main">
        <header class="topbar">
          <div>
            <div class="eyebrow">Film Production Suite</div>
            <h2>${viewTitle}</h2>
          </div>
          <div class="header-actions">
            <label class="search">
              <input id="search-input" type="search" value="${escapeAttribute(state.search)}" placeholder="Global search across scenes, crew, tasks, docs, budget..." />
            </label>
            <button class="button-secondary notification-button" type="button" data-action="toggle-notifications">
              Alerts
              ${notifications.length ? `<span class="notification-badge">${notifications.length}</span>` : ""}
            </button>
            ${canViewModule("callsheet") ? `<button class="button" data-nav="callsheet">Today's call sheet</button>` : ""}
          </div>
        </header>
        ${state.flash ? `<div class="flash">${escapeHtml(state.flash)}</div>` : ""}
        ${state.error ? `<div class="flash error">${escapeHtml(state.error)}</div>` : ""}
        ${state.search ? renderSearchResultsPanel(searchResults) : ""}
        ${state.notificationsOpen ? renderNotificationsPanel(notifications) : ""}
        ${renderView()}
      </main>
    </div>
  `;
}

function renderView() {
  if (!canViewModule(state.currentView)) {
    return `<section class="content">${renderReadOnlyCard("Your account does not have access to this module.")}</section>`;
  }

  switch (state.currentView) {
    case "overview":
      return renderOverview();
    case "project":
      return renderProjectView();
    case "settings":
      return renderSettingsView();
    case "team":
      return renderTeamView();
    case "schedule":
      return renderScheduleView();
    case "breakdown":
      return renderBreakdownView();
    case "callsheet":
      return renderCallsheetView();
    case "contacts":
      return renderContactsView();
    case "tasks":
      return renderTasksView();
    case "budget":
      return renderBudgetView();
    case "assets":
      return renderAssetsView();
    default:
      return `<section class="content"><div class="empty">Unknown view.</div></section>`;
  }
}

function renderSearchResultsPanel(results) {
  return `
    <section class="search-panel">
      <div class="section-head">
        <div class="section-copy">
          <h3>Global search</h3>
          <p>${results.length ? `${results.length} results across the production workspace.` : "No matches found across the workspace."}</p>
        </div>
      </div>
      <div class="record-list">
        ${
          results.length
            ? results.map(renderSearchResultCard).join("")
            : `<div class="empty">Try a scene code, team member, asset tag, task owner, budget category, or call sheet term.</div>`
        }
      </div>
    </section>
  `;
}

function renderNotificationsPanel(notifications) {
  return `
    <section class="notifications-panel">
      <div class="section-head">
        <div class="section-copy">
          <h3>Notifications</h3>
          <p>${notifications.length ? "Operational signals that need attention." : "No urgent notifications right now."}</p>
        </div>
      </div>
      <div class="record-list">
        ${
          notifications.length
            ? notifications.map(renderNotificationCard).join("")
            : `<div class="empty">You're clear for now.</div>`
        }
      </div>
    </section>
  `;
}

function renderSearchResultCard(result) {
  return `
    <button class="search-result-card" type="button" data-search-result="1" data-view="${escapeAttribute(result.view)}" data-collection="${escapeAttribute(result.collection || "")}" data-id="${escapeAttribute(result.id || "")}">
      <div class="record-footer">
        <div class="legend">
          <span class="pill">${escapeHtml(result.module)}</span>
          ${result.status ? `<span class="${workflowStatusClass(result.status)}">${escapeHtml(result.status)}</span>` : ""}
        </div>
        <span class="muted">${escapeHtml(result.meta)}</span>
      </div>
      <strong>${escapeHtml(result.title)}</strong>
      <span>${escapeHtml(result.summary)}</span>
    </button>
  `;
}

function renderNotificationCard(item) {
  return `
    <button class="notification-card" type="button" data-search-result="1" data-view="${escapeAttribute(item.view)}" data-collection="${escapeAttribute(item.collection || "")}" data-id="${escapeAttribute(item.id || "")}">
      <div class="record-footer">
        <div class="legend">
          <span class="${workflowStatusClass(item.level)}">${escapeHtml(item.levelLabel)}</span>
          <span class="pill">${escapeHtml(item.module)}</span>
        </div>
        ${item.when ? `<span class="muted">${escapeHtml(item.when)}</span>` : ""}
      </div>
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.message)}</span>
    </button>
  `;
}

function renderOverview() {
  const { project, dashboard, schedule, tasks, assets } = state.data;
  const totalBudget = sum(state.data.budget, "estimated");
  const totalActual = sum(state.data.budget, "actual");
  const resolvedLocation = project.locationLabel || project.location || "Location not set";
  const liveWeather = project.weather || "Weather sync pending";

  return `
    <section class="content">
      <div class="hero">
        <article class="hero-panel">
          <span class="pill dark">Backend powered</span>
          <h3>Run prep, production, and post from one operating layer.</h3>
          <p>${escapeHtml(project.logline)}</p>
          <div class="hero-actions" style="margin-top: 22px;">
            <button class="button-secondary" data-nav="schedule">Open stripboard</button>
            <button class="button-secondary" data-nav="breakdown">Review breakdown</button>
          </div>
        </article>
        <article class="hero-side panel">
          <div class="section-copy">
            <h3>Today at a glance</h3>
            <p>${escapeHtml(resolvedLocation)} · ${escapeHtml(liveWeather)}</p>
          </div>
          <div class="mini-list" style="margin-top: 18px;">
            <div class="mini-item"><strong>${schedule[0] ? escapeHtml(schedule[0].day) : "TBD"}</strong><span>Current production day</span></div>
            <div class="mini-item"><strong>${tasks.filter((item) => item.status !== "Done").length}</strong><span>Open action items</span></div>
            <div class="mini-item"><strong>${money(totalActual)}</strong><span>Actual spend to date</span></div>
          </div>
        </article>
      </div>

      <div class="metric-grid">
        ${dashboard.stats.map(renderMetric).join("")}
      </div>

      <div class="grid-two">
        <section class="timeline-card">
          <div class="section-head">
            <div class="section-copy">
              <h3>Upcoming shoot days</h3>
              <p>Linked to the same schedule collection used by the stripboard.</p>
            </div>
            <span class="pill">AD view</span>
          </div>
          <div class="stack">
            ${dashboard.upcomingDays.length ? dashboard.upcomingDays.map(renderTimelineDay).join("") : `<div class="empty">No days scheduled yet.</div>`}
          </div>
        </section>
        <section class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>Priority work</h3>
              <p>High-signal blockers and in-flight tasks.</p>
            </div>
          </div>
          <div class="list">
            ${dashboard.priorityTasks.length ? dashboard.priorityTasks.map(renderTaskCard).join("") : `<div class="empty">No active tasks.</div>`}
          </div>
        </section>
      </div>

      <div class="grid-three">
        <section class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>Budget pulse</h3>
              <p>Live totals from editable budget lines.</p>
            </div>
          </div>
          <div class="list">
            <div class="list-item"><strong>Estimated</strong><span>${money(totalBudget)}</span></div>
            <div class="list-item"><strong>Actual</strong><span>${money(totalActual)}</span></div>
            <div class="list-item"><strong>Variance</strong><span>${formatCurrencyDelta(totalActual - totalBudget)}</span></div>
          </div>
        </section>
        <section class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>Latest assets</h3>
              <p>Newest production docs in circulation.</p>
            </div>
          </div>
          <div class="list">
            ${assets.slice(0, 3).map(renderAssetCard).join("")}
          </div>
        </section>
        <section class="callout">
          <div class="section-head">
            <div class="section-copy">
              <h3>What this app now does</h3>
              <p>Not a static mockup anymore.</p>
            </div>
          </div>
          <div class="legend">
            <span class="pill">Auth</span>
            <span class="pill">API</span>
            <span class="pill">JSON DB</span>
            <span class="pill">CRUD</span>
            <span class="pill">Call sheets</span>
            <span class="pill">Budgeting</span>
            <span class="pill">Crew hub</span>
            <span class="pill">Schedule</span>
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderProjectView() {
  const project = state.data.project;
  const settings = state.data.settings;
  const canEdit = canEditModule("project");
  const resolvedLocation = project.locationLabel || project.location || "Location not set";
  return `
    <section class="content">
      <section class="grid-two">
        <article class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>Project profile</h3>
              <p>Editable metadata used across the whole suite.</p>
            </div>
          </div>
          ${
            canEdit
              ? `<form id="project-form" class="form-grid two">
                  <input class="input full" name="title" placeholder="Project title" value="${escapeAttribute(project.title)}" required />
                  <input class="input full" name="tagline" placeholder="Tagline" value="${escapeAttribute(project.tagline)}" required />
                  <input class="input" name="status" placeholder="Status" value="${escapeAttribute(project.status)}" required />
                  <input class="input" name="location" placeholder="Primary location or basecamp address" value="${escapeAttribute(project.location)}" required />
                  <input class="input" name="startDate" type="date" value="${escapeAttribute(project.startDate)}" required />
                  <input class="input" name="wrapDate" type="date" value="${escapeAttribute(project.wrapDate)}" required />
                  <input class="input" name="director" placeholder="Director" value="${escapeAttribute(project.director)}" required />
                  <input class="input" name="producer" placeholder="Producer" value="${escapeAttribute(project.producer)}" required />
                  <div class="callout">
                    <strong>Global defaults</strong>
                    <p style="margin-top: 10px;">Budget currency: ${escapeHtml(settings.currency || "EUR")}</p>
                    <p style="margin-top: 8px;">App timezone: ${escapeHtml(settings.timezone || "Europe/Ljubljana")}</p>
                  </div>
                  <div class="callout">
                    <strong>Live weather</strong>
                    <p style="margin-top: 10px;">${escapeHtml(project.weather || "Weather sync pending")}</p>
                    <p style="margin-top: 8px;">${escapeHtml(resolvedLocation)}</p>
                    <p style="margin-top: 8px;">Updated ${escapeHtml(formatDateTime(project.weatherUpdatedAt))}</p>
                  </div>
                  <textarea class="textarea full" name="logline" placeholder="Logline">${escapeHtml(project.logline)}</textarea>
                  <div class="button-row full">
                    <button class="button" type="submit">Save project & sync weather</button>
                    <button class="button-secondary" type="button" data-action="refresh-project-context">Refresh weather</button>
                  </div>
                </form>`
              : renderReadOnlyCard("You can view project details, but only users with project edit rights can change them.")
          }
        </article>
        <article class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>Production summary</h3>
              <p>Derived from shared state across the app.</p>
            </div>
          </div>
          <div class="list">
            <div class="list-item"><strong>${escapeHtml(project.title)}</strong><span>${escapeHtml(project.status)}</span></div>
            <div class="list-item"><strong>${formatDate(project.startDate)} → ${formatDate(project.wrapDate)}</strong><span>Shooting window</span></div>
            <div class="list-item"><strong>${escapeHtml(project.director)} / ${escapeHtml(project.producer)}</strong><span>Leadership</span></div>
            <div class="list-item"><strong>${escapeHtml(resolvedLocation)}</strong><span>Base of operations</span></div>
            <div class="list-item"><strong>${escapeHtml(project.weather || "Weather sync pending")}</strong><span>Live weather</span></div>
            <div class="list-item"><strong>${escapeHtml(settings.currency || "EUR")}</strong><span>Budget currency from global settings</span></div>
          </div>
        </article>
      </section>
    </section>
  `;
}

function renderSettingsView() {
  const settings = state.data.settings;
  const canEdit = canEditModule("settings");

  return `
    <section class="content">
      <section class="grid-two">
        <article class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>Studio defaults</h3>
              <p>Centralize branding, localization, and call sheet defaults across the whole app.</p>
            </div>
          </div>
          ${
            canEdit
              ? `<form id="settings-form" class="form-grid two">
                  <input class="input" name="studioName" placeholder="Studio name" value="${escapeAttribute(settings.studioName || "")}" required />
                  <input class="input" name="companyName" placeholder="Company name" value="${escapeAttribute(settings.companyName || "")}" required />
                  <select class="select" name="currency">
                    ${["EUR", "USD", "GBP"]
                      .map((currency) => `<option value="${currency}" ${currency === (settings.currency || "EUR") ? "selected" : ""}>${currency}</option>`)
                      .join("")}
                  </select>
                  <select class="select" name="locale">
                    ${[
                      ["sl-SI", "Slovenian / Europe"],
                      ["en-GB", "English / UK"],
                      ["en-US", "English / US"],
                    ]
                      .map(([value, label]) => `<option value="${value}" ${value === (settings.locale || "en-GB") ? "selected" : ""}>${label}</option>`)
                      .join("")}
                  </select>
                  <input class="input full" name="timezone" placeholder="Timezone" value="${escapeAttribute(settings.timezone || "")}" required />
                  <input class="input full" name="defaultBasecamp" placeholder="Default basecamp / unit base" value="${escapeAttribute(settings.defaultBasecamp || "")}" />
                  <input class="input" name="emergencyHospital" placeholder="Emergency hospital" value="${escapeAttribute(settings.emergencyHospital || "")}" />
                  <input class="input" name="emergencyPhone" placeholder="Emergency phone" value="${escapeAttribute(settings.emergencyPhone || "")}" />
                  <textarea class="textarea full" name="transportNotes" placeholder="Transport notes">${escapeHtml(settings.transportNotes || "")}</textarea>
                  <textarea class="textarea full" name="parkingNotes" placeholder="Parking notes">${escapeHtml(settings.parkingNotes || "")}</textarea>
                  <textarea class="textarea full" name="callSheetFooter" placeholder="Call sheet footer / standing notes">${escapeHtml(settings.callSheetFooter || "")}</textarea>
                  <div class="button-row full">
                    <button class="button" type="submit">Save global settings</button>
                  </div>
                </form>`
              : renderReadOnlyCard("You can review global defaults, but only studio admins can change them.")
          }
        </article>
        <article class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>Live impact</h3>
              <p>These settings are already used by budgeting, dates, times, navigation branding, and call sheet defaults.</p>
            </div>
          </div>
          <div class="list">
            <div class="list-item"><strong>${escapeHtml(settings.studioName || "FrameForge")}</strong><span>Sidebar branding</span></div>
            <div class="list-item"><strong>${escapeHtml(settings.companyName || "Production OS")}</strong><span>Studio identity</span></div>
            <div class="list-item"><strong>${escapeHtml(settings.currency || "EUR")}</strong><span>Budget and dashboard currency</span></div>
            <div class="list-item"><strong>${escapeHtml(settings.locale || "en-GB")}</strong><span>Date and number locale</span></div>
            <div class="list-item"><strong>${escapeHtml(settings.timezone || "Europe/Ljubljana")}</strong><span>Display timezone</span></div>
            <div class="list-item"><strong>${escapeHtml(settings.defaultBasecamp || state.data.project.locationLabel || state.data.project.location || "TBD")}</strong><span>Default basecamp</span></div>
            <div class="list-item"><strong>${escapeHtml(settings.emergencyHospital || "TBD")}</strong><span>Emergency hospital</span></div>
            <div class="list-item"><strong>${escapeHtml(settings.emergencyPhone || "TBD")}</strong><span>Emergency contact</span></div>
          </div>
        </article>
      </section>
    </section>
  `;
}

function renderTeamView() {
  const items = filterItems(state.data.users, ["name", "email", "role", "title", "department"]);
  const editing = getEditingRecord("users");
  const canEdit = canEditModule("team");

  return `
    <section class="content">
      <section class="grid-two team-grid">
        <article class="table-card">
          <div class="section-head">
            <div class="section-copy">
              <h3>Team directory & access</h3>
              <p>Add viewers, crew, and admins, then assign exactly what each person can edit.</p>
            </div>
            <span class="pill">${items.length} users</span>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Access</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${
                  items.length
                    ? items
                        .map(
                          (user) => `
                            <tr>
                              <td>
                                <strong>${escapeHtml(user.name)}</strong>
                                <div class="muted">${escapeHtml(user.title || "No title")}</div>
                              </td>
                              <td>${escapeHtml(user.role)}</td>
                              <td>${escapeHtml(user.department || "—")}</td>
                              <td>${escapeHtml(user.email)}</td>
                              <td>${renderAccessSummary(user.access)}</td>
                              <td>${canEdit ? renderRowActions("users", user.id) : ""}</td>
                            </tr>
                          `
                        )
                        .join("")
                    : `<tr><td colspan="6">No users found.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </article>
        <article class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>${editing ? "Edit team member" : "Add viewer or team member"}</h3>
              <p>Producers/admins can grant full access or fine-tune module permissions.</p>
            </div>
          </div>
          ${
            canEdit
              ? renderUserForm(editing)
              : renderReadOnlyCard("You can review the team list, but only producer/admin users can change access rights.")
          }
        </article>
      </section>
    </section>
  `;
}

function renderScheduleView() {
  const items = filterItems(state.data.schedule, ["day", "date", "location", "callTime", "notes", "scenes", "status"]);
  const editing = getEditingRecord("schedule");
  const canEdit = canEditModule("schedule");

  return `
    <section class="content">
      <section class="grid-two">
        <article class="table-card">
          <div class="section-head">
            <div class="section-copy">
              <h3>Digital stripboard</h3>
              <p>Each row is persisted to the JSON database through the API.</p>
            </div>
            <span class="pill">${items.length} shoot days</span>
          </div>
          <div class="strip-list">
            ${items.length ? items.map(renderScheduleStrip).join("") : `<div class="empty">No shoot days match your search.</div>`}
          </div>
        </article>
        <article class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>${editing ? "Edit shoot day" : "Add shoot day"}</h3>
              <p>Scenes can be entered as a comma-separated list.</p>
            </div>
          </div>
          ${
            canEdit
              ? renderCollectionForm("schedule", editing, [
                  field("day", "text", "Day 15"),
                  field("date", "date"),
                  field("location", "text", "Location"),
                  field("callTime", "time"),
                  selectField("status", ["ready", "shooting", "risk"]),
                  field("scenes", "text", "24A, 24B", true),
                  textareaField("notes", "Notes", true),
                ])
              : renderReadOnlyCard("This schedule is view-only for your account.")
          }
        </article>
      </section>
    </section>
  `;
}

function renderBreakdownView() {
  const items = filterItems(state.data.scenes, ["code", "title", "location", "setup", "pages", "cast", "elements"]);
  const editing = getEditingRecord("scenes");
  const canEdit = canEditModule("scenes");

  return `
    <section class="content">
      <section class="grid-two">
        <article class="table-card">
          <div class="section-head">
            <div class="section-copy">
              <h3>Scene breakdown board</h3>
              <p>Break down scenes, cast, page counts, and special elements.</p>
            </div>
            <span class="pill">${items.length} scenes</span>
          </div>
          <div class="record-list">
            ${items.length ? items.map(renderSceneRecord).join("") : `<div class="empty">No scenes match your search.</div>`}
          </div>
        </article>
        <article class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>${editing ? "Edit scene" : "Add scene"}</h3>
              <p>Elements support a comma-separated list for gear, VFX, props, or stunts.</p>
            </div>
          </div>
          ${
            canEdit
              ? renderCollectionForm("scenes", editing, [
                  field("code", "text", "24A"),
                  field("title", "text", "Scene title", true),
                  field("location", "text", "Location"),
                  field("setup", "text", "Interior / Night"),
                  field("pages", "text", "2 1/8"),
                  field("cast", "text", "Cast list", true),
                  field("elements", "text", "Props, VFX, stunts", true),
                ])
              : renderReadOnlyCard("Scene breakdowns are view-only for your account.")
          }
        </article>
      </section>
    </section>
  `;
}

function renderCallsheetView() {
  const sheet = resolveCallsheet();
  const canEdit = canEditModule("callsheet");

  return `
    <section class="content">
      <div class="hero">
        <article class="hero-panel">
          <span class="pill dark">${escapeHtml(sheet.status)} · ${escapeHtml(sheet.unit)}</span>
          <h3>${escapeHtml(sheet.dayLabel)} · ${formatDate(sheet.shootDate)}</h3>
          <p>
            Crew call ${escapeHtml(sheet.crewCall)} at ${escapeHtml(sheet.locationDetails)}.
            Weather: ${escapeHtml(sheet.weather)}. Scenes: ${escapeHtml(sheet.sceneCodes.join(", ") || "TBD")}.
          </p>
        </article>
        <article class="hero-side panel">
          <div class="section-copy">
            <h3>Emergency & logistics</h3>
            <p>Live location-aware context combined with studio-wide defaults.</p>
          </div>
          <div class="mini-list" style="margin-top: 18px;">
            <div class="mini-item"><strong>Hospital</strong><span>${escapeHtml(sheet.hospitalName)} · ${escapeHtml(sheet.hospitalPhone)}</span></div>
            <div class="mini-item"><strong>Sunrise / Sunset</strong><span>${escapeHtml(sheet.sunrise)} / ${escapeHtml(sheet.sunset)}</span></div>
            <div class="mini-item"><strong>Basecamp</strong><span>${escapeHtml(sheet.basecamp)}</span></div>
          </div>
        </article>
      </div>

      <div class="callsheet-stats">
        <article class="metric-card">
          <span>Crew call</span>
          <strong>${escapeHtml(sheet.crewCall)}</strong>
          <p>Full crew reporting time.</p>
        </article>
        <article class="metric-card">
          <span>First shot</span>
          <strong>${escapeHtml(sheet.firstShot)}</strong>
          <p>Target for cameras rolling.</p>
        </article>
        <article class="metric-card">
          <span>Meal break</span>
          <strong>${escapeHtml(sheet.mealBreak)}</strong>
          <p>Current schedule meal timing.</p>
        </article>
        <article class="metric-card">
          <span>Wrap</span>
          <strong>${escapeHtml(sheet.wrapTime)}</strong>
          <p>Planned unit wrap time.</p>
        </article>
      </div>

      <div class="grid-two">
        <section class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>Daily packet</h3>
              <p>Everything the crew needs for the active day.</p>
            </div>
          </div>
          <div class="list">
            <div class="list-item"><strong>Location</strong><span>${escapeHtml(sheet.locationDetails)}</span></div>
            <div class="list-item"><strong>Weather</strong><span>${escapeHtml(sheet.weatherNotes || sheet.weather)}</span></div>
            <div class="list-item"><strong>Logistics</strong><span>${escapeHtml(sheet.additionalNotes)}</span></div>
            <div class="list-item"><strong>Transport</strong><span>${escapeHtml(sheet.transportNotes)}</span></div>
            <div class="list-item"><strong>Parking</strong><span>${escapeHtml(sheet.parkingNotes)}</span></div>
            <div class="list-item"><strong>Distribution</strong><span>${escapeHtml(sheet.distribution)}</span></div>
            <div class="list-item"><strong>Standing note</strong><span>${escapeHtml(sheet.footer)}</span></div>
          </div>
        </section>
        <section class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>Scenes, cast & docs</h3>
              <p>Pulled live from scenes, contacts, and assets.</p>
            </div>
          </div>
          <div class="stack">
            <div class="callout">
              <strong>Scene lineup</strong>
              <div class="record-list" style="margin-top: 12px;">
                ${sheet.sceneCards.length ? sheet.sceneCards.map(renderCallsheetSceneCard).join("") : `<div class="empty">No scenes selected for this call sheet.</div>`}
              </div>
            </div>
            <div class="callout">
              <strong>Cast on day</strong>
              <div class="legend" style="margin-top: 12px;">
                ${sheet.castNames.length ? sheet.castNames.map((name) => `<span class="pill">${escapeHtml(name)}</span>`).join("") : `<span class="muted">No cast roster derived yet.</span>`}
              </div>
            </div>
            <div class="callout">
              <strong>Attached documents</strong>
              <div class="record-list" style="margin-top: 12px;">
                ${sheet.attachments.length ? sheet.attachments.map(renderCallsheetAttachment).join("") : `<div class="empty">No reference documents attached yet.</div>`}
              </div>
            </div>
            <div class="callout">
              <strong>Key contacts</strong>
              <div class="list" style="margin-top: 12px;">
                ${sheet.contacts.length ? sheet.contacts.map(renderContactCard).join("") : `<div class="empty">No key contacts available.</div>`}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="grid-two">
        <section class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>Call sheet editor</h3>
              <p>Persist day-specific timings, logistics, distribution, and attached docs.</p>
            </div>
          </div>
          ${
            canEdit
              ? renderCallsheetForm(sheet)
              : renderReadOnlyCard("The call sheet is view-only for your account.")
          }
        </section>
        <section class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>Publish checklist</h3>
              <p>Quick review before sending the day pack.</p>
            </div>
          </div>
          <div class="list">
            <div class="list-item"><strong>Status</strong><span>${escapeHtml(sheet.status)}</span></div>
            <div class="list-item"><strong>Crew / cast calls</strong><span>${escapeHtml(sheet.crewCall)} / ${escapeHtml(sheet.castCall)}</span></div>
            <div class="list-item"><strong>Scenes on day</strong><span>${escapeHtml(sheet.sceneCodes.join(", ") || "None")}</span></div>
            <div class="list-item"><strong>Attached assets</strong><span>${sheet.attachments.length} linked documents</span></div>
            <div class="list-item"><strong>Emergency details</strong><span>${escapeHtml(sheet.hospitalName)} · ${escapeHtml(sheet.hospitalPhone)}</span></div>
            <div class="list-item"><strong>Last edited</strong><span>${escapeHtml(sheet.lastEditedBy || "—")} · ${escapeHtml(formatDateTime(sheet.lastEditedAt))}</span></div>
            <div class="list-item"><strong>Approved</strong><span>${escapeHtml(sheet.approvedBy || "Pending")} ${sheet.approvedAt ? `· ${escapeHtml(formatDateTime(sheet.approvedAt))}` : ""}</span></div>
            <div class="list-item"><strong>Published</strong><span>${sheet.publishedAt ? escapeHtml(formatDateTime(sheet.publishedAt)) : "Not published yet"}</span></div>
            <div class="list-item"><strong>Approval notes</strong><span>${escapeHtml(sheet.approvalNotes || "No approval notes yet.")}</span></div>
            <div class="list-item"><strong>Footer note</strong><span>${escapeHtml(sheet.footer)}</span></div>
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderContactsView() {
  const items = filterItems(state.data.contacts, ["name", "role", "dept", "phone", "email"]);
  const editing = getEditingRecord("contacts");
  const canEdit = canEditModule("contacts");

  return `
    <section class="content">
      <section class="grid-two">
        <article class="table-card">
          <div class="section-head">
            <div class="section-copy">
              <h3>Crew & vendor contacts</h3>
              <p>Production directory with edit and delete controls.</p>
            </div>
            <span class="pill">${items.length} contacts</span>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Dept</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${
                  items.length
                    ? items
                        .map(
                          (person) => `
                            <tr>
                              <td>${escapeHtml(person.name)}</td>
                              <td>${escapeHtml(person.role)}</td>
                              <td>${escapeHtml(person.dept)}</td>
                              <td>${escapeHtml(person.phone)}</td>
                              <td>${escapeHtml(person.email)}</td>
                              <td>${canEdit ? renderRowActions("contacts", person.id) : ""}</td>
                            </tr>
                          `
                        )
                        .join("")
                    : `<tr><td colspan="6">No contacts found.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </article>
        <article class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>${editing ? "Edit contact" : "Add contact"}</h3>
              <p>Maintain your crew book from the same app.</p>
            </div>
          </div>
          ${
            canEdit
              ? renderCollectionForm("contacts", editing, [
                  field("name", "text", "Full name"),
                  field("role", "text", "Role"),
                  field("dept", "text", "Department"),
                  field("phone", "text", "Phone"),
                  field("email", "email", "Email", true),
                ])
              : renderReadOnlyCard("Contacts are view-only for your account.")
          }
        </article>
      </section>
    </section>
  `;
}

function renderTasksView() {
  const items = filterItems(state.data.tasks, ["title", "owner", "due", "priority", "status"]);
  const editing = getEditingRecord("tasks");
  const canEdit = canEditModule("tasks");

  return `
    <section class="content">
      <section class="grid-two">
        <article class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>Task tracker</h3>
              <p>Coordinate production blockers and follow-through.</p>
            </div>
            <span class="pill">${items.length} tasks</span>
          </div>
          <div class="record-list">
            ${items.length ? items.map(renderTaskRecord).join("") : `<div class="empty">No tasks match your search.</div>`}
          </div>
        </article>
        <article class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>${editing ? "Edit task" : "Add task"}</h3>
              <p>Use this for permits, vendors, art approvals, post, anything.</p>
            </div>
          </div>
          ${
            canEdit
              ? renderCollectionForm("tasks", editing, [
                  field("title", "text", "Task title", true),
                  field("owner", "text", "Owner"),
                  field("due", "date"),
                  selectField("priority", ["low", "medium", "high"]),
                  selectField("status", ["Not Started", "In Progress", "Done"]),
                ])
              : renderReadOnlyCard("Tasks are view-only for your account.")
          }
        </article>
      </section>
      <section class="kanban">
        ${["Not Started", "In Progress", "Done"]
          .map((lane) => {
            const laneItems = state.data.tasks.filter((item) => item.status === lane);
            return `
              <article class="board-card">
                <div class="section-copy" style="margin-bottom: 16px;">
                  <h3>${lane}</h3>
                  <p>${laneItems.length} tasks</p>
                </div>
                <div class="board-items">
                  ${laneItems.length ? laneItems.map(renderTaskCard).join("") : `<div class="empty">Nothing here.</div>`}
                </div>
              </article>
            `;
          })
          .join("")}
      </section>
    </section>
  `;
}

function renderBudgetView() {
  const items = filterItems(state.data.budget, ["category", "estimated", "actual"]);
  const editing = getEditingRecord("budget");
  const canEdit = canEditModule("budget");
  const estimated = sum(state.data.budget, "estimated");
  const actual = sum(state.data.budget, "actual");

  return `
    <section class="content">
      <div class="metric-grid">
        ${renderMetric({ label: "Estimated", value: money(estimated), note: "Total estimated cost." })}
        ${renderMetric({ label: "Actual", value: money(actual), note: "Tracked actual spend." })}
        ${renderMetric({ label: "Variance", value: formatCurrencyDelta(actual - estimated), note: "Actual minus estimated." })}
        ${renderMetric({ label: "Burn", value: `${estimated ? Math.round((actual / estimated) * 100) : 0}%`, note: "Budget consumption." })}
      </div>
      <section class="grid-two">
        <article class="table-card">
          <div class="section-head">
            <div class="section-copy">
              <h3>Budget tracker</h3>
              <p>Line producer style overview with editable rows.</p>
            </div>
          </div>
          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Estimated</th>
                  <th>Actual</th>
                  <th>Variance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                ${
                  items.length
                    ? items
                        .map((item) => {
                          const variance = Number(item.actual) - Number(item.estimated);
                          return `
                            <tr>
                              <td>${escapeHtml(item.category)}</td>
                              <td>${money(item.estimated)}</td>
                              <td>${money(item.actual)}</td>
                              <td>${formatCurrencyDelta(variance)}</td>
                              <td>${canEdit ? renderRowActions("budget", item.id) : ""}</td>
                            </tr>
                          `;
                        })
                        .join("")
                    : `<tr><td colspan="5">No budget lines found.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </article>
        <article class="panel">
          <div class="section-head">
            <div class="section-copy">
              <h3>${editing ? "Edit budget line" : "Add budget line"}</h3>
              <p>Estimated and actual values are stored as numbers in the backend.</p>
            </div>
          </div>
          ${
            canEdit
              ? renderCollectionForm("budget", editing, [
                  field("category", "text", "Category"),
                  field("estimated", "number", "Estimated"),
                  field("actual", "number", "Actual"),
                ])
              : renderReadOnlyCard("Budget is view-only for your account.")
          }
        </article>
      </section>
    </section>
  `;
}

function renderAssetsView() {
  const items = filterItems(state.data.assets, ["name", "type", "owner", "updated", "tag", "status", "version", "approvalNotes"]);
  const editing = getEditingRecord("assets");
  const canEdit = canEditModule("assets");
  const previewAsset = items.find((item) => item.id === state.assetPreviewId) || items[0] || null;

  return `
    <section class="content">
      <section class="grid-two asset-grid">
        <article class="table-card">
          <div class="section-head">
            <div class="section-copy">
              <h3>Assets & production docs</h3>
              <p>Upload, preview, and organize scripts, PDFs, images, safety docs, and deliverables.</p>
            </div>
            <span class="pill">${items.length} assets</span>
          </div>
          <div class="record-list">
            ${items.length ? items.map(renderAssetRecord).join("") : `<div class="empty">No assets match your search.</div>`}
          </div>
        </article>
        <div class="stack">
          <article class="panel">
            <div class="section-head">
              <div class="section-copy">
                <h3>${previewAsset ? "Preview" : "Preview unavailable"}</h3>
                <p>${previewAsset ? "Read documents directly in the app." : "Select or upload an asset to preview it here."}</p>
              </div>
            </div>
            ${renderAssetPreview(previewAsset)}
          </article>
          <article class="panel">
            <div class="section-head">
              <div class="section-copy">
                <h3>${editing ? "Edit asset" : "Add asset"}</h3>
                <p>Attach the latest revision and keep it in the shared library.</p>
              </div>
            </div>
            ${
              canEdit
                ? renderAssetForm(editing)
                : renderReadOnlyCard("Assets are view-only for your account.")
            }
          </article>
        </div>
      </section>
    </section>
  `;
}

function renderMetric(item) {
  const value = typeof item.value === "number" ? formatMetricValue(item.value) : item.value;
  return `
    <article class="metric-card">
      <span>${escapeHtml(item.label)}</span>
      <strong>${escapeHtml(String(value))}</strong>
      <p>${escapeHtml(item.note)}</p>
    </article>
  `;
}

function renderTimelineDay(item) {
  return `
    <div class="timeline-entry">
      <strong>${escapeHtml(item.day)} · ${formatDate(item.date)}</strong>
      <span>${escapeHtml(item.location)} · call ${escapeHtml(item.callTime)}</span>
      <p class="muted">${escapeHtml(item.notes)}</p>
    </div>
  `;
}

function renderScheduleStrip(item) {
  return `
    <article class="strip">
      <div class="strip-code">${escapeHtml(item.day)}</div>
      <div>
        <strong>${formatDate(item.date)} · ${escapeHtml(item.location)}</strong>
        <span>Scenes ${escapeHtml(item.scenes.join(", "))} · call ${escapeHtml(item.callTime)}</span>
        <p class="muted">${escapeHtml(item.notes)}</p>
      </div>
      <div class="inline-actions">
        <span class="${statusClass(item.status)}">${escapeHtml(humanizeStatus(item.status))}</span>
        ${canEditModule("schedule") ? renderIconActions("schedule", item.id) : ""}
      </div>
    </article>
  `;
}

function renderSceneRecord(item) {
  return `
    <article class="record">
      <strong>${escapeHtml(item.code)} · ${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.setup)} · ${escapeHtml(item.location)} · ${escapeHtml(item.pages)} pages</span>
      <div class="muted">Cast: ${escapeHtml(item.cast)}</div>
      <div class="muted">Elements: ${escapeHtml(item.elements.join(", "))}</div>
      <div class="record-footer">
        <span class="pill">${escapeHtml(item.code)}</span>
        <div class="inline-actions">${canEditModule("scenes") ? renderIconActions("scenes", item.id) : ""}</div>
      </div>
    </article>
  `;
}

function renderContactCard(item) {
  return `<div class="list-item"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.role)} · ${escapeHtml(item.phone)}</span></div>`;
}

function renderTaskCard(item) {
  return `
    <article class="task-card">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.owner)} · ${formatDate(item.due)}</span>
      <div class="${priorityClass(item.priority)}">${escapeHtml(item.priority)}</div>
    </article>
  `;
}

function renderTaskRecord(item) {
  return `
    <article class="record">
      <strong>${escapeHtml(item.title)}</strong>
      <span>${escapeHtml(item.owner)} · due ${formatDate(item.due)}</span>
      <div class="card-footer">
        <div class="legend">
          <span class="${priorityClass(item.priority)}">${escapeHtml(item.priority)}</span>
          <span class="${statusClass(taskStatusToBadge(item.status))}">${escapeHtml(item.status)}</span>
        </div>
        <div class="inline-actions">${canEditModule("tasks") ? renderIconActions("tasks", item.id) : ""}</div>
      </div>
    </article>
  `;
}

function renderAssetCard(item) {
  return `<div class="list-item"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.tag)} · ${escapeHtml(item.status || "Draft")} · ${formatDate(item.updated)}</span></div>`;
}

function renderAssetRecord(item) {
  return `
    <article class="record ${state.assetPreviewId === item.id ? "selected-record" : ""}">
      <strong>${escapeHtml(item.name)}</strong>
      <span>${escapeHtml(item.type)} · ${escapeHtml(item.owner)} · ${formatDate(item.updated)}</span>
      <div class="muted">${escapeHtml(item.fileName || "Metadata only")} ${item.sizeBytes ? `· ${formatFileSize(item.sizeBytes)}` : ""}</div>
      <div class="card-footer">
        <div class="legend">
          <span class="pill">${escapeHtml(item.tag)}</span>
          <span class="${workflowStatusClass(item.status)}">${escapeHtml(item.status || "Draft")}</span>
          <span class="pill">v${escapeHtml(item.version || "1")}</span>
        </div>
        <div class="inline-actions">
          <button class="action-link" type="button" data-preview-asset="${item.id}">Preview</button>
          ${item.fileUrl ? `<a class="action-link" href="${escapeAttribute(item.fileUrl)}" target="_blank" rel="noreferrer">Open</a>` : ""}
          ${canEditModule("assets") ? renderIconActions("assets", item.id) : ""}
        </div>
      </div>
    </article>
  `;
}

function renderAssetForm(editing) {
  return `
    <form class="form-grid two" data-collection-form="assets">
      <input type="hidden" name="id" value="${escapeAttribute(editing?.id || "")}" />
      <input class="input full" name="name" type="text" placeholder="Asset title" value="${escapeAttribute(editing?.name || "")}" required />
      <select class="select" name="type">
        ${["PDF", "Image", "Doc", "Spreadsheet", "Link", "Other"]
          .map((type) => `<option value="${type}" ${type === (editing?.type || "PDF") ? "selected" : ""}>${type}</option>`)
          .join("")}
      </select>
      <input class="input" name="owner" type="text" placeholder="Owner" value="${escapeAttribute(editing?.owner || "")}" />
      <input class="input" name="updated" type="date" value="${escapeAttribute(editing?.updated || "")}" />
      <input class="input" name="tag" type="text" placeholder="Tag" value="${escapeAttribute(editing?.tag || "")}" />
      <select class="select" name="status">
        ${["Draft", "In review", "Approved", "Archived"]
          .map((status) => `<option value="${status}" ${status === (editing?.status || "Draft") ? "selected" : ""}>${status}</option>`)
          .join("")}
      </select>
      <input class="input" name="version" type="text" placeholder="v1" value="${escapeAttribute(editing?.version || "")}" />
      <textarea class="textarea full" name="approvalNotes" placeholder="Approval / review notes">${escapeHtml(editing?.approvalNotes || "")}</textarea>
      <label class="upload-field full">
        <span>Document upload</span>
        <input class="input" name="file" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.txt" />
      </label>
      <div class="button-row full">
        <button class="button" type="submit">${editing ? "Save asset" : "Upload asset"}</button>
        ${
          editing
            ? `<button class="button-secondary" type="button" data-action="cancel-edit" data-collection="assets">Cancel</button>`
            : ""
        }
      </div>
    </form>
  `;
}

function renderAssetPreview(asset) {
  if (!asset) {
    return `<div class="empty">No document selected.</div>`;
  }

  if (!asset.fileUrl) {
    return `
      <div class="empty">
        <strong>${escapeHtml(asset.name)}</strong>
        <div style="margin-top: 10px;"><span class="${workflowStatusClass(asset.status)}">${escapeHtml(asset.status || "Draft")}</span></div>
        <div style="margin-top: 10px;">This asset currently stores metadata only. Upload a file to preview it here.</div>
      </div>
    `;
  }

  const workflowMeta = `
    <div class="preview-meta">
      <span class="${workflowStatusClass(asset.status)}">${escapeHtml(asset.status || "Draft")}</span>
      <span class="pill">v${escapeHtml(asset.version || "1")}</span>
      ${asset.approvedBy ? `<span class="pill">Approved by ${escapeHtml(asset.approvedBy)}</span>` : ""}
    </div>
  `;

  if (asset.mimeType === "application/pdf" || asset.fileUrl.toLowerCase().endsWith(".pdf")) {
    return `${workflowMeta}<iframe class="asset-preview-frame" src="${escapeAttribute(asset.fileUrl)}" title="${escapeAttribute(asset.name)}"></iframe>`;
  }

  if (String(asset.mimeType).startsWith("image/")) {
    return `${workflowMeta}<img class="asset-preview-image" src="${escapeAttribute(asset.fileUrl)}" alt="${escapeAttribute(asset.name)}" />`;
  }

  return `
    <div class="empty">
      <strong>${escapeHtml(asset.name)}</strong>
      <div style="margin-top: 10px;">${workflowMeta}</div>
      <div style="margin-top: 10px;">Preview is not supported for this file type yet.</div>
      <div style="margin-top: 10px;"><a href="${escapeAttribute(asset.fileUrl)}" target="_blank" rel="noreferrer">Open document in new tab</a></div>
    </div>
  `;
}

function renderCallsheetSceneCard(scene) {
  return `
    <article class="record">
      <strong>${escapeHtml(scene.code)} · ${escapeHtml(scene.title)}</strong>
      <span>${escapeHtml(scene.setup)} · ${escapeHtml(scene.location)} · ${escapeHtml(scene.pages)} pages</span>
      <div class="muted">Cast: ${escapeHtml(scene.cast)}</div>
    </article>
  `;
}

function renderCallsheetAttachment(asset) {
  return `
    <article class="record">
      <strong>${escapeHtml(asset.name)}</strong>
      <span>${escapeHtml(asset.type)} · ${escapeHtml(asset.tag || "Reference doc")}</span>
      <div class="card-footer">
        <div class="legend">
          <span class="muted">${escapeHtml(asset.fileName || "Document link")}</span>
          <span class="${workflowStatusClass(asset.status)}">${escapeHtml(asset.status || "Draft")}</span>
        </div>
        <div class="inline-actions">
          ${asset.fileUrl ? `<a class="action-link" href="${escapeAttribute(asset.fileUrl)}" target="_blank" rel="noreferrer">Open</a>` : ""}
        </div>
      </div>
    </article>
  `;
}

function renderCallsheetForm(sheet) {
  return `
    <form id="callsheet-form" class="form-grid two">
      <select class="select" name="status">
        ${["Draft", "In review", "Approved", "Published"]
          .map((status) => `<option value="${status}" ${status === sheet.status ? "selected" : ""}>${status}</option>`)
          .join("")}
      </select>
      <input class="input" name="unit" type="text" placeholder="Unit" value="${escapeAttribute(sheet.unit)}" />
      <input class="input" name="shootDate" type="date" value="${escapeAttribute(sheet.shootDateRaw)}" />
      <input class="input" name="locationDetails" type="text" placeholder="Location details" value="${escapeAttribute(sheet.locationDetails)}" />
      <input class="input" name="crewCall" type="time" value="${escapeAttribute(sheet.crewCallRaw)}" />
      <input class="input" name="castCall" type="time" value="${escapeAttribute(sheet.castCallRaw)}" />
      <input class="input" name="firstShot" type="time" value="${escapeAttribute(sheet.firstShotRaw)}" />
      <input class="input" name="mealBreak" type="time" value="${escapeAttribute(sheet.mealBreakRaw)}" />
      <input class="input" name="wrapTime" type="time" value="${escapeAttribute(sheet.wrapTimeRaw)}" />
      <input class="input" name="basecamp" type="text" placeholder="Basecamp" value="${escapeAttribute(sheet.basecamp)}" />
      <input class="input full" name="sceneCodes" type="text" placeholder="24A, 24B, 25" value="${escapeAttribute(sheet.sceneCodes.join(", "))}" />
      <input class="input" name="hospitalName" type="text" placeholder="Hospital" value="${escapeAttribute(sheet.hospitalName)}" />
      <input class="input" name="hospitalPhone" type="text" placeholder="Emergency phone" value="${escapeAttribute(sheet.hospitalPhone)}" />
      <textarea class="textarea full" name="weatherNotes" placeholder="Optional weather note override">${escapeHtml(sheet.weatherNotesRaw)}</textarea>
      <textarea class="textarea full" name="additionalNotes" placeholder="Daily logistics / notes">${escapeHtml(sheet.additionalNotes)}</textarea>
      <textarea class="textarea full" name="transportNotes" placeholder="Transport notes">${escapeHtml(sheet.transportNotes)}</textarea>
      <textarea class="textarea full" name="parkingNotes" placeholder="Parking notes">${escapeHtml(sheet.parkingNotes)}</textarea>
      <textarea class="textarea full" name="distribution" placeholder="Distribution list">${escapeHtml(sheet.distribution)}</textarea>
      <textarea class="textarea full" name="approvalNotes" placeholder="Approval notes / release notes">${escapeHtml(sheet.approvalNotes || "")}</textarea>
      <textarea class="textarea full" name="footer" placeholder="Footer / standing note">${escapeHtml(sheet.footer)}</textarea>
      <div class="full stack">
        <strong>Attach production documents</strong>
        <div class="attachment-grid">
          ${state.data.assets.length
            ? state.data.assets
                .map(
                  (asset) => `
                    <label class="attachment-option">
                      <input type="checkbox" name="attachedAssetIds" value="${escapeAttribute(asset.id)}" ${sheet.attachedAssetIds.includes(asset.id) ? "checked" : ""} />
                      <span>
                        <strong>${escapeHtml(asset.name)}</strong>
                        <small>${escapeHtml(asset.type)} · ${escapeHtml(asset.tag || "Reference")}</small>
                      </span>
                    </label>
                  `
                )
                .join("")
            : `<div class="empty">Upload assets first to attach them to the call sheet.</div>`}
        </div>
      </div>
      <div class="button-row full">
        <button class="button" type="submit">Save call sheet</button>
      </div>
    </form>
  `;
}

function renderCollectionForm(collection, editing, fields) {
  return `
    <form class="form-grid two" data-collection-form="${collection}">
      <input type="hidden" name="id" value="${escapeAttribute(editing?.id || "")}" />
      ${fields.map((entry) => renderField(entry, editing)).join("")}
      <div class="button-row full">
        <button class="button" type="submit">${editing ? "Save changes" : `Add ${collectionLabels[collection]}`}</button>
        ${
          editing
            ? `<button class="button-secondary" type="button" data-action="cancel-edit" data-collection="${collection}">Cancel</button>`
            : ""
        }
      </div>
    </form>
  `;
}

function renderUserForm(editing) {
  const access = editing?.access || defaultAccessForRole(editing?.role || "Viewer");
  return `
    <form id="user-form" class="form-grid two">
      <input type="hidden" name="id" value="${escapeAttribute(editing?.id || "")}" />
      <input class="input" name="name" placeholder="Full name" value="${escapeAttribute(editing?.name || "")}" required />
      <input class="input" name="email" type="email" placeholder="Email" value="${escapeAttribute(editing?.email || "")}" required />
      <input class="input" name="title" placeholder="Title" value="${escapeAttribute(editing?.title || "")}" />
      <input class="input" name="department" placeholder="Department" value="${escapeAttribute(editing?.department || "")}" />
      <select class="select" name="role">
        ${["Producer", "Admin", "Crew", "1st AD", "Viewer"]
          .map((role) => `<option value="${role}" ${role === (editing?.role || "Viewer") ? "selected" : ""}>${role}</option>`)
          .join("")}
      </select>
      <input class="input" name="password" type="text" placeholder="${editing ? "Leave blank to keep password" : "Password"}" value="" ${editing ? "" : "required"} />
      <div class="full stack">
        <strong>Module permissions</strong>
        <div class="permission-grid">
          ${permissionModules
            .map(
              ([key, label]) => `
                <label class="permission-row">
                  <span>${label}</span>
                  <select class="select" name="perm-${key}">
                    <option value="none" ${access[key] === "none" ? "selected" : ""}>No access</option>
                    <option value="view" ${access[key] === "view" ? "selected" : ""}>View</option>
                    <option value="edit" ${access[key] === "edit" ? "selected" : ""}>Edit</option>
                  </select>
                </label>
              `
            )
            .join("")}
        </div>
      </div>
      <div class="button-row full">
        <button class="button" type="submit">${editing ? "Save team member" : "Add team member"}</button>
        ${
          editing
            ? `<button class="button-secondary" type="button" data-action="cancel-edit" data-collection="users">Cancel</button>`
            : ""
        }
      </div>
    </form>
  `;
}

function renderReadOnlyCard(message) {
  return `<div class="callout"><strong>Read-only access</strong><p style="margin-top: 10px;">${escapeHtml(message)}</p></div>`;
}

function renderAccessSummary(access) {
  const editModules = permissionModules.filter(([key]) => access?.[key] === "edit").map(([, label]) => label);
  const viewModules = permissionModules.filter(([key]) => access?.[key] === "view").map(([, label]) => label);

  const parts = [];
  if (editModules.length) parts.push(`Edit: ${editModules.join(", ")}`);
  if (viewModules.length) parts.push(`View: ${viewModules.join(", ")}`);
  if (!parts.length) parts.push("No access");
  return escapeHtml(parts.join(" | "));
}

function renderField(fieldDef, editing) {
  const value = editing ? fieldValue(editing, fieldDef.name) : "";
  if (fieldDef.kind === "select") {
    return `
      <select class="select ${fieldDef.full ? "full" : ""}" name="${fieldDef.name}">
        ${fieldDef.options
          .map(
            (option) =>
              `<option value="${escapeAttribute(option)}" ${String(value) === option ? "selected" : ""}>${escapeHtml(option)}</option>`
          )
          .join("")}
      </select>
    `;
  }

  if (fieldDef.kind === "textarea") {
    return `<textarea class="textarea ${fieldDef.full ? "full" : ""}" name="${fieldDef.name}" placeholder="${escapeAttribute(fieldDef.placeholder || "")}">${escapeHtml(String(value || ""))}</textarea>`;
  }

  return `<input class="input ${fieldDef.full ? "full" : ""}" name="${fieldDef.name}" type="${fieldDef.type}" placeholder="${escapeAttribute(fieldDef.placeholder || "")}" value="${escapeAttribute(String(value || ""))}" ${fieldDef.type === "number" ? 'step="0.01"' : ""} ${fieldDef.type === "time" ? "" : ""} />`;
}

function renderRowActions(collection, id) {
  return `
    <div class="inline-actions">
      <button class="action-link" type="button" data-action="edit" data-collection="${collection}" data-id="${id}">Edit</button>
      <button class="action-link danger" type="button" data-action="delete" data-collection="${collection}" data-id="${id}">Delete</button>
    </div>
  `;
}

function renderIconActions(collection, id) {
  return `
    <button class="action-link" type="button" data-action="edit" data-collection="${collection}" data-id="${id}">Edit</button>
    <button class="action-link danger" type="button" data-action="delete" data-collection="${collection}" data-id="${id}">Delete</button>
  `;
}

function handleInput(event) {
  if (event.target.id === "search-input") {
    state.search = event.target.value.trim().toLowerCase();
    if (state.search) {
      state.notificationsOpen = false;
    }
    render();
    return;
  }

  if (event.target.name === "role" && event.target.form?.id === "user-form") {
    const nextAccess = defaultAccessForRole(event.target.value);
    permissionModules.forEach(([key]) => {
      const select = event.target.form.querySelector(`[name="perm-${key}"]`);
      if (select) {
        select.value = nextAccess[key];
      }
    });
  }
}

async function handleClick(event) {
  const trigger = event.target.closest("[data-action], [data-nav], [data-preview-asset], [data-search-result]");
  if (!trigger) {
    return;
  }

  if (trigger.dataset.nav) {
    state.currentView = trigger.dataset.nav;
    state.notificationsOpen = false;
    state.flash = "";
    state.error = "";
    render();
    return;
  }

  if (trigger.dataset.previewAsset) {
    state.assetPreviewId = trigger.dataset.previewAsset;
    state.flash = "";
    state.error = "";
    render();
    return;
  }

  if (trigger.dataset.searchResult) {
    state.currentView = trigger.dataset.view || "overview";
    if (trigger.dataset.collection === "assets" && trigger.dataset.id) {
      state.assetPreviewId = trigger.dataset.id;
    }
    state.search = "";
    state.notificationsOpen = false;
    state.flash = "";
    state.error = "";
    render();
    return;
  }

  const action = trigger.dataset.action;

  if (action === "logout") {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch {
      // ignore logout failures and clear locally
    }
    clearSession();
    return;
  }

  if (action === "refresh-project-context") {
    await mutate(async () => {
      const response = await api("/project/refresh-context", { method: "POST" });
      state.data.project = response.project;
      state.flash = "Weather and location context refreshed.";
    });
    return;
  }

  if (action === "toggle-notifications") {
    state.notificationsOpen = !state.notificationsOpen;
    render();
    return;
  }

  if (action === "export") {
    exportData();
    return;
  }

  if (action === "reset") {
    await mutate(async () => {
      const data = await api("/admin/reset", { method: "POST" });
      state.data = data;
      state.user = data.user;
      state.flash = "Demo data reset.";
      resetEditing();
    });
    return;
  }

  if (action === "cancel-edit") {
    state.editing[trigger.dataset.collection] = null;
    state.flash = "";
    state.error = "";
    render();
    return;
  }

  if (action === "edit") {
    const { collection, id } = trigger.dataset;
    state.currentView = viewForCollection(collection);
    state.editing[collection] = findCollectionItem(collection, id);
    state.flash = "";
    state.error = "";
    render();
    return;
  }

  if (action === "delete") {
    const { collection, id } = trigger.dataset;
    await mutate(async () => {
      await api(`/${collection}/${id}`, { method: "DELETE" });
      state.data[collection] = state.data[collection].filter((item) => item.id !== id);
      state.data.dashboard = computeDashboard(state.data);
      state.editing[collection] = null;
      if (collection === "assets" && state.assetPreviewId === id) {
        state.assetPreviewId = state.data.assets[0]?.id || "";
      }
      state.flash = `${capitalize(collectionLabels[collection])} deleted.`;
    });
  }
}

async function handleSubmit(event) {
  const form = event.target;

  if (form.id === "login-form") {
    event.preventDefault();
    const formData = new FormData(form);
    await performLogin(formData.get("email"), formData.get("password"));
    return;
  }

  if (form.id === "project-form") {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    await mutate(async () => {
      const response = await api("/project", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      state.data.project = response.project;
      state.flash = "Project updated.";
    });
    return;
  }

  if (form.id === "settings-form") {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    await mutate(async () => {
      const response = await api("/settings", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      state.data.settings = response.settings;
      state.flash = "Global settings updated.";
    });
    return;
  }

  if (form.id === "callsheet-form") {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = prepareCallsheetPayload(formData);
    await mutate(async () => {
      const response = await api("/callsheet", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      state.data.callsheet = response.callsheet;
      state.flash = "Call sheet updated.";
    });
    return;
  }

  if (form.id === "user-form") {
    event.preventDefault();
    const formData = new FormData(form);
    const id = String(formData.get("id") || "").trim();
    const payload = prepareUserPayload(formData);
    await mutate(async () => {
      if (id) {
        const response = await api(`/users/${id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        replaceCollectionItem("users", response.item);
        if (state.user.id === response.item.id) {
          state.user = response.item;
          if (!canViewModule(state.currentView)) {
            state.currentView = firstVisibleView();
          }
        }
        state.flash = "Team member updated.";
      } else {
        const response = await api("/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        state.data.users.push(response.item);
        state.flash = "Team member added.";
      }
      state.editing.users = null;
    });
    return;
  }

  const collection = form.dataset.collectionForm;
  if (!collection) {
    return;
  }

  event.preventDefault();
  const formData = new FormData(form);
  const id = String(formData.get("id") || "").trim();
  const payload = collection === "assets"
    ? await prepareAssetPayload(formData)
    : prepareCollectionPayload(collection, formData);

  await mutate(async () => {
    if (id) {
      const response = await api(`/${collection}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      replaceCollectionItem(collection, response.item);
      state.flash = `${capitalize(collectionLabels[collection])} updated.`;
    } else {
      const response = await api(`/${collection}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      state.data[collection].unshift(response.item);
      state.flash = `${capitalize(collectionLabels[collection])} created.`;
    }

    state.data.dashboard = computeDashboard(state.data);
    state.editing[collection] = null;
    if (collection === "assets") {
      state.assetPreviewId = state.data.assets[0]?.id || "";
    }
  });
}

async function performLogin(email, password) {
  state.error = "";
  state.flash = "";
  render();

  try {
    const response = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      token: "",
    });

    state.token = response.token;
    window.localStorage.setItem(TOKEN_KEY, response.token);
    state.user = response.user;
    state.error = "";
    await refreshData();
  } catch (error) {
    state.error = error.message;
    render();
  }
}

async function performGoogleLogin(credential) {
  state.error = "";
  state.flash = "";
  render();

  try {
    const response = await api("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
      token: "",
    });

    state.token = response.token;
    window.localStorage.setItem(TOKEN_KEY, response.token);
    state.user = response.user;
    state.error = "";
    await refreshData();
  } catch (error) {
    state.error = error.message;
    render();
  }
}

async function mutate(work) {
  try {
    await work();
    state.error = "";
    render();
  } catch (error) {
    state.flash = "";
    state.error = error.message;
    render();
  }
}

function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  state.token = "";
  state.user = null;
  state.data = null;
  state.loading = false;
  state.flash = "";
  state.error = "";
  resetEditing();
  render();
}

function initializeGoogleAuth() {
  if (!runtimeConfig.googleClientId) {
    return;
  }

  if (!window.google?.accounts?.id) {
    window.setTimeout(initializeGoogleAuth, 150);
    return;
  }

  const slot = document.querySelector("#google-auth-slot");
  if (!slot) {
    return;
  }

  slot.innerHTML = "";
  window.google.accounts.id.initialize({
    client_id: runtimeConfig.googleClientId,
    callback: async (response) => {
      if (response.credential) {
        await performGoogleLogin(response.credential);
      }
    },
  });
  window.google.accounts.id.renderButton(slot, {
    theme: "outline",
    size: "large",
    text: "signin_with",
    shape: "pill",
    width: 320,
  });
}

function resetEditing() {
  Object.keys(state.editing).forEach((key) => {
    state.editing[key] = key === "project" ? false : null;
  });
}

function getEditingRecord(collection) {
  return state.editing[collection];
}

function findCollectionItem(collection, id) {
  return state.data[collection].find((item) => item.id === id) || null;
}

function replaceCollectionItem(collection, item) {
  state.data[collection] = state.data[collection].map((entry) => (entry.id === item.id ? item : entry));
}

function prepareCollectionPayload(collection, formData) {
  const entries = Object.fromEntries(formData.entries());
  delete entries.id;

  if (collection === "schedule" || collection === "scenes") {
    if (entries.scenes) entries.scenes = splitList(entries.scenes);
    if (entries.elements) entries.elements = splitList(entries.elements);
  }

  if (collection === "budget") {
    entries.estimated = Number(entries.estimated || 0);
    entries.actual = Number(entries.actual || 0);
  }

  return entries;
}

async function prepareAssetPayload(formData) {
  const payload = Object.fromEntries(formData.entries());
  delete payload.id;
  const file = formData.get("file");
  delete payload.file;

  if (file && typeof file === "object" && file.size) {
    payload.fileName = file.name;
    payload.mimeType = file.type || mimeTypeFromFileName(file.name);
    payload.sizeBytes = file.size;
    payload.fileContentBase64 = await readFileAsBase64(file);

    if (!payload.name) {
      payload.name = file.name.replace(/\.[^.]+$/, "");
    }

    if (!payload.type) {
      payload.type = inferAssetType(payload.mimeType, file.name);
    }
  }

  return payload;
}

function prepareUserPayload(formData) {
  const payload = Object.fromEntries(formData.entries());
  delete payload.id;
  payload.access = Object.fromEntries(
    permissionModules.map(([key]) => [key, String(formData.get(`perm-${key}`) || "none")])
  );
  permissionModules.forEach(([key]) => {
    delete payload[`perm-${key}`];
  });
  if (!payload.password) {
    delete payload.password;
  }
  return payload;
}

function prepareCallsheetPayload(formData) {
  return {
    status: String(formData.get("status") || "").trim(),
    unit: String(formData.get("unit") || "").trim(),
    shootDate: String(formData.get("shootDate") || "").trim(),
    crewCall: String(formData.get("crewCall") || "").trim(),
    castCall: String(formData.get("castCall") || "").trim(),
    firstShot: String(formData.get("firstShot") || "").trim(),
    mealBreak: String(formData.get("mealBreak") || "").trim(),
    wrapTime: String(formData.get("wrapTime") || "").trim(),
    locationDetails: String(formData.get("locationDetails") || "").trim(),
    basecamp: String(formData.get("basecamp") || "").trim(),
    sceneCodes: splitList(String(formData.get("sceneCodes") || "")),
    hospitalName: String(formData.get("hospitalName") || "").trim(),
    hospitalPhone: String(formData.get("hospitalPhone") || "").trim(),
    weatherNotes: String(formData.get("weatherNotes") || "").trim(),
    additionalNotes: String(formData.get("additionalNotes") || "").trim(),
    distribution: String(formData.get("distribution") || "").trim(),
    approvalNotes: String(formData.get("approvalNotes") || "").trim(),
    transportNotes: String(formData.get("transportNotes") || "").trim(),
    parkingNotes: String(formData.get("parkingNotes") || "").trim(),
    footer: String(formData.get("footer") || "").trim(),
    attachedAssetIds: formData.getAll("attachedAssetIds").map((value) => String(value).trim()).filter(Boolean),
  };
}

async function api(path, options = {}) {
  const token = options.token !== undefined ? options.token : state.token;
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload.detail ? `${payload.error || "Request failed"}: ${payload.detail}` : payload.error || "Request failed";
    throw new Error(message);
  }

  return payload;
}

function exportData() {
  const blob = new Blob([JSON.stringify(state.data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(state.data.project.title)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function filterItems(items, keys) {
  if (!state.search) return items;

  return items.filter((item) =>
    keys.some((key) => {
      const value = item[key];
      const normalized = Array.isArray(value) ? value.join(" ") : String(value ?? "");
      return normalized.toLowerCase().includes(state.search);
    })
  );
}

function viewForCollection(collection) {
  if (collection === "scenes") return "breakdown";
  if (collection === "users") return "team";
  return collection;
}

function canViewModule(moduleKey) {
  if (moduleKey === "overview") return Boolean(state.user);
  if (moduleKey === "breakdown") moduleKey = "scenes";
  if (!state.user?.access) return false;
  return state.user.access[moduleKey] === "view" || state.user.access[moduleKey] === "edit";
}

function canEditModule(moduleKey) {
  if (moduleKey === "overview") return false;
  if (moduleKey === "breakdown") moduleKey = "scenes";
  if (!state.user?.access) return false;
  return state.user.access[moduleKey] === "edit";
}

function firstVisibleView() {
  return navItems.find(([key]) => canViewModule(key))?.[0] || "overview";
}

function splitList(value) {
  return String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function computeDashboard(data) {
  const estimated = sum(data.budget, "estimated");
  const actual = sum(data.budget, "actual");
  const pendingApprovals = data.assets.filter((item) => item.status === "In review").length + (data.callsheet?.status === "In review" ? 1 : 0);
  return {
    stats: [
      { label: "Scenes", value: data.scenes.length, note: "Tracked breakdown cards." },
      { label: "Shoot Days", value: data.schedule.length, note: "Scheduled unit days." },
      { label: "Open Tasks", value: data.tasks.filter((item) => item.status !== "Done").length, note: "Action items still active." },
      { label: "Pending approvals", value: pendingApprovals, note: "Docs and call sheets waiting on review." },
    ],
    upcomingDays: data.schedule.slice(0, 4),
    priorityTasks: data.tasks.filter((item) => item.priority === "high" || item.status !== "Done").slice(0, 6),
    latestAssets: data.assets.slice(0, 5),
  };
}

function deriveGlobalSearchResults(data, query) {
  const needle = String(query || "").trim().toLowerCase();
  if (!needle) return [];

  const results = [];
  const push = (entry) => {
    if (results.length < 12) {
      results.push(entry);
    }
  };
  const matches = (...parts) => parts.some((part) => String(part || "").toLowerCase().includes(needle));

  if (canViewModule("project") && matches(data.project.title, data.project.tagline, data.project.director, data.project.producer, data.project.location)) {
    push({
      view: "project",
      module: "Project",
      title: data.project.title,
      summary: `${data.project.tagline || "Project profile"} · ${data.project.locationLabel || data.project.location || "Location TBD"}`,
      meta: data.project.status || "Project",
      status: "",
    });
  }

  if (canViewModule("settings") && matches(data.settings.studioName, data.settings.companyName, data.settings.defaultBasecamp, data.settings.emergencyHospital, data.settings.timezone)) {
    push({
      view: "settings",
      module: "Global Settings",
      title: data.settings.studioName || "Studio defaults",
      summary: `${data.settings.companyName || "Studio"} · ${data.settings.currency || "EUR"} · ${data.settings.timezone || "Timezone TBD"}`,
      meta: data.settings.locale || "Locale",
      status: "",
    });
  }

  if (canViewModule("callsheet") && matches(data.callsheet.status, data.callsheet.unit, data.callsheet.locationDetails, data.callsheet.distribution, data.callsheet.additionalNotes, data.callsheet.sceneCodes?.join(", "))) {
    push({
      view: "callsheet",
      module: "Call Sheet",
      title: `${data.callsheet.unit || "Main Unit"} · ${formatDate(data.callsheet.shootDate)}`,
      summary: `${data.callsheet.locationDetails || "Location TBD"} · scenes ${String(data.callsheet.sceneCodes || []).join(", ") || "TBD"}`,
      meta: data.callsheet.status || "Draft",
      status: data.callsheet.status || "Draft",
    });
  }

  if (canViewModule("schedule")) {
    data.schedule
      .filter((item) => matches(item.day, item.location, item.notes, item.scenes?.join(", "), item.status))
      .slice(0, 3)
      .forEach((item) => push({
        id: item.id,
        collection: "schedule",
        view: "schedule",
        module: "Schedule",
        title: `${item.day} · ${formatDate(item.date)}`,
        summary: `${item.location} · call ${item.callTime}`,
        meta: item.scenes.join(", "),
        status: humanizeStatus(item.status),
      }));
  }

  if (canViewModule("scenes")) {
    data.scenes
      .filter((item) => matches(item.code, item.title, item.location, item.cast, item.elements?.join(", ")))
      .slice(0, 3)
      .forEach((item) => push({
        id: item.id,
        collection: "scenes",
        view: "breakdown",
        module: "Breakdown",
        title: `${item.code} · ${item.title}`,
        summary: `${item.location} · ${item.setup}`,
        meta: item.cast,
        status: "",
      }));
  }

  if (canViewModule("contacts")) {
    data.contacts
      .filter((item) => matches(item.name, item.role, item.dept, item.phone, item.email))
      .slice(0, 3)
      .forEach((item) => push({
        id: item.id,
        collection: "contacts",
        view: "contacts",
        module: "Contacts",
        title: item.name,
        summary: `${item.role} · ${item.phone}`,
        meta: item.dept || "Contact",
        status: "",
      }));
  }

  if (canViewModule("tasks")) {
    data.tasks
      .filter((item) => matches(item.title, item.owner, item.priority, item.status, item.due))
      .slice(0, 3)
      .forEach((item) => push({
        id: item.id,
        collection: "tasks",
        view: "tasks",
        module: "Tasks",
        title: item.title,
        summary: `${item.owner} · due ${formatDate(item.due)}`,
        meta: item.priority,
        status: item.status === "Done" ? "Approved" : item.status === "In Progress" ? "In review" : "Draft",
      }));
  }

  if (canViewModule("budget")) {
    data.budget
      .filter((item) => matches(item.category, item.estimated, item.actual))
      .slice(0, 3)
      .forEach((item) => push({
        id: item.id,
        collection: "budget",
        view: "budget",
        module: "Budget",
        title: item.category,
        summary: `Estimated ${money(item.estimated)} · Actual ${money(item.actual)}`,
        meta: formatCurrencyDelta(Number(item.actual) - Number(item.estimated)),
        status: "",
      }));
  }

  if (canViewModule("assets")) {
    data.assets
      .filter((item) => matches(item.name, item.type, item.owner, item.tag, item.status, item.version, item.approvalNotes))
      .slice(0, 4)
      .forEach((item) => push({
        id: item.id,
        collection: "assets",
        view: "assets",
        module: "Assets",
        title: item.name,
        summary: `${item.type} · ${item.owner} · ${item.tag || "Document"}`,
        meta: item.version ? `v${item.version}` : "Asset",
        status: item.status || "Draft",
      }));
  }

  if (canViewModule("team")) {
    data.users
      .filter((item) => matches(item.name, item.email, item.role, item.department, item.title))
      .slice(0, 3)
      .forEach((item) => push({
        id: item.id,
        collection: "users",
        view: "team",
        module: "Team & Access",
        title: item.name,
        summary: `${item.role} · ${item.email}`,
        meta: item.department || "Team",
        status: "",
      }));
  }

  return results;
}

function deriveNotifications(data) {
  const items = [];
  const today = new Date();

  if (canViewModule("callsheet") && data.callsheet?.status === "In review") {
    items.push({
      view: "callsheet",
      module: "Call Sheet",
      title: "Call sheet is waiting on approval",
      message: `${data.callsheet.unit || "Main Unit"} for ${formatDate(data.callsheet.shootDate)} is marked In review.`,
      level: "In review",
      levelLabel: "Review",
      when: data.callsheet.lastEditedAt ? formatDateTime(data.callsheet.lastEditedAt) : "",
    });
  }

  if (canViewModule("assets")) {
    data.assets
      .filter((item) => item.status === "In review")
      .slice(0, 3)
      .forEach((item) =>
        items.push({
          view: "assets",
          collection: "assets",
          id: item.id,
          module: "Assets",
          title: `${item.name} needs approval`,
          message: `${item.type} · ${item.tag || "Document"} is currently in review.`,
          level: "In review",
          levelLabel: "Review",
          when: item.lastEditedAt ? formatDateTime(item.lastEditedAt) : "",
        })
      );
  }

  if (canViewModule("tasks")) {
    data.tasks
      .filter((item) => item.status !== "Done" && item.due && new Date(item.due) < today)
      .slice(0, 3)
      .forEach((item) =>
        items.push({
          view: "tasks",
          collection: "tasks",
          id: item.id,
          module: "Tasks",
          title: `${item.title} is overdue`,
          message: `${item.owner} was due ${formatDate(item.due)}.`,
          level: "danger",
          levelLabel: "Overdue",
          when: formatDate(item.due),
        })
      );
  }

  if (canViewModule("callsheet") && data.callsheet?.status === "Published") {
    items.push({
      view: "callsheet",
      module: "Call Sheet",
      title: "Latest call sheet is published",
      message: `${data.callsheet.unit || "Main Unit"} is ready to distribute.`,
      level: "Approved",
      levelLabel: "Published",
      when: data.callsheet.publishedAt ? formatDateTime(data.callsheet.publishedAt) : "",
    });
  }

  return items.slice(0, 6);
}

function resolveCallsheet() {
  const raw = state.data.callsheet || {};
  const project = state.data.project || {};
  const settings = state.data.settings || {};
  const day = state.data.schedule?.[0] || {};
  const sceneCodes = raw.sceneCodes?.length ? raw.sceneCodes : day.scenes || [];
  const sceneCards = state.data.scenes.filter((scene) => sceneCodes.includes(scene.code));
  const castNames = [...new Set(sceneCards.flatMap((scene) => splitList(scene.cast || "")))];
  const attachments = state.data.assets.filter((asset) => (raw.attachedAssetIds || []).includes(asset.id));
  const contacts = state.data.contacts.slice(0, 6);

  return {
    status: raw.status || "Draft",
    unit: raw.unit || "Main Unit",
    dayLabel: day.day || "No day scheduled",
    shootDate: raw.shootDate || day.date || "",
    shootDateRaw: raw.shootDate || day.date || "",
    crewCall: raw.crewCall || day.callTime || "TBD",
    crewCallRaw: raw.crewCall || day.callTime || "",
    castCall: raw.castCall || raw.crewCall || day.callTime || "",
    castCallRaw: raw.castCall || raw.crewCall || day.callTime || "",
    firstShot: raw.firstShot || "",
    firstShotRaw: raw.firstShot || "",
    mealBreak: raw.mealBreak || "",
    mealBreakRaw: raw.mealBreak || "",
    wrapTime: raw.wrapTime || "",
    wrapTimeRaw: raw.wrapTime || "",
    locationDetails: raw.locationDetails || day.location || project.locationLabel || project.location || "TBD",
    basecamp: raw.basecamp || settings.defaultBasecamp || project.locationLabel || project.location || "TBD",
    sceneCodes,
    sceneCards,
    castNames,
    attachments,
    contacts,
    hospitalName: raw.hospitalName || settings.emergencyHospital || "TBD",
    hospitalPhone: raw.hospitalPhone || settings.emergencyPhone || "TBD",
    transportNotes: raw.transportNotes || settings.transportNotes || "",
    parkingNotes: raw.parkingNotes || settings.parkingNotes || "",
    weather: project.weather || "Weather sync pending",
    weatherNotesRaw: raw.weatherNotes || "",
    weatherNotes: raw.weatherNotes || "",
    additionalNotes: raw.additionalNotes || day.notes || "",
    distribution: raw.distribution || "",
    approvalNotes: raw.approvalNotes || "",
    footer: raw.footer || settings.callSheetFooter || "",
    sunrise: formatTime(project.sunrise),
    sunset: formatTime(project.sunset),
    attachedAssetIds: raw.attachedAssetIds || [],
    approvedBy: raw.approvedBy || "",
    approvedAt: raw.approvedAt || "",
    publishedAt: raw.publishedAt || "",
    lastEditedBy: raw.lastEditedBy || "",
    lastEditedAt: raw.lastEditedAt || "",
  };
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleDateString(activeLocale(), { day: "numeric", month: "short", year: "numeric" });
}

function money(value) {
  return new Intl.NumberFormat(currencyLocale(), {
    style: "currency",
    currency: activeCurrency(),
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function activeCurrency() {
  return state.data?.settings?.currency || state.data?.project?.currency || "EUR";
}

function activeLocale() {
  return state.data?.settings?.locale || currencyLocaleFallback(activeCurrency());
}

function activeTimezone() {
  return state.data?.settings?.timezone || state.data?.project?.timezone || "Europe/Ljubljana";
}

function currencyLocale() {
  return activeLocale();
}

function currencyLocaleFallback(currency) {
  const map = {
    EUR: "sl-SI",
    USD: "en-US",
    GBP: "en-GB",
  };
  return map[currency] || "sl-SI";
}

function formatMetricValue(value) {
  if (Math.abs(value) > 1000) return money(value);
  return String(value);
}

function formatCurrencyDelta(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${money(value)}`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "not synced yet";
  return date.toLocaleString(activeLocale(), {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: activeTimezone(),
  });
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return date.toLocaleTimeString(activeLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: activeTimezone(),
  });
}

function formatFileSize(bytes) {
  const size = Number(bytes || 0);
  if (!size) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeTypeFromFileName(fileName) {
  const extension = String(fileName || "").split(".").pop()?.toLowerCase();
  const map = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    gif: "image/gif",
    txt: "text/plain",
  };
  return map[extension] || "application/octet-stream";
}

function inferAssetType(mimeType, fileName) {
  if (mimeType === "application/pdf") return "PDF";
  if (String(mimeType).startsWith("image/")) return "Image";
  if (mimeType === "text/plain") return "Doc";
  const extension = String(fileName || "").split(".").pop()?.toLowerCase();
  if (["doc", "docx", "txt"].includes(extension)) return "Doc";
  if (["xls", "xlsx", "csv"].includes(extension)) return "Spreadsheet";
  return "Other";
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

function humanizeStatus(status) {
  const map = { ready: "Ready", shooting: "Shooting", risk: "At Risk" };
  return map[status] || status;
}

function taskStatusToBadge(status) {
  if (status === "Done") return "done";
  if (status === "In Progress") return "shooting";
  return "risk";
}

function workflowStatusClass(status) {
  if (status === "danger") return "status danger";
  if (status === "warning") return "status warning";
  if (status === "success") return "status success";
  if (status === "Approved" || status === "Published") return "status success";
  if (status === "In review") return "status warning";
  if (status === "Archived") return "status";
  return "status";
}

function statusClass(status) {
  if (status === "risk") return "status warning";
  if (status === "shooting") return "status danger";
  if (status === "done") return "status success";
  return "status";
}

function priorityClass(priority) {
  if (priority === "high") return "status danger";
  if (priority === "low") return "status";
  return "status warning";
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function defaultAccessForRole(role) {
  const templates = {
    Producer: Object.fromEntries(permissionModules.map(([key]) => [key, "edit"])),
    Admin: Object.fromEntries(permissionModules.map(([key]) => [key, "edit"])),
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

  return templates[role] || templates.Viewer;
}

function field(name, type, placeholder = "", full = false) {
  return { kind: "input", name, type, placeholder, full };
}

function textareaField(name, placeholder = "", full = false) {
  return { kind: "textarea", name, placeholder, full };
}

function selectField(name, options, full = false) {
  return { kind: "select", name, options, full };
}

function fieldValue(item, name) {
  const value = item[name];
  if (Array.isArray(value)) return value.join(", ");
  return value ?? "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}
