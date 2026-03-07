import "dotenv/config";
import { dbPing, pool } from "./core/db/pool";
import { runMigrations } from "./migrate/runner";
import { createList, listLists } from "./core/services/lists.service";

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

    case "list:create": {
      const name = process.argv.slice(3).join(" ");
      const list = await createList(name);
      console.log(`created list: ${list.id} "${list.name}"`);
      break;
    }
    
    case "list:ls": {
      const lists = await listLists();
      if (lists.length === 0) {
        console.log("no lists found");
        break;
      }
      for (const l of lists) {
        console.log(`${l.id}  ${l.name}  (${l.createdAt.toISOString()})`);
      }
      break;
    }

    case undefined: {
      console.log("Listz Core (CLI adapter)");
      console.log("Commands:");
      console.log("  db:ping   Test database connectivity");
      console.log('  list:create "Name"');
      console.log("  list:ls");
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
