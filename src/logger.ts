import pino from 'pino';

export const logger = pino({
  name: 'paldea-evolved-a-b-service',
  level: 'info',
  base: undefined,
  browser: {
    asObject: true
  }
});