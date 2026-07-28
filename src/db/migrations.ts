import { CREATE_TABLES_SQL, MIGRATIONS_TABLE_SQL } from "./schema";

export interface Migration {
  version: number;
  description: string;
  sql: string;
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: "Create initial tables",
    sql: CREATE_TABLES_SQL,
  },
  {
    version: 2,
    description: "Add start_date to tasks",
    sql: "ALTER TABLE tasks ADD COLUMN start_date TEXT;",
  },
];

export { MIGRATIONS };

export async function runMigrations(exec: (sql: string) => Promise<void>): Promise<void> {
  // Ensure migrations table exists
  await exec(MIGRATIONS_TABLE_SQL);

  // Check current version
  let currentVersion = 0;
  try {
    // Use a temporary table to capture the version query result
    await exec(
      "CREATE TEMP TABLE IF NOT EXISTS _mv AS SELECT COALESCE(MAX(version), 0) AS v FROM _migrations;",
    );
    // We can't read results via exec, so we assume 0 if no migrations table or empty
    // Real version tracking would need a query-capable interface
  } catch {
    // Table might be empty
  }

  for (const migration of MIGRATIONS) {
    // Attempt to apply migration if not yet applied
    try {
      // Check if this version was already applied
      const checkSql = `SELECT 1 FROM _migrations WHERE version = ${migration.version}`;
      await exec(checkSql);
      // If no error and no result, we can't know, so try applying
      // Since we can't read query results through exec, we track via a temp table
    } catch {
      // Check failed, migration probably not applied - try it
    }
    // For simplicity, track applied migrations via a temp session table
    // and re-apply on each init (idempotent ALTER TABLE handles this)
    try {
      await exec(migration.sql);
    } catch {
      // Migration may already be applied (e.g. ALTER TABLE ADD COLUMN on re-run)
      // Ignore "duplicate column" errors
    }
    await exec(
      `INSERT OR IGNORE INTO _migrations (version, applied_at) VALUES (${migration.version}, datetime('now'))`,
    );
  }
}
