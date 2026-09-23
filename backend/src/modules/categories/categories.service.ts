import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";
import { CreateCategoryInput, FindOrCreateCategoryInput, UpdateCategoryInput } from "../../schemas/category.schema";

const DEFAULT_COLOR = "#a78bfa";
const DEFAULT_ICON = "trending-up";

export function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: [{ tipo: "asc" }, { nombre: "asc" }],
  });
}

export function createCategory(userId: string, input: CreateCategoryInput) {
  return prisma.category.create({ data: { ...input, userId } });
}

export function findOrCreateCategory(userId: string, input: FindOrCreateCategoryInput) {
  return prisma.category.upsert({
    where: { userId_nombre_tipo: { userId, nombre: input.nombre, tipo: input.tipo } },
    update: {},
    create: { userId, nombre: input.nombre, tipo: input.tipo, color: DEFAULT_COLOR, icono: DEFAULT_ICON },
  });
}

async function assertOwnedCategory(userId: string, categoryId: string) {
  const category = await prisma.category.findFirst({ where: { id: categoryId, userId } });
  if (!category) {
    throw new HttpError(404, "Category not found");
  }
  return category;
}

export async function updateCategory(userId: string, categoryId: string, input: UpdateCategoryInput) {
  await assertOwnedCategory(userId, categoryId);
  return prisma.category.update({ where: { id: categoryId }, data: input });
}

export async function deleteCategory(userId: string, categoryId: string) {
  await assertOwnedCategory(userId, categoryId);
  await prisma.category.delete({ where: { id: categoryId } });
}
