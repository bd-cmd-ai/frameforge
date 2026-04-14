const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const {
  createStore,
  buildDashboard,
  sanitizeCollectionItem,
  sanitizeUser,
  canEditModule,
  canViewModule,
  normalizeAccess,
} = require("../backend");

test("store bootstraps from seed and supports CRUD operations", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "frameforge-"));
  const dataFile = path.join(tempRoot, "production-db.json");
  const store = createStore(dataFile);

  await store.init();

  const initial = store.getPublicState();
  assert.equal(initial.project.title, "Midnight Sun");
  assert.ok(initial.schedule.length > 0);

  const created = await store.createItem("tasks", {
    title: "Book intimacy coordinator",
    owner: "Production",
    due: "2026-05-30",
    priority: "high",
    status: "Not Started",
  });

  assert.equal(created.title, "Book intimacy coordinator");

  const updated = await store.updateItem("tasks", created.id, {
    status: "In Progress",
  });

  assert.equal(updated.status, "In Progress");

  const deleted = await store.deleteItem("tasks", created.id);
  assert.equal(deleted, true);

  const stateAfterDelete = store.getPublicState();
  assert.equal(stateAfterDelete.tasks.some((item) => item.id === created.id), false);
});

test("store can bootstrap runtime data from a tracked seed file and reset back to it", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "frameforge-seed-"));
  const seedFile = path.join(tempRoot, "production-db.json");
  const runtimeFile = path.join(tempRoot, "production-db.local.json");

  await fs.writeFile(
    seedFile,
    JSON.stringify(
      {
        project: {
          title: "Seed Project",
        },
        users: [
          {
            id: "seed-user",
            name: "Seed Producer",
            email: "seed@frameforge.app",
            password: "demo123",
            role: "Producer",
            title: "Producer",
            department: "Production",
            access: {
              project: "edit",
              schedule: "edit",
              scenes: "edit",
              callsheet: "edit",
              contacts: "edit",
              tasks: "edit",
              budget: "edit",
              assets: "edit",
              team: "edit",
            },
          },
        ],
      },
      null,
      2
    )
  );

  const store = createStore({ dataFile: runtimeFile, seedFile });
  await store.init();

  const initial = store.getPublicState();
  assert.equal(initial.project.title, "Seed Project");

  await store.updateProject({ title: "Local Override" });
  assert.equal(store.getPublicState().project.title, "Local Override");

  await store.reset();
  assert.equal(store.getPublicState().project.title, "Seed Project");
});

test("sanitizeCollectionItem normalizes lists and numbers", () => {
  const schedule = sanitizeCollectionItem("schedule", {
    day: "Day 1",
    date: "2026-06-01",
    location: "Stage",
    callTime: "07:00",
    notes: "test",
    scenes: "1A, 1B , 2",
    status: "ready",
  }, "schedule-1");

  assert.deepEqual(schedule.scenes, ["1A", "1B", "2"]);

  const budget = sanitizeCollectionItem("budget", {
    category: "Props",
    estimated: "1200",
    actual: "980",
  }, "budget-1");

  assert.equal(budget.estimated, 1200);
  assert.equal(budget.actual, 980);
});

test("dashboard metrics are derived from current state", () => {
  const dashboard = buildDashboard({
    scenes: [{ id: "1" }, { id: "2" }],
    schedule: [{ id: "a" }],
    tasks: [
      { id: "t1", priority: "high", status: "Not Started" },
      { id: "t2", priority: "low", status: "Done" },
    ],
    budget: [{ estimated: 10, actual: 15 }],
    assets: [{ id: "asset-1" }],
  });

  assert.equal(dashboard.stats[0].value, 2);
  assert.equal(dashboard.stats[1].value, 1);
  assert.equal(dashboard.stats[2].value, 1);
  assert.equal(dashboard.stats[3].value, 5);
  assert.equal(dashboard.priorityTasks.length, 1);
});

test("user permissions support viewers and full-access producers", () => {
  const viewer = sanitizeUser(
    { name: "Viewer", email: "viewer@test.com", role: "Viewer", access: normalizeAccess("Viewer") },
    "user-1"
  );
  const producer = sanitizeUser(
    { name: "Producer", email: "producer@test.com", role: "Producer", access: normalizeAccess("Producer") },
    "user-2"
  );

  assert.equal(canViewModule(viewer, "budget"), false);
  assert.equal(canEditModule(viewer, "budget"), false);
  assert.equal(canEditModule(viewer, "team"), false);
  assert.equal(canViewModule(viewer, "contacts"), false);
  assert.equal(canViewModule(viewer, "schedule"), true);
  assert.equal(canEditModule(producer, "budget"), true);
  assert.equal(canEditModule(producer, "team"), true);
});

test("normalizeAccess supports no-access states", () => {
  const access = normalizeAccess("Crew", { budget: "none", assets: "view", tasks: "edit" });
  assert.equal(access.budget, "none");
  assert.equal(access.assets, "view");
  assert.equal(access.tasks, "edit");
});
