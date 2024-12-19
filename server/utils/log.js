const pino = require('pino');
const config = require('../config');

// Create a custom error serializer
const errorSerializer = (error) => {
  if (!(error instanceof Error)) return error;
  return {
    type: error.constructor.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    ...error
  };
};

const logger = pino({
  level: process.env.LOG_LEVEL || 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      messageFormat: '{msg} - {context}',
      singleLine: true
    }
  },
  serializers: {
    err: errorSerializer,
    error: errorSerializer
  },
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    }
  }
});

// Add debug namespace support for compatibility with existing debug logs
const debug = require('debug');
const appNamespace = debug('app:*');

// Proxy debug logs to pino
appNamespace.log = (...args) => {
  const message = args[0];
  const context = args.length > 1 ? args.slice(1).join(' ') : '';
  logger.debug({ context }, message);
};

// Helper to format error objects
const formatError = (error) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
      ...error
    };
  }
  return error;
};

// Helper to format context objects
const formatContext = (context) => {
  try {
    if (context instanceof Error) return formatError(context);
    if (typeof context === 'object' && context !== null) {
      return JSON.stringify(context);
    }
    return String(context);
  } catch (e) {
    return String(context);
  }
};

// Export enhanced logging functions
module.exports = {
  error: (msg, context) => {
    if (context instanceof Error) {
      logger.error({ err: context }, msg);
    } else if (context) {
      logger.error({ context: formatContext(context) }, msg);
    } else {
      logger.error(msg);
    }
  },
  warn: (msg, context) => {
    if (context) {
      logger.warn({ context: formatContext(context) }, msg);
    } else {
      logger.warn(msg);
    }
  },
  info: (msg, context) => {
    if (context) {
      logger.info({ context: formatContext(context) }, msg);
    } else {
      logger.info(msg);
    }
  },
  debug: (msg, context) => {
    if (context) {
      logger.debug({ context: formatContext(context) }, msg);
    } else {
      logger.debug(msg);
    }
  },
  trace: (msg, context) => {
    if (context) {
      logger.trace({ context: formatContext(context) }, msg);
    } else {
      logger.trace(msg);
    }
  }
};