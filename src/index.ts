import { server } from './server';
import { logger } from './logger';

function initApp() {
  try {
    logger.info('Starting service Paldea Evolved...');
    server.listen();
  } catch (e: any) {
    logger.error(e);
  } finally {
    logger.info('Stopping Paldea-Evolved server...');
  }
}

initApp();