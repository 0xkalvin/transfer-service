const logger = require('../../../lib/logger')('ERROR_HANDLER');
const { BusinessError } = require('../../../lib/business-errors');
const {
  ConflicError,
  InternalServerError,
  UnprocessableEntityError,
} = require('../http-errors');

const businessErrorsToHttpMap = new Map([
  ['CONFLICT_ERROR', ConflicError],
  ['LOGIC_INFRACTION', UnprocessableEntityError],
]);

const normalizeError = (error) => {
  if (error instanceof BusinessError) {
    const HttpError = businessErrorsToHttpMap.get(error.type);

    return new HttpError(error.message);
  }

  logger.error({
    message: 'Internal server error',
    error_message: error.message,
    error_stack: error.stack,
  });

  return new InternalServerError();
};

function errorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

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
