const logger = require('../../../lib/logger')('ERROR_HANDLER');

const normalizeError = (error) => {
  if (error instanceof Error) {
    return error;
  }

  logger.error({
    message: 'Internal server error',
    error_message: error.message,
    error_stack: error.stack,
  });

  return new Error(error.message);
};

function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  console.error(error);

  const normalizedError = normalizeError(error);

  return response
    .status(normalizedError.statusCode)
    .json({
      error: normalizedError.responseObject,
      method: request.method,
      url: request.url,
    });
}

module.exports = errorHandler;
