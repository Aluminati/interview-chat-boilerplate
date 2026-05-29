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

async function seedUsers(
	app: ReturnType<typeof createApp>,
): Promise<{ alice: number; bob: number }> {
	const a = await request(app)
		.post('/api/users')
		.send({ username: 'alice', display_name: 'Alice' });
	const b = await request(app)
		.post('/api/users')
		.send({ username: 'bob', display_name: 'Bob' });
	return { alice: a.body.id, bob: b.body.id };
}

describe('Chats API', () => {
	beforeEach(() => {
		setDb(createTestDb());
	});

	it('POST /api/chats creates a chat', async () => {
		const app = createApp();
		const { alice, bob } = await seedUsers(app);
		const res = await request(app)
			.post('/api/chats')
			.send({ name: 'Test Chat', participant_ids: [alice, bob] });
		expect(res.status).toBe(201);
		expect(res.body.name).toBe('Test Chat');
	});

	it('POST /api/chats rejects fewer than 2 participants', async () => {
		const app = createApp();
		const { alice } = await seedUsers(app);
		const res = await request(app)
			.post('/api/chats')
			.send({ name: 'Solo', participant_ids: [alice] });
		expect(res.status).toBe(400);
	});

	it('POST /api/chats/:id/messages sends a message', async () => {
		const app = createApp();
		const { alice, bob } = await seedUsers(app);
		const chat = await request(app)
			.post('/api/chats')
			.send({ name: 'Chat', participant_ids: [alice, bob] });

		const res = await request(app)
			.post(`/api/chats/${chat.body.id}/messages`)
			.send({ sender_id: alice, content: 'Hello!' });
		expect(res.status).toBe(201);
		expect(res.body.content).toBe('Hello!');
		expect(res.body.sender_username).toBe('alice');
	});

	it('POST /api/chats/:id/messages rejects non-participants', async () => {
		const app = createApp();
		const { alice, bob } = await seedUsers(app);
		const charlie = await request(app)
			.post('/api/users')
			.send({ username: 'charlie', display_name: 'Charlie' });

		const chat = await request(app)
			.post('/api/chats')
			.send({ name: 'Chat', participant_ids: [alice, bob] });

		const res = await request(app)
			.post(`/api/chats/${chat.body.id}/messages`)
			.send({ sender_id: charlie.body.id, content: 'Intruder!' });
		expect(res.status).toBe(403);
	});
});
