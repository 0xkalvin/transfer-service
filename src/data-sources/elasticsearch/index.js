const { Client } = require('@elastic/elasticsearch');
const logger = require('../../lib/logger')('ELASTICSEARCH_INDEX');

const config = require('./config')[process.env.NODE_ENV];

const connectionPool = new Client(config);

async function connect() {
  try {
    await connectionPool.info();

    logger.info({
      message: 'Successfully connected to elasticsearch',
    });
  } catch (error) {
    logger.error({
      message: 'Failed to connect to elasticsearch',
      error_message: error.message,
      error_stack: error.stack,
    });

    throw error;
  }
}

module.exports = {
  connectionPool,
  connect,
};
