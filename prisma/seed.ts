import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@kainuvari.test" },
    update: {},
    create: {
      email: "demo@kainuvari.test",
      name: "Demo User",
      passwordHash,
    },
  });

  await prisma.sihuMembership.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      role: "ADMIN",
      region: "Lake Victoria Basin",
    },
  });

  const cfa = await prisma.cFA.upsert({
    where: { id: "demo-cfa" },
    update: {},
    create: {
      id: "demo-cfa",
      name: "Kapsabet Forest Association",
      region: "Rift Valley",
      description: "Demo CFA seeded for local development.",
    },
  });

  await prisma.cFAMembership.upsert({
    where: { id: `${user.id}-${cfa.id}` },
    update: {},
    create: {
      id: `${user.id}-${cfa.id}`,
      userId: user.id,
      cfaId: cfa.id,
      role: "ADMIN",
    },
  });

  console.log("Seeded demo user: demo@kainuvari.test / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
