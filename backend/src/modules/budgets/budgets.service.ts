import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";
import { budgetStatus } from "../../lib/budgetThresholds";
import { monthRange } from "../../lib/dates";
import { CreateBudgetInput, UpdateBudgetInput } from "../../schemas/budget.schema";

export function listBudgets(userId: string) {
  return prisma.budget.findMany({ where: { userId }, include: { category: true } });
}

export function createBudget(userId: string, input: CreateBudgetInput) {
  return prisma.budget.create({
    data: {
      userId,
      categoryId: input.categoryId,
      limitType: input.limitType,
      monthlyLimit: input.limitType === "FIXED" ? input.monthlyLimit : undefined,
      percentage: input.limitType === "PERCENTAGE" ? input.percentage : undefined,
    },
  });
}

async function assertOwnedBudget(userId: string, budgetId: string) {
  const budget = await prisma.budget.findFirst({ where: { id: budgetId, userId } });
  if (!budget) {
    throw new HttpError(404, "Budget not found");
  }
  return budget;
}

export async function updateBudget(userId: string, budgetId: string, input: UpdateBudgetInput) {
  await assertOwnedBudget(userId, budgetId);
  return prisma.budget.update({
    where: { id: budgetId },
    data: {
      ...(input.limitType ? { limitType: input.limitType } : {}),
      ...(input.monthlyLimit !== undefined ? { monthlyLimit: input.monthlyLimit } : {}),
      ...(input.percentage !== undefined ? { percentage: input.percentage } : {}),
    },
  });
}

export async function deleteBudget(userId: string, budgetId: string) {
  await assertOwnedBudget(userId, budgetId);
  await prisma.budget.delete({ where: { id: budgetId } });
}

export async function getBudgetsWithProgress(userId: string, month: number, year: number) {
  const { from, to } = monthRange(month, year);

  const [budgets, monthIncomeAgg] = await Promise.all([
    prisma.budget.findMany({ where: { userId }, include: { category: true } }),
    prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: from, lt: to } },
      _sum: { amount: true },
    }),
  ]);

  const monthIncome = monthIncomeAgg._sum.amount ?? new Prisma.Decimal(0);

  const results = await Promise.all(
    budgets.map(async (budget) => {
      const spentAgg = await prisma.transaction.aggregate({
        where: { userId, categoryId: budget.categoryId, date: { gte: from, lt: to } },
        _sum: { amount: true },
      });
      const spent = spentAgg._sum.amount ?? new Prisma.Decimal(0);

      const limit =
        budget.limitType === "FIXED"
          ? budget.monthlyLimit ?? new Prisma.Decimal(0)
          : monthIncome.times(budget.percentage ?? new Prisma.Decimal(0)).dividedBy(100);

      const percentUsed = limit.isZero() ? new Prisma.Decimal(0) : spent.dividedBy(limit).times(100);

      return {
        id: budget.id,
        category: budget.category,
        limitType: budget.limitType,
        limit,
        spent,
        percentUsed,
        status: budgetStatus(percentUsed.toNumber()),
      };
    })
  );

  return results;
}
