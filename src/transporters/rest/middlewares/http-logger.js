const logger = require('../../../lib/logger')('HTTP_LOGGER');

function httpLogger(request, response, next) {
  const startTime = Date.now();

  logger.info({
    message: 'Request started',
    url: request.url,
    method: request.method,
    from: 'request',
  });

  next();

  response.once('finish', () => {
    let level = 'info';

    if (response.statusCode >= 400 && response.statusCode < 500) {
      level = 'warn';
    } else if (response.statusCode >= 500) {
      level = 'error';
    }

    logger[level]({
      message: 'Request ended',
      url: request.url,
      method: request.method,
      status_code: response.statusCode,
      from: 'response',
      latency: Date.now() - startTime,
    });
  });
}

module.exports = httpLogger;
