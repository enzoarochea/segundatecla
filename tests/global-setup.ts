import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

/** Fresh test database from the real migrations, so tests run the same schema as the app. */
export default function setup() {
  rmSync("prisma/test.db", { force: true });
  execSync("npx prisma migrate deploy", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
  });
}
