import express from 'express';
import cors from 'cors';
import { usersRouter } from './routes/users.js';
import { chatsRouter } from './routes/chats.js';
import { errorHandler } from './middleware/errorHandler.js';
import { log } from './logger.js';
import { env } from './env.js';

export function createApp(): express.Express {
	const app = express();

	app.use(cors({
		origin: env.CLIENT_URL,
		credentials: true
	}));
	
	app.use(express.json());

	app.use((req, _, next) => {
		log.info('[SERVER]', req.url);

		next();
	});

	app.get('/health', (_req, res) => {
		res.json({ status: 'ok' });
	});

	app.use('/api/users', usersRouter);
	app.use('/api/chats', chatsRouter);

	app.use(errorHandler);

	return app;
}
