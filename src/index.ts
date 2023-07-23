import { server } from './server';
import { logger } from './logger';

const PORT = process.env.PORT ?? (8080 as const);
const listenerCallback = () => logger.info('Server listening on port ' + PORT);

function initApp() {
  try {
    logger.info('Starting service Paldea Evolved...');
    server.listen(PORT, listenerCallback);
    process.on('exit', (code) => {
      try { 
        server.close();
      } catch (e) {
        logger.info('Closing the server threw an error. Likely an indication the server has stopped from an exception being thrown.')
      }
      if (code !== 0) {
        logger.warn('Exited with code ' + code);
      }
      logger.info('Paldea Evolved stopped.');
    })
  } catch (e: any) {
    logger.error(e);
  }
}

initApp();