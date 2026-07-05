import { getDb } from "../api/queries/connection";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");
  console.log("Seed complete.");
}

seed().catch(console.error);