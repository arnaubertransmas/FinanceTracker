import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { periodRange, yearRange } from "../../lib/dates";

const ZERO = new Prisma.Decimal(0);

async function sumByType(userId: string, range?: { from: Date; to: Date }) {
  const rows = await prisma.transaction.groupBy({
    by: ["type"],
    where: { userId, ...(range ? { date: { gte: range.from, lt: range.to } } : {}) },
    _sum: { amount: true },
  });

  const totals = { INCOME: ZERO, EXPENSE: ZERO, INVESTMENT: ZERO };
  for (const row of rows) {
    totals[row.type] = row._sum.amount ?? ZERO;
  }
  return totals;
}

export async function getSummary(userId: string, year?: number, month?: number) {
  const range = year !== undefined ? periodRange(year, month) : undefined;
  const periodTotals = await sumByType(userId, range);

  const cleanMoney = periodTotals.INCOME.minus(periodTotals.EXPENSE);
  const savingsPercent = periodTotals.INCOME.isZero() ? ZERO : cleanMoney.dividedBy(periodTotals.INCOME).times(100);

  return {
    month: month ?? null,
    year: year ?? null,
    income: periodTotals.INCOME,
    expense: periodTotals.EXPENSE,
    investment: periodTotals.INVESTMENT,
    cleanMoney,
    savingsPercent,
  };
}

export async function getAvailableYears(userId: string): Promise<number[]> {
  const rows = await prisma.$queryRaw<{ year: number }[]>`
    SELECT DISTINCT EXTRACT(YEAR FROM date)::int AS year
    FROM transactions
    WHERE user_id = ${userId}
    ORDER BY year DESC
  `;
  return rows.map((r) => r.year);
}

export async function getMonthlyBreakdown(userId: string, year: number) {
  const { from, to } = yearRange(year);

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: from, lt: to } },
    select: { type: true, amount: true, date: true },
  });

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    income: ZERO,
    expense: ZERO,
    investment: ZERO,
  }));

  for (const t of transactions) {
    const monthIndex = t.date.getUTCMonth();
    const bucket = months[monthIndex];
    if (t.type === "INCOME") bucket.income = bucket.income.plus(t.amount);
    else if (t.type === "EXPENSE") bucket.expense = bucket.expense.plus(t.amount);
    else bucket.investment = bucket.investment.plus(t.amount);
  }

  return months;
}

export async function getHistory(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { date: true, type: true, amount: true },
    orderBy: { date: "asc" },
  });

  if (transactions.length === 0) {
    return { series: [] };
  }

  const firstDate = transactions[0].date;
  const now = new Date();
  const months: string[] = [];
  let cursor = new Date(Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  while (cursor <= end) {
    months.push(`${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}`);
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }

  const byMonth = new Map<string, { income: Prisma.Decimal; expense: Prisma.Decimal; investment: Prisma.Decimal }>();
  for (const m of months) byMonth.set(m, { income: ZERO, expense: ZERO, investment: ZERO });

  for (const t of transactions) {
    const key = `${t.date.getUTCFullYear()}-${String(t.date.getUTCMonth() + 1).padStart(2, "0")}`;
    const bucket = byMonth.get(key);
    if (!bucket) continue;
    if (t.type === "INCOME") bucket.income = bucket.income.plus(t.amount);
    else if (t.type === "EXPENSE") bucket.expense = bucket.expense.plus(t.amount);
    else bucket.investment = bucket.investment.plus(t.amount);
  }

  let cumulativeWealth = ZERO;
  const series = months.map((month) => {
    const b = byMonth.get(month)!;
    const net = b.income.minus(b.expense);
    cumulativeWealth = cumulativeWealth.plus(net);
    const savingsPercent = b.income.isZero() ? ZERO : net.dividedBy(b.income).times(100);
    return {
      month,
      income: b.income,
      expense: b.expense,
      investment: b.investment,
      wealth: cumulativeWealth,
      savingsPercent,
    };
  });

  return { series };
}

export async function getCategoryBreakdown(
  userId: string,
  year?: number,
  month?: number,
  type: TransactionType = "EXPENSE"
) {
  const range = year !== undefined ? periodRange(year, month) : undefined;

  const rows = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { userId, type, ...(range ? { date: { gte: range.from, lt: range.to } } : {}) },
    _sum: { amount: true },
  });

  const categories = await prisma.category.findMany({
    where: { id: { in: rows.map((r) => r.categoryId) } },
  });
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const total = rows.reduce((acc, r) => acc.plus(r._sum.amount ?? ZERO), ZERO);

  return rows
    .map((r) => {
      const category = categoryById.get(r.categoryId)!;
      const amount = r._sum.amount ?? ZERO;
      return {
        categoryId: r.categoryId,
        nombre: category.nombre,
        color: category.color,
        total: amount,
        percent: total.isZero() ? ZERO : amount.dividedBy(total).times(100),
      };
    })
    .sort((a, b) => b.total.comparedTo(a.total));
}
