import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";
import { CreateUserInput, ResetPasswordInput } from "../../schemas/user.schema";

export async function createUser(input: CreateUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new HttpError(409, "A user with this username already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.user.create({
    data: { email: input.email, passwordHash, role: input.role ?? "USER" },
    select: { id: true, email: true, role: true, createdAt: true },
  });
}

export async function updateUserRole(requestingUserId: string, targetUserId: string, role: "USER" | "ADMIN") {
  if (requestingUserId === targetUserId) {
    throw new HttpError(400, "You cannot change your own role");
  }
  try {
    return await prisma.user.update({
      where: { id: targetUserId },
      data: { role },
      select: { id: true, email: true, role: true, createdAt: true },
    });
  } catch {
    throw new HttpError(404, "User not found");
  }
}

export async function listUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { transactions: true, categories: true, budgets: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function resetUserPassword(userId: string, { password }: ResetPasswordInput) {
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  } catch {
    throw new HttpError(404, "User not found");
  }
}

export async function deleteUser(requestingUserId: string, targetUserId: string) {
  if (requestingUserId === targetUserId) {
    throw new HttpError(400, "You cannot delete your own account");
  }
  try {
    await prisma.user.delete({ where: { id: targetUserId } });
  } catch {
    throw new HttpError(404, "User not found");
  }
}
