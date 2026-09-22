import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";
import { addRecurrencePeriod, parseDateOnly, todayDateOnly } from "../../lib/dates";
import { CreateTransactionInput, ListTransactionsQuery, UpdateTransactionInput } from "../../schemas/transaction.schema";

async function assertCategoryForType(userId: string, categoryId: string, type: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) {
    throw new HttpError(404, "Category not found");
  }
  if (category.tipo !== type) {
    throw new HttpError(400, `Category "${category.nombre}" is not of type ${type}`);
  }
  return category;
}

export async function createTransaction(userId: string, input: CreateTransactionInput) {
  await assertCategoryForType(userId, input.categoryId, input.type);

  const date = input.date ? parseDateOnly(input.date) : todayDateOnly();

  return prisma.transaction.create({
    data: {
      userId,
      type: input.type,
      categoryId: input.categoryId,
      amount: input.amount,
      description: input.description,
      date,
      recurring: input.recurring ?? false,
      recurrenceFrequency: input.recurring ? input.recurrenceFrequency : undefined,
      nextOccurrenceDate: input.recurring ? addRecurrencePeriod(date, input.recurrenceFrequency!) : undefined,
      recurrenceActive: input.recurring ? true : undefined,
    },
  });
}

async function assertOwnedTransaction(userId: string, transactionId: string) {
  const transaction = await prisma.transaction.findFirst({ where: { id: transactionId, userId } });
  if (!transaction) {
    throw new HttpError(404, "Transaction not found");
  }
  return transaction;
}

export async function updateTransaction(userId: string, transactionId: string, input: UpdateTransactionInput) {
  const existing = await assertOwnedTransaction(userId, transactionId);

  if (input.categoryId) {
    await assertCategoryForType(userId, input.categoryId, existing.type);
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data: {
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      ...(input.amount !== undefined ? { amount: input.amount } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.date ? { date: parseDateOnly(input.date) } : {}),
      ...(input.recurrenceActive !== undefined ? { recurrenceActive: input.recurrenceActive } : {}),
    },
  });
}

export async function deleteTransaction(userId: string, transactionId: string) {
  await assertOwnedTransaction(userId, transactionId);
  await prisma.transaction.delete({ where: { id: transactionId } });
}

export async function listTransactions(userId: string, query: ListTransactionsQuery) {
  const where = {
    userId,
    ...(query.type ? { type: query.type } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.from || query.to
      ? {
          date: {
            ...(query.from ? { gte: parseDateOnly(query.from) } : {}),
            ...(query.to ? { lte: parseDateOnly(query.to) } : {}),
          },
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: "desc" },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.transaction.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function listTransactionsForExport(userId: string, from?: string, to?: string) {
  return prisma.transaction.findMany({
    where: {
      userId,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: parseDateOnly(from) } : {}),
              ...(to ? { lte: parseDateOnly(to) } : {}),
            },
          }
        : {}),
    },
    include: { category: true },
    orderBy: { date: "asc" },
  });
}
