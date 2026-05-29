import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import Database from 'better-sqlite3';
import { createApp } from '../src/app.js';
import { setDb } from '../src/db/schema.js';

function createTestDb(): Database.Database {
	const db = new Database(':memory:');
	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');
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
	return db;
}

describe('Users API', () => {
	beforeEach(() => {
		setDb(createTestDb());
	});

	it('GET /api/users returns empty array initially', async () => {
		const app = createApp();
		const res = await request(app).get('/api/users');
		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
	});

	it('POST /api/users creates a user', async () => {
		const app = createApp();
		const res = await request(app)
			.post('/api/users')
			.send({ username: 'alice', display_name: 'Alice Smith' });
		expect(res.status).toBe(201);
		expect(res.body.username).toBe('alice');
		expect(res.body.display_name).toBe('Alice Smith');
		expect(res.body.id).toBeDefined();
	});

	it('POST /api/users rejects duplicate username', async () => {
		const app = createApp();
		await request(app)
			.post('/api/users')
			.send({ username: 'alice', display_name: 'Alice Smith' });
		const res = await request(app)
			.post('/api/users')
			.send({ username: 'alice', display_name: 'Another Alice' });
		expect(res.status).toBe(409);
	});

	it('GET /api/users/search finds users by username', async () => {
		const app = createApp();
		await request(app)
			.post('/api/users')
			.send({ username: 'alice', display_name: 'Alice Smith' });
		await request(app)
			.post('/api/users')
			.send({ username: 'bob', display_name: 'Bob Jones' });
		const res = await request(app).get('/api/users/search?q=ali');
		expect(res.status).toBe(200);
		expect(res.body).toHaveLength(1);
		expect(res.body[0].username).toBe('alice');
	});
});
