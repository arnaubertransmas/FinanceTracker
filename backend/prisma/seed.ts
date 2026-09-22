import { PrismaClient, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEV_USER = {
  email: "dev@financetracker.local",
  password: "password123",
};

const CATEGORIES: { nombre: string; tipo: TransactionType; color: string; icono: string }[] = [
  { nombre: "Compra", tipo: "EXPENSE", color: "#ef4444", icono: "shopping-cart" },
  { nombre: "Cafe", tipo: "EXPENSE", color: "#f97316", icono: "coffee" },
  { nombre: "Ingles", tipo: "EXPENSE", color: "#eab308", icono: "book-open" },
  { nombre: "Gimnasio", tipo: "EXPENSE", color: "#f43f5e", icono: "dumbbell" },
  { nombre: "Ocio", tipo: "EXPENSE", color: "#ec4899", icono: "party-popper" },
  { nombre: "Transporte", tipo: "EXPENSE", color: "#fb7185", icono: "car" },
  { nombre: "Salario", tipo: "INCOME", color: "#22c55e", icono: "wallet" },
  { nombre: "Extra", tipo: "INCOME", color: "#16a34a", icono: "plus-circle" },
  { nombre: "MSCIWorld", tipo: "INVESTMENT", color: "#3b82f6", icono: "trending-up" },
  { nombre: "EUNM", tipo: "INVESTMENT", color: "#2563eb", icono: "trending-up" },
  { nombre: "FWIA", tipo: "INVESTMENT", color: "#1d4ed8", icono: "trending-up" },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEV_USER.password, 12);

  const user = await prisma.user.upsert({
    where: { email: DEV_USER.email },
    update: {},
    create: {
      email: DEV_USER.email,
      passwordHash,
    },
  });

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { userId_nombre_tipo: { userId: user.id, nombre: category.nombre, tipo: category.tipo } },
      update: {},
      create: { ...category, userId: user.id },
    });
  }

  console.log(`Seeded dev user: ${DEV_USER.email} / ${DEV_USER.password}`);
  console.log(`Seeded ${CATEGORIES.length} categories.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
