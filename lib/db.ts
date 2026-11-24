import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";

// Neon on Vercel (Fluid compute): node-postgres over the pooled (-pooler) DATABASE_URL.
// attachDatabasePool lets Vercel close idle clients before a function instance is suspended.
// Migrations use the direct DATABASE_URL_UNPOOLED via `directUrl` in schema.prisma.
function createClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10, idleTimeoutMillis: 5_000 });
  attachDatabasePool(pool);
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") g.prisma = db;
