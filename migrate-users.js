"use strict";

const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const sourcePath = path.resolve(process.env.NEDB_USERS_PATH || "database/users");
const targetPath = path.resolve(process.env.SQLITE_USERS_PATH || "database/users.db");

function fail(message) {
  throw new Error(message);
}

function readJournal(filename) {
  if (!fs.existsSync(filename)) fail(`NeDB source not found: ${filename}`);

  const latest = new Map();
  const lines = fs.readFileSync(filename, "utf8").split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (!line.trim()) continue;

    let record;
    try {
      record = JSON.parse(line);
    } catch {
      fail(`Invalid JSON on source line ${index + 1}`);
    }

    if (record.$$indexCreated || record.$$indexRemoved) continue;
    if (typeof record._id !== "string" || !record._id) {
      fail(`Missing document ID on source line ${index + 1}`);
    }
    if (record.$$deleted === true) {
      latest.delete(record._id);
    } else {
      latest.set(record._id, record);
    }
  }
  return [...latest.values()];
}

function text(record, field, defaultValue = "") {
  const value = record[field] ?? defaultValue;
  if (typeof value !== "string") fail(`User ${record._id} has an invalid ${field}`);
  return value;
}

function validateUser(record) {
  const username = text(record, "username").trim();
  const hash = text(record, "hash");
  if (!username) fail(`User ${record._id} has no username`);
  if (!hash) fail(`User ${record._id} has no password hash`);

  const solved = record.solved ?? [];
  if (!Array.isArray(solved) || solved.some((question) => typeof question !== "string")) {
    fail(`User ${record._id} has an invalid solved list`);
  }

  const latest = record.latest ?? 0;
  const score = record.score ?? 0;
  if (!Number.isSafeInteger(latest) || latest < 0) {
    fail(`User ${record._id} has an invalid latest timestamp`);
  }
  if (!Number.isSafeInteger(score) || score < 0) {
    fail(`User ${record._id} has an invalid score`);
  }
  if (record.admin !== undefined && typeof record.admin !== "boolean") {
    fail(`User ${record._id} has an invalid admin flag`);
  }

  return {
    legacyId: record._id,
    username,
    hash,
    name: text(record, "name"),
    className: text(record, "class"),
    phone: text(record, "phone"),
    email: text(record, "email"),
    solved: JSON.stringify([...new Set(solved)]),
    latest,
    score,
    admin: record.admin ? 1 : 0,
  };
}

function migrate() {
  if (sourcePath === targetPath) fail("Source and target paths must differ");
  const users = readJournal(sourcePath).map(validateUser);

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const db = new Database(targetPath);
  try {
    db.pragma("foreign_keys = ON");
    const runMigration = db.transaction(() => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          hash TEXT NOT NULL,
          name TEXT NOT NULL DEFAULT '',
          class TEXT NOT NULL DEFAULT '',
          phone TEXT NOT NULL DEFAULT '',
          email TEXT NOT NULL DEFAULT '',
          solved TEXT NOT NULL DEFAULT '[]',
          latest INTEGER NOT NULL DEFAULT 0,
          score INTEGER NOT NULL DEFAULT 0,
          admin INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS migration_users (
          legacy_id TEXT PRIMARY KEY,
          user_id INTEGER UNIQUE NOT NULL REFERENCES users(id)
        );
      `);

      const alreadyImported = db.prepare("SELECT user_id FROM migration_users WHERE legacy_id = ?");
      const existingUsername = db.prepare("SELECT id FROM users WHERE username = ?");
      const insertUser = db.prepare(`
        INSERT INTO users (username, hash, name, class, phone, email, solved, latest, score, admin)
        VALUES (@username, @hash, @name, @className, @phone, @email, @solved, @latest, @score, @admin)
      `);
      const recordMigration = db.prepare(
        "INSERT INTO migration_users (legacy_id, user_id) VALUES (?, ?)",
      );

      let imported = 0;
      let skipped = 0;
      for (const user of users) {
        if (alreadyImported.get(user.legacyId)) {
          skipped += 1;
          continue;
        }
        if (existingUsername.get(user.username)) {
          fail(`Target already contains username ${user.username} from an unknown source`);
        }
        const result = insertUser.run(user);
        recordMigration.run(user.legacyId, result.lastInsertRowid);
        imported += 1;
      }
      return { imported, skipped };
    });

    const result = runMigration();
    const integrity = db.pragma("integrity_check", { simple: true });
    if (integrity !== "ok") fail(`SQLite integrity check failed: ${integrity}`);
    console.info(
      `Imported ${result.imported} user(s); skipped ${result.skipped} already imported.`,
    );
  } finally {
    db.close();
  }
}

try {
  migrate();
} catch (error) {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
}
