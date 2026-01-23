import { seedAll } from "@/lib/seeders";

async function main() {
  try {
    await seedAll();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

main();
