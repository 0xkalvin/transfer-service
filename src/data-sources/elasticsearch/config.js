const defaultSettings = {
  node: [process.env.ELASTICSEARCH_ENDPOINTS],
  maxRetries: process.env.ELASTICSEARCH_MAX_RETRIES,
  requestTimeout: process.env.ELASTICSEARCH_REQUEST_TIMEOUT,
  sniffOnStart: true,
  agent: {
    keepAlive: true,
  },
};

module.exports = {
  development: defaultSettings,
  test: defaultSettings,
  production: defaultSettings,
};
