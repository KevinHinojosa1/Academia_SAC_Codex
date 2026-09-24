import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

const dbPath = process.env.SQLITE_DB_PATH || "./.data/app.db";
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const sqlite = new DatabaseSync(dbPath);

// Execute migrations if table does not exist
try {
  const migrationsDir = "./drizzle";
  if (fs.existsSync(migrationsDir)) {
    const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
    sqlite.exec("CREATE TABLE IF NOT EXISTS __migrations (name TEXT PRIMARY KEY);");
    for (const file of files) {
      const executed = sqlite.prepare("SELECT name FROM __migrations WHERE name = ?").get(file);
      if (!executed) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
        // Split by semicolon statements
        const statements = sql
          .split("--> statement-breakpoint")
          .map((s) => s.trim())
          .filter(Boolean);
        for (const stmt of statements) {
          try {
            sqlite.exec(stmt);
          } catch (e) {
            // Ignore if table/index exists
          }
        }
        sqlite.prepare("INSERT INTO __migrations (name) VALUES (?)").run(file);
      }
    }
  }
} catch (err) {
  console.warn("Migration warning:", err.message);
}

function createD1PreparedStatement(statement, bound = []) {
  return {
    bind(...values) {
      return createD1PreparedStatement(statement, values);
    },
    async first(colName) {
      const row = statement.get(...bound);
      if (!row) return null;
      return colName ? row[colName] : row;
    },
    async all() {
      const results = statement.all(...bound);
      return { success: true, results, meta: {} };
    },
    async run() {
      const info = statement.run(...bound);
      return {
        success: true,
        meta: { changes: info.changes, last_row_id: Number(info.lastInsertRowid) },
      };
    },
    async raw() {
      const results = statement.all(...bound);
      return results.map((r) => Object.values(r));
    },
  };
}

const mockD1 = {
  prepare(query) {
    const stmt = sqlite.prepare(query);
    return createD1PreparedStatement(stmt);
  },
  async batch(statements) {
    sqlite.exec("BEGIN");
    try {
      const results = [];
      for (const s of statements) {
        results.push(await s.run());
      }
      sqlite.exec("COMMIT");
      return results;
    } catch (e) {
      sqlite.exec("ROLLBACK");
      throw e;
    }
  },
  async exec(query) {
    sqlite.exec(query);
    return { count: 0, duration: 0 };
  },
};

const mockEvidence = {
  async put(key, value) {
    const dir = "./.data/evidence";
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, key), Buffer.from(value));
  },
  async delete(keys) {
    const dir = "./.data/evidence";
    const list = Array.isArray(keys) ? keys : [keys];
    for (const k of list) {
      try {
        fs.unlinkSync(path.join(dir, k));
      } catch {}
    }
  },
};

export const env = {
  DB: mockD1,
  EVIDENCE: mockEvidence,
};

globalThis.__CF_ENV__ = env;
