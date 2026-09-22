import "dotenv/config";
import readline from "node:readline/promises";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { createUserSchema } from "../schemas/auth.schema";

function parseFlags(argv: string[]) {
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      flags[key] = argv[i + 1];
      i++;
    }
  }
  return flags;
}

async function promptForMissing(flags: Record<string, string>) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const email = flags.email ?? (await rl.question("Username: "));
    const password = flags.password ?? (await rl.question("Password: "));
    return { email, password };
  } finally {
    rl.close();
  }
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  const input = await promptForMissing(flags);

  const parsed = createUserSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Invalid input:");
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`A user with username "${email}" already exists.`);
    process.exitCode = 1;
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });

  console.log(`Created user ${user.email} (${user.id}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
