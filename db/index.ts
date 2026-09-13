import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Missing DB binding. Please ensure that the DB binding is configured in your Cloudflare Workers environment.",
    );
  }

  return drizzle(env.DB, { schema });
}
