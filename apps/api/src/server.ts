import { buildApp } from './app.js';
import { getEnv } from './env.js';

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception during API startup/runtime:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection during API startup/runtime:', reason);
  process.exit(1);
});

console.log('Building Fastify app...');
const app = await buildApp();

console.log('Reading environment variables...');
const env = getEnv();
console.log(`Attempting to listen on 0.0.0.0:${env.PORT}`);

try {
  const address = await app.listen({ host: '0.0.0.0', port: env.PORT });
  console.log(`Revio API listening at ${address}`);
} catch (error) {
  console.error('Failed to start Fastify server:', error);
  app.log.error(error);
  process.exit(1);
}
