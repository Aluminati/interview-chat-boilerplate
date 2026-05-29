import { env } from './env.js';
import { createApp } from './app.js';
import { log } from './logger.js';

const app = createApp();

app.listen(env.PORT, () => {
	log.info(`Server running on http://localhost:${env.PORT}`);
});
