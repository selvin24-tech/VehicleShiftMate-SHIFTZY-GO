// One-time admin promotion. Run manually from a terminal you control — this is
// intentionally NOT an HTTP endpoint, so there's no way to reach it remotely.
//
// Usage:
//   npx tsx scripts/promote-admin.ts someone@example.com
//
// Requires DATABASE_URL to be set (loaded from .env), same as the server.
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "../server/db";
import { users } from "../shared/schema";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    console.error(`No account found for that email.`);
    process.exit(1);
  }

  if (user.role === "admin") {
    console.log(`That account is already an admin.`);
    return;
  }

  await db.update(users).set({ role: "admin" }).where(eq(users.id, user.id));
  console.log(`Done. That account now has admin access.`);
}

main()
  .catch((error) => {
    console.error("Failed to promote account:", error.message ?? error);
    process.exitCode = 1;
  })
  .finally(() => {
    void pool.end();
  });
