const defaultSettings = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  connect_timeout: process.env.REDIS_TIMEOUT,
  max_attempts: process.env.REDIS_MAX_ATTEMPS,
};

module.exports = {
  development: defaultSettings,
  test: defaultSettings,
  production: defaultSettings,
};
