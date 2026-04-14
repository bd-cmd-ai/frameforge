const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { createStore } = require("../backend");

function createTempStore(options = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "frameforge-"));
  const seedFile = path.join(root, "seed.json");
  const dataFile = path.join(root, "runtime.json");
  const uploadsDir = path.join(root, "uploads", "assets");
  fs.mkdirSync(path.dirname(seedFile), { recursive: true });
  fs.writeFileSync(
    seedFile,
    JSON.stringify(
      {
        settings: {
          studioName: "FrameForge",
          companyName: "Production Office",
          locale: "sl-SI",
          currency: "EUR",
          timezone: "Europe/Ljubljana",
          weatherLocation: "Ljubljana, Slovenia",
          weatherUpdatedAt: "",
          forecastDays: [{ date: "2026-05-12", summary: "Clear", min: 8, max: 19, sunrise: "05:18", sunset: "20:34" }],
        },
        project: {
          title: "Midnight Sun",
          format: "Feature",
          stage: "Prep",
          shootStart: "2026-05-12",
          shootEnd: "2026-07-02",
          location: "Ljubljana, Slovenia",
          description: "",
        },
        users: [
          {
            id: "u1",
            name: "Producer",
            email: "producer@frameforge.app",
            role: "producer",
            authProvider: "local",
            password: "demo123",
            permissions: {
              dashboard: "edit",
              project: "edit",
              callsheets: "edit",
              assets: "edit",
              settings: "edit",
              team: "edit",
            },
            createdAt: "2026-04-14T08:00:00.000Z",
          },
        ],
        callsheets: [],
        assets: [],
      },
      null,
      2
    )
  );
  return createStore({
    seedFile,
    dataFile,
    uploadsDir,
    bootstrapAdminEmails: options.bootstrapAdminEmails || [],
  });
}

test("password login succeeds for seeded producer", async () => {
  const store = createTempStore();
  const session = await store.loginWithPassword(
    { email: "producer@frameforge.app", password: "demo123" },
    "test-secret"
  );
  assert.ok(session.token);
  assert.equal(session.user.email, "producer@frameforge.app");
});

test("bootstrap admin Google login auto-creates invited admin", async () => {
  const store = createTempStore({ bootstrapAdminEmails: ["owner@example.com"] });
  const session = await store.loginWithGoogle(
    { email: "owner@example.com", name: "Owner" },
    "test-secret",
    ""
  );
  assert.equal(session.user.email, "owner@example.com");
  assert.equal(store.getState().users.length, 2);
});

test("callsheet stores and resolves forecast by shoot date", async () => {
  const store = createTempStore();
  const created = await store.createCallsheet({
    title: "Shoot Day 1",
    shootDate: "2026-05-12",
    location: "Ljubljana, Slovenia",
  });
  const forecast = store.getForecastForDate(created.shootDate);
  assert.equal(created.title, "Shoot Day 1");
  assert.equal(forecast.summary, "Clear");
});
