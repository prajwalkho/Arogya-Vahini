import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPublicDemoMode, shouldSeedDemoData } from "../server-config";

describe("Vercel data access", () => {
  it("denies private data on Vercel unless explicitly enabled", () => {
    assert.equal(isPublicDemoMode({ VERCEL: "1" }), true);
    assert.equal(isPublicDemoMode({ VERCEL: "1", VERCEL_PRIVATE_DATA_ACCESS: "true" }), false);
  });

  it("keeps explicit public demo mode private-data-safe", () => {
    assert.equal(isPublicDemoMode({
      VERCEL: "1",
      PUBLIC_DEMO_MODE: "true",
      VERCEL_PRIVATE_DATA_ACCESS: "true",
    }), true);
  });
});

describe("demo data seeding", () => {
  it("does not seed data on Vercel", () => {
    assert.equal(shouldSeedDemoData({ VERCEL: "1" }), false);
  });

  it("allows explicit demo seeding on Vercel", () => {
    assert.equal(shouldSeedDemoData({ VERCEL: "1", SEED_DEMO_DATA: "true" }), true);
  });

  it("preserves local seeding by default and supports opting out", () => {
    assert.equal(shouldSeedDemoData({}), true);
    assert.equal(shouldSeedDemoData({ SEED_DEMO_DATA: "false" }), false);
  });
});
