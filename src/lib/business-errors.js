class BusinessError extends Error {
  constructor(message, type, isRetryable = false) {
    super(message);
    this.type = type;
    this.isRetryable = isRetryable;
  }
}

module.exports = {
  BusinessError,
};
