const pino = require('pino');
const tracer = require('./tracer');

const {
  LOG_LEVEL = 'info',
} = process.env;

module.exports = (name) => pino({
  name,
  level: LOG_LEVEL,
  nestedKey: 'data',
  formatters: {
    level: (label) => ({ level: label }),
  },
  messageKey: 'message',
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin() {
    return {
      env: process.env.NODE_ENV,
      trace_id: tracer.getTraceId(),
    };
  },
});
