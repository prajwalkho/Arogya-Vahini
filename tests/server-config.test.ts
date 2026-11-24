import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMongoDatabaseName, isPublicDemoMode, shouldSeedDemoData } from "../server-config";

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

  it("uses a separate required database for public demo mode", () => {
    assert.equal(getMongoDatabaseName({
      VERCEL: "1",
      MONGO_DB_NAME: "private",
      MONGO_DEMO_DB_NAME: "public-demo",
    }), "public-demo");
    assert.throws(() => getMongoDatabaseName({ VERCEL: "1" }), /MONGO_DEMO_DB_NAME is required/);
    assert.throws(() => getMongoDatabaseName({
      VERCEL: "1",
      MONGO_DB_NAME: "same",
      MONGO_DEMO_DB_NAME: "same",
    }), /must be different/);
  });

  it("uses the private database when Vercel access is protected", () => {
    assert.equal(getMongoDatabaseName({
      VERCEL: "1",
      VERCEL_PRIVATE_DATA_ACCESS: "true",
      MONGO_DB_NAME: "private",
      MONGO_DEMO_DB_NAME: "public-demo",
    }), "private");
  });

  it("uses the separate demo database whenever demo seeding is enabled", () => {
    assert.equal(getMongoDatabaseName({
      MONGO_DB_NAME: "private",
      MONGO_DEMO_DB_NAME: "public-demo",
      SEED_DEMO_DATA: "true",
    }), "public-demo");
  });
});

describe("demo data seeding", () => {
  it("does not seed data in private Vercel mode", () => {
    assert.equal(shouldSeedDemoData({ VERCEL: "1" }), false);
    assert.equal(shouldSeedDemoData({
      VERCEL: "1",
      VERCEL_PRIVATE_DATA_ACCESS: "true",
      SEED_DEMO_DATA: "true",
    }), false);
  });

  it("allows seeding only in explicitly configured public demo mode", () => {
    assert.equal(shouldSeedDemoData({
      VERCEL: "1",
      PUBLIC_DEMO_MODE: "true",
      SEED_DEMO_DATA: "true",
    }), true);
  });

  it("requires explicit local seeding opt-in", () => {
    assert.equal(shouldSeedDemoData({}), false);
    assert.equal(shouldSeedDemoData({ SEED_DEMO_DATA: "true" }), true);
    assert.equal(shouldSeedDemoData({ SEED_DEMO_DATA: "false" }), false);
  });
});
