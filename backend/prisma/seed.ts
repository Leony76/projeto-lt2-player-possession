import { prisma } from "../src/lib/prisma";
import { seedItems } from "./seeds/items.seed";
import { seedUsers } from "./seeds/users.seed";

const main = async() => {
  await seedItems();
  await seedUsers();
  
  console.log("All seeds completed!");
}

main().catch((error: unknown) => {
  console.error("Error while seeding database:", error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});