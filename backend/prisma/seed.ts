import { prisma } from "../src/lib/prisma";
import { seedItems } from "./seeds/items.seed";

const main = async() => {
  await seedItems();

  console.log("All seeds completed!");
}

main().catch((error: unknown) => {
  console.error("Error while seeding database:", error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});