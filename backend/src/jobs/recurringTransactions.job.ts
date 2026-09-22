import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { addRecurrencePeriod, todayDateOnly } from "../lib/dates";

const MAX_CATCHUP_ITERATIONS = 366;

export async function runRecurringTransactionsJob(): Promise<{ templatesProcessed: number; instancesCreated: number }> {
  const today = todayDateOnly();

  const templates = await prisma.transaction.findMany({
    where: {
      recurring: true,
      recurrenceActive: true,
      nextOccurrenceDate: { lte: today },
    },
  });

  let instancesCreated = 0;

  for (const template of templates) {
    instancesCreated += await prisma.$transaction(async (tx) => {
      let cursor = template.nextOccurrenceDate!;
      let created = 0;

      for (let i = 0; i < MAX_CATCHUP_ITERATIONS && cursor <= today; i++) {
        await tx.transaction.create({
          data: {
            userId: template.userId,
            type: template.type,
            categoryId: template.categoryId,
            amount: template.amount,
            description: template.description,
            date: cursor,
            recurring: false,
            generatedFromId: template.id,
          },
        });
        created++;
        cursor = addRecurrencePeriod(cursor, template.recurrenceFrequency!);
      }

      await tx.transaction.update({
        where: { id: template.id },
        data: { nextOccurrenceDate: cursor },
      });

      return created;
    });
  }

  return { templatesProcessed: templates.length, instancesCreated };
}

export function scheduleRecurringTransactionsJob() {
  cron.schedule("0 1 * * *", () => {
    runRecurringTransactionsJob().catch((error) => {
      console.error("Recurring transactions job failed:", error);
    });
  });

  runRecurringTransactionsJob().catch((error) => {
    console.error("Recurring transactions startup catch-up failed:", error);
  });
}
