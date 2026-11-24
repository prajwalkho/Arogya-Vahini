interface ServerEnvironment {
  VERCEL?: string;
  PUBLIC_DEMO_MODE?: string;
  VERCEL_PRIVATE_DATA_ACCESS?: string;
  SEED_DEMO_DATA?: string;
}

export function isPublicDemoMode(env: ServerEnvironment): boolean {
  return env.PUBLIC_DEMO_MODE === "true" ||
    (env.VERCEL === "1" && env.VERCEL_PRIVATE_DATA_ACCESS !== "true");
}

export function shouldSeedDemoData(env: ServerEnvironment): boolean {
  return env.SEED_DEMO_DATA === "true" ||
    (env.VERCEL !== "1" && env.SEED_DEMO_DATA !== "false");
}
