interface ServerEnvironment {
  VERCEL?: string;
  PUBLIC_DEMO_MODE?: string;
  VERCEL_PRIVATE_DATA_ACCESS?: string;
  SEED_DEMO_DATA?: string;
  MONGO_DB_NAME?: string;
  MONGO_DEMO_DB_NAME?: string;
}

export function isPublicDemoMode(env: ServerEnvironment): boolean {
  return env.PUBLIC_DEMO_MODE === "true" ||
    (env.VERCEL === "1" && env.VERCEL_PRIVATE_DATA_ACCESS !== "true");
}

export function getMongoDatabaseName(env: ServerEnvironment): string {
  const privateDatabaseName = env.MONGO_DB_NAME?.trim() || "arogya_vahini";
  if (isPublicDemoMode(env) || env.SEED_DEMO_DATA === "true") {
    const demoDatabaseName = env.MONGO_DEMO_DB_NAME?.trim();
    if (!demoDatabaseName) {
      throw new Error("MONGO_DEMO_DB_NAME is required in public demo mode and must refer to a database containing only synthetic demo data.");
    }
    if (demoDatabaseName === privateDatabaseName) {
      throw new Error("MONGO_DEMO_DB_NAME must be different from MONGO_DB_NAME to keep public demo data separate.");
    }
    return demoDatabaseName;
  }

  return privateDatabaseName;
}

export function shouldSeedDemoData(env: ServerEnvironment): boolean {
  if (env.VERCEL === "1") {
    return isPublicDemoMode(env) && env.SEED_DEMO_DATA === "true";
  }
  return env.SEED_DEMO_DATA === "true";
}
