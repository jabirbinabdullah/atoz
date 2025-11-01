import { PrismaClient } from "@prisma/client";

declare global {
  // allow global prisma cache in development to prevent exhausting
  // database connections when hot-reloading
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__prisma = prisma;
