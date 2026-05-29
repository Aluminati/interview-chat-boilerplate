import Database from 'better-sqlite3';
import { env } from '../env.js';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
	if (!_db) {
		_db = new Database(env.DB_PATH);
		_db.pragma('journal_mode = WAL');
		_db.pragma('foreign_keys = ON');
		migrate(_db);
	}
	return _db;
}

export function setDb(db: Database.Database): void {
	_db = db;
}

function migrate(db: Database.Database): void {
	db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      participant_usernames TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chat_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      sender_username TEXT NOT NULL,
      sender_display_name TEXT NOT NULL,
      content TEXT NOT NULL,
      sent_at TEXT NOT NULL
    );
  `);
}
