export const log = {
	info: (...args: unknown[]) => console.info(new Date(), '[INFO]', ...args),
	log: (...args: unknown[]) => console.info(new Date(), '[INFO]', ...args),
	warn: (...args: unknown[]) => console.info(new Date(), '[WARN]', ...args),
	error: (...args: unknown[]) => console.info(new Date(), '[ERROR]', ...args),
};
