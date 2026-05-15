import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const databaseUrl = new URL(connectionString);

if (process.env.NODE_ENV !== "production") {
  databaseUrl.searchParams.set("sslmode", "no-verify");
}

const globalForPrisma = globalThis as {
  __financePrisma__?: PrismaClient;
};

const adapter = new PrismaPg(databaseUrl.toString());

export const db = globalForPrisma.__financePrisma__ ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__financePrisma__ = db;
}
