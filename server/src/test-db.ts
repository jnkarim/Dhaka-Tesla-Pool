import prisma from "./lib/prisma.js";

async function testDatabase() {
  const users = await prisma.user.findMany({
    include: {
      vehicle: true,
    },
  });

  console.log(users);

  await prisma.$disconnect();
}

testDatabase();