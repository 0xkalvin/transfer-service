class HttpError extends Error {
  constructor(message, type, statusCode, details = null) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.responseObject = {
      message: this.message,
      type: this.type,
      details,
    };
  }
}

class InternalServerError extends HttpError {
  constructor() {
    super(
      'An unexpected error has occured',
      'InternalServerError',
      500,
    );
  }
}

class UnprocessableEntityError extends HttpError {
  constructor(message) {
    super(
      message,
      'UnprocessableEntityError',
      422,
    );
  }
}

class ConflicError extends HttpError {
  constructor(message) {
    super(
      message,
      'BadRequestError',
      409,
    );
  }
}

module.exports = {
  HttpError,
  UnprocessableEntityError,
  InternalServerError,
  ConflicError,
};
