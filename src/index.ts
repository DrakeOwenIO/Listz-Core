import "dotenv/config";
import { dbPing, pool } from "./core/db/pool";
import { runMigrations } from "./migrate/runner";

async function main() {
  const command = process.argv[2];

  switch (command) {
    case "db:ping": {
      const one = await dbPing();
      console.log(`db ok: ${one}`);
      break;
    }

    case "migrate": {
      const result = await runMigrations();
      if (result.applied.length === 0) {
        console.log("migrations: up to date");
      } else {
        console.log("migrations applied:");
        for (const m of result.applied) console.log(`  - ${m}`);
      }
      break;
    }

    case undefined: {
      console.log("Listz Core (CLI adapter)");
      console.log("Commands:");
      console.log("  db:ping   Test database connectivity");
      process.exitCode = 0;
      break;
    }

    default: {
      console.error(`Unknown command: ${command}`);
      console.error("Try: db:ping");
      process.exitCode = 1;
    }
  }
}

// Ensure pool is closed so Node can exit cleanly
main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end().catch(() => {});
  });
