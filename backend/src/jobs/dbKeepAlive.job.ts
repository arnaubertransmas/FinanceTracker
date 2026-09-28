import cron from "node-cron";
import { prisma } from "../lib/prisma";

export function scheduleDbKeepAliveJob() {
  cron.schedule("*/4 * * * *", () => {
    prisma.$queryRaw`SELECT 1`.catch((error) => {
      console.error("DB keep-alive ping failed:", error);
    });
  });
}
