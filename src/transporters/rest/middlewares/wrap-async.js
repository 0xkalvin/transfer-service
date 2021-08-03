function wrapAsync(handler) {
  return async (request, response, next) => {
    try {
      const {
        statusCode,
        responsePayload,
      } = await handler(request, response);

      if (!responsePayload) {
        return response.sendStatus(statusCode);
      }

      return response.status(statusCode).json(responsePayload);
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = wrapAsync;
