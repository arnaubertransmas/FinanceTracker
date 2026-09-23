import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";
import { parseDateOnly, toDateOnlyString } from "../../lib/dates";
import { UpdateSnapshotInput, UpsertSnapshotInput } from "../../schemas/investing.schema";

const ZERO = new Prisma.Decimal(0);

export async function getInvestingSummary(userId: string) {
  const [transactions, snapshots] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, type: "INVESTMENT" },
      select: { date: true, amount: true },
      orderBy: { date: "asc" },
    }),
    prisma.portfolioSnapshot.findMany({
      where: { userId },
      select: { date: true, value: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const investedByDate = new Map<string, Prisma.Decimal>();
  for (const t of transactions) {
    const key = toDateOnlyString(t.date);
    investedByDate.set(key, (investedByDate.get(key) ?? ZERO).plus(t.amount));
  }

  const snapshotByDate = new Map<string, Prisma.Decimal>();
  for (const s of snapshots) {
    snapshotByDate.set(toDateOnlyString(s.date), s.value);
  }

  const allDates = Array.from(new Set([...investedByDate.keys(), ...snapshotByDate.keys()])).sort();

  let cumulative = ZERO;
  const series = allDates.map((date) => {
    const delta = investedByDate.get(date);
    if (delta) cumulative = cumulative.plus(delta);
    return {
      date,
      invested: cumulative,
      portfolioValue: snapshotByDate.get(date) ?? null,
    };
  });

  const lastSnapshot = snapshots.at(-1);
  const latestPortfolioValue = lastSnapshot?.value ?? null;
  const gainAmount = latestPortfolioValue ? latestPortfolioValue.minus(cumulative) : null;
  const gainPercent = gainAmount && !cumulative.isZero() ? gainAmount.dividedBy(cumulative).times(100) : null;

  return {
    series,
    totalInvested: cumulative,
    latestPortfolioValue,
    gainAmount,
    gainPercent,
  };
}

export async function listSnapshots(userId: string) {
  return prisma.portfolioSnapshot.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

export async function upsertSnapshot(userId: string, input: UpsertSnapshotInput) {
  return prisma.portfolioSnapshot.upsert({
    where: { userId_date: { userId, date: parseDateOnly(input.date) } },
    create: { userId, date: parseDateOnly(input.date), value: input.value },
    update: { value: input.value },
  });
}

export async function updateSnapshot(userId: string, id: string, input: UpdateSnapshotInput) {
  const { count } = await prisma.portfolioSnapshot.updateMany({
    where: { id, userId },
    data: {
      ...(input.value !== undefined ? { value: input.value } : {}),
      ...(input.date !== undefined ? { date: parseDateOnly(input.date) } : {}),
    },
  });
  if (count === 0) {
    throw new HttpError(404, "Snapshot not found");
  }
  return prisma.portfolioSnapshot.findUniqueOrThrow({ where: { id } });
}

export async function deleteSnapshot(userId: string, id: string) {
  const { count } = await prisma.portfolioSnapshot.deleteMany({ where: { id, userId } });
  if (count === 0) {
    throw new HttpError(404, "Snapshot not found");
  }
}
