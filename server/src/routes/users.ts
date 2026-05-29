import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/schema.js';
import type { User } from '../types/index.js';

export const usersRouter = Router();

const CreateUserSchema = z.object({
	username: z
		.string()
		.min(2)
		.max(32)
		.regex(/^[a-zA-Z0-9_]+$/),
	display_name: z.string().min(2).max(64),
});

usersRouter.get('/', (_req, res) => {
	const db = getDb();
	const users = db
		.prepare('SELECT * FROM users ORDER BY username ASC')
		.all() as User[];
	res.json(users);
});

usersRouter.get('/search', (req, res) => {
	const query = String(req.query.q ?? '').trim();
	if (!query) {
		res.status(400).json({ error: 'Missing query parameter: q' });
		return;
	}
	const db = getDb();
	const users = db
		.prepare(
			'SELECT * FROM users WHERE username LIKE ? OR display_name LIKE ? ORDER BY username ASC',
		)
		.all(`%${query}%`, `%${query}%`) as User[];
	res.json(users);
});

usersRouter.get('/:id', (req, res) => {
	const db = getDb();
	const user = db
		.prepare('SELECT * FROM users WHERE id = ?')
		.get(req.params.id) as User | undefined;
	if (!user) {
		res.status(404).json({ error: 'User not found' });
		return;
	}
	res.json(user);
});

usersRouter.post('/', (req, res) => {
	const result = CreateUserSchema.safeParse(req.body);
	if (!result.success) {
		res.status(400).json({ error: result.error.flatten() });
		return;
	}
	const { username, display_name } = result.data;
	const db = getDb();

	const existing = db
		.prepare('SELECT id FROM users WHERE username = ?')
		.get(username);
	if (existing) {
		res.status(409).json({ error: 'Username already taken' });
		return;
	}

	const now = new Date().toISOString();
	const stmt = db.prepare(
		'INSERT INTO users (username, display_name, created_at) VALUES (?, ?, ?)',
	);
	const info = stmt.run(username, display_name, now);
	const user = db
		.prepare('SELECT * FROM users WHERE id = ?')
		.get(info.lastInsertRowid) as User;
	res.status(201).json(user);
});
