import { PrismaClient } from "@prisma/client";

declare global {
  // avoid multiple instances in dev with hot reload
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.PRISMA_LOG?.split(",") ?? ["error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
