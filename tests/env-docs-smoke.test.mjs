import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const rootEnv = readFileSync(resolve(process.cwd(), ".env.example"), "utf8");
const webEnv = readFileSync(resolve(process.cwd(), "apps/web/.env.example"), "utf8");
const mobileEnv = readFileSync(resolve(process.cwd(), "apps/mobile/.env.example"), "utf8");

test("root env example documents shared staging variables", () => {
  for (const key of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_PROVIDER_IMAGES_BUCKET",
    "EXPO_PUBLIC_APP_SCHEME",
  ]) {
    assert.match(rootEnv, new RegExp(`^${key}=`, "m"));
  }
});

test("web and mobile env examples stay aligned with required surface variables", () => {
  assert.match(webEnv, /^NEXT_PUBLIC_PROVIDER_IMAGES_BUCKET=/m);
  assert.match(mobileEnv, /^EXPO_PUBLIC_PROVIDER_IMAGES_BUCKET=/m);
  assert.match(mobileEnv, /^EXPO_PUBLIC_WEB_URL=/m);
});
