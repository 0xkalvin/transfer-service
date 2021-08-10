const redis = require('redis');
const { promisify } = require('util');
const logger = require('../../lib/logger')('REDIS_INDEX');

const config = require('./config')[process.env.NODE_ENV];

const client = redis.createClient(config);

async function connect() {
  try {
    const pingAsync = promisify(client.ping).bind(client);

    await pingAsync();

    logger.info({
      message: 'Successfully connected to redis',
    });
  } catch (error) {
    logger.error({
      message: 'Failed to connect to redis',
      error_message: error.message,
      error_stack: error.stack,
    });

    throw error;
  }
}

module.exports = {
  client,
  connect,
};
