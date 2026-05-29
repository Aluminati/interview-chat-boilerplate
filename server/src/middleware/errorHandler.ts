import type { Request, Response, NextFunction } from 'express';
import { log } from '../logger.js';

export function errorHandler(
	err: unknown,
	_req: Request,
	res: Response,
	_next: NextFunction,
): void {
	log.error(err);
	const message =
		err instanceof Error ? err.message : 'Internal server error';
	res.status(500).json({ error: message });
}
