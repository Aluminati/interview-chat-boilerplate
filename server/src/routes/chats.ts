import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/schema.js';
import type { Chat, Message, User } from '../types/index.js';

export const chatsRouter = Router();

const CreateChatSchema = z.object({
	name: z.string().max(128).optional(),
	participant_ids: z.array(z.number().int().positive()).min(2),
});

const SendMessageSchema = z.object({
	sender_id: z.number().int().positive(),
	content: z.string().min(1).max(4000),
});

chatsRouter.get('/', (req, res) => {
	const userId = req.query.user_id ? Number(req.query.user_id) : null;
	const db = getDb();

	if (userId) {
		const user = db
			.prepare('SELECT * FROM users WHERE id = ?')
			.get(userId) as User | undefined;
		if (!user) {
			res.status(404).json({ error: 'User not found' });
			return;
		}
		const chats = db
			.prepare(
				'SELECT * FROM chats WHERE participant_usernames LIKE ? ORDER BY created_at DESC',
			)
			.all(`%${user.username}%`) as Chat[];
		res.json(chats);
		return;
	}

	const chats = db
		.prepare('SELECT * FROM chats ORDER BY created_at DESC')
		.all() as Chat[];
	res.json(chats);
});

chatsRouter.get('/:id', (req, res) => {
	const db = getDb();
	const chat = db
		.prepare('SELECT * FROM chats WHERE id = ?')
		.get(req.params.id) as Chat | undefined;
	if (!chat) {
		res.status(404).json({ error: 'Chat not found' });
		return;
	}
	res.json(chat);
});

chatsRouter.post('/', (req, res) => {
	const result = CreateChatSchema.safeParse(req.body);
	if (!result.success) {
		res.status(400).json({ error: result.error.flatten() });
		return;
	}

	const { name, participant_ids } = result.data;
	const db = getDb();

	const users: User[] = [];
	for (const id of participant_ids) {
		const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as
			| User
			| undefined;
		if (!user) {
			res.status(404).json({ error: `User ${id} not found` });
			return;
		}
		users.push(user);
	}

	const participantUsernames = users.map((u) => u.username).join(',');
	const chatName =
		name?.trim() || users.map((u) => u.display_name).join(', ');
	const now = new Date().toISOString();

	const info = db
		.prepare(
			'INSERT INTO chats (name, participant_usernames, created_at) VALUES (?, ?, ?)',
		)
		.run(chatName, participantUsernames, now);

	const chat = db
		.prepare('SELECT * FROM chats WHERE id = ?')
		.get(info.lastInsertRowid) as Chat;
	res.status(201).json(chat);
});

chatsRouter.get('/:id/messages', (req, res) => {
	const db = getDb();
	const chat = db
		.prepare('SELECT * FROM chats WHERE id = ?')
		.get(req.params.id) as Chat | undefined;
	if (!chat) {
		res.status(404).json({ error: 'Chat not found' });
		return;
	}

	const since = req.query.since ? String(req.query.since) : null;
	let messages: Message[];
	if (since) {
		messages = db
			.prepare(
				'SELECT * FROM messages WHERE chat_id = ? AND sent_at > ? ORDER BY sent_at ASC',
			)
			.all(req.params.id, since) as Message[];
	} else {
		messages = db
			.prepare(
				'SELECT * FROM messages WHERE chat_id = ? ORDER BY sent_at ASC',
			)
			.all(req.params.id) as Message[];
	}
	res.json(messages);
});

chatsRouter.post('/:id/messages', (req, res) => {
	const result = SendMessageSchema.safeParse(req.body);
	if (!result.success) {
		res.status(400).json({ error: result.error.flatten() });
		return;
	}

	const { sender_id, content } = result.data;
	const db = getDb();

	const chat = db
		.prepare('SELECT * FROM chats WHERE id = ?')
		.get(req.params.id) as Chat | undefined;
	if (!chat) {
		res.status(404).json({ error: 'Chat not found' });
		return;
	}

	const sender = db
		.prepare('SELECT * FROM users WHERE id = ?')
		.get(sender_id) as User | undefined;
	if (!sender) {
		res.status(404).json({ error: 'Sender not found' });
		return;
	}

	const participantList = chat.participant_usernames.split(',');
	if (!participantList.includes(sender.username)) {
		res.status(403).json({
			error: 'Sender is not a participant of this chat',
		});
		return;
	}

	const now = new Date().toISOString();

	const info = db
		.prepare(
			'INSERT INTO messages (chat_id, sender_id, sender_username, sender_display_name, content, sent_at) VALUES (?, ?, ?, ?, ?, ?)',
		)
		.run(
			chat.id,
			sender.id,
			sender.username,
			sender.display_name,
			content,
			now,
		);

	const message = db
		.prepare('SELECT * FROM messages WHERE id = ?')
		.get(info.lastInsertRowid) as Message;
	res.status(201).json(message);
});
