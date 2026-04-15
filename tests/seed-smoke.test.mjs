import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const seedSql = readFileSync(resolve(process.cwd(), "supabase/seed.sql"), "utf8");

test("seed includes the required demo auth accounts", () => {
  assert.match(seedSql, /consumer@demo\.radardomace\.local/);
  assert.match(seedSql, /provider@demo\.radardomace\.local/);
  assert.match(seedSql, /claimant@demo\.radardomace\.local/);
  assert.match(seedSql, /admin@demo\.radardomace\.local/);
});

test("seed contains at least twelve deterministic providers", () => {
  const providerMatches = [...seedSql.matchAll(/00000000-0000-0000-0000-0000000010\d{2}/g)];
  const uniqueProviderIds = new Set(providerMatches.map((match) => match[0]));
  assert.ok(uniqueProviderIds.size >= 12, `expected >= 12 providers, received ${uniqueProviderIds.size}`);
});

test("seed includes claims, favorites, analytics, and offers", () => {
  assert.match(seedSql, /insert into public\.claim_requests/i);
  assert.match(seedSql, /insert into public\.favorites/i);
  assert.match(seedSql, /insert into public\.analytics_events/i);
  assert.match(seedSql, /insert into public\.product_offers/i);
});
