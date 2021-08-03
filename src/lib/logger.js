const pino = require('pino');

module.exports = (name) => pino({
  name,
  nestedKey: 'data',
  formatters: {
    level: (label) => ({ level: label }),
  },
  messageKey: 'message',
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin() {
    return {
      env: process.env.NODE_ENV,
    };
  },
});
