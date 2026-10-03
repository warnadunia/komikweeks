import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { adminUsers } from "../src/db/schema";
import { hashPassword } from "../src/lib/password";

async function main() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "comicweek123";

  const [existing] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.username, username))
    .limit(1);

  if (existing) {
    console.log(`✓ Akun admin "${username}" sudah ada — tidak diubah.`);
  } else {
    await db.insert(adminUsers).values({
      username,
      passwordHash: hashPassword(password),
      displayName: "Redaksi Comic Week",
    });
    console.log(`✓ Akun admin dibuat: ${username} / ${password}`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
