import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";
import { ResetPasswordInput } from "../../schemas/user.schema";

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
