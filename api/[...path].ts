import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../server";

let appPromise: ReturnType<typeof createApp> | undefined;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  appPromise ??= createApp(false);
  const { app } = await appPromise;
  app(req, res);
}