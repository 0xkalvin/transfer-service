class BaseError extends Error {
  constructor(message, type, isRetryable = false) {
    super(message);
    this.type = type;
    this.isRetryable = isRetryable;
  }
}

class DataSourceUnavailableError extends BaseError {
  constructor(message, dataSourceName, retryAfter = 5000) {
    super(message, 'DATASOURCE_UNAVAILABLE', true);
    this.dataSourceName = dataSourceName;
    this.retryAfter = retryAfter;
  }
}

module.exports = {
  BaseError,
  DataSourceUnavailableError,
};
