import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client.js";
import { UserRole } from "../src/generated/prisma/enums.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const demoPasswordHash = await bcrypt.hash("password123", 10);
  const jashim = await prisma.user.upsert({
    where: {
      email: "jashim@dhakateslapool.com",
    },
    update: {},
    create: {
      name: "Jashim",
      email: "jashim@dhakateslapool.com",
      passwordHash: demoPasswordHash,
      role: UserRole.DRIVER,
    },
  });

  await prisma.vehicle.upsert({
    where: {
      plateNumber: "DHAKA-BULLET-001",
    },
    update: {},
    create: {
      name: "Bullet",
      plateNumber: "DHAKA-BULLET-001",
      capacity: 3,
      driverId: jashim.id,
    },
  });

  const passengers = [
    {
      name: "Nusrat",
      email: "nusrat@dhakateslapool.com",
    },
    {
      name: "Rafiq",
      email: "rafiq@dhakateslapool.com",
    },
    {
      name: "Shirin",
      email: "shirin@dhakateslapool.com",
    },
  ];

  for (const passenger of passengers) {
    await prisma.user.upsert({
      where: {
        email: passenger.email,
      },
      update: {},
      create: {
        name: passenger.name,
        email: passenger.email,
        passwordHash: "TEMP_HASH",
        role: UserRole.PASSENGER,
      },
    });
  }

  console.log("Seed completed");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
