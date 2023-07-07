import pino from 'pino';

const devTransport = {
  target: 'pino-pretty',
  options: {
    colorize: true,
  }
};

const prodTransport = pino.transport({
  target: 'pino/file',
  options: {
    destination: '/app/service/logs/run.log',
    mkdir: true,
    append: true
  }
});

function getTransport() {
  if (typeof window !== 'undefined') {
    return false;
  }
  return process.env.NODE_ENV === 'development' ? devTransport : prodTransport;
}

export const logger = pino({
  name: 'paldea-evolved-a-b-service',
  level: process.env.NODE_ENV === 'production' ? 'fatal' : 'info',
  base: undefined,
  browser: {
    asObject: true
  },
  transport: getTransport()
});