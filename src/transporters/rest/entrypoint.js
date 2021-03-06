const restApplication = require('./application');
const {
  kafka,
  elasticsearch,
  postgres,
  redis,
} = require('../../data-sources');
const logger = require('../../lib/logger')('REST_SERVER_ENTRYPOINT');

const {
  PORT = 3000,
  NODE_ENV,
  REST_SERVER_TIMEOUT = 10000,
} = process.env;

async function run() {
  try {
    await postgres.connect();
  } catch (error) {
    logger.fatal({
      message: 'Rest server failed to connect to postgres. Exiting process...',
    });

    process.exit(1);
  }

  try {
    await redis.connect();
  } catch (error) {
    logger.fatal({
      message: 'Rest server failed to connect to redis. Exiting process...',
    });

    process.exit(1);
  }

  try {
    await elasticsearch.connect();
  } catch (error) {
    logger.fatal({
      message: 'Rest server failed to connect to elasticsearch. Exiting process...',
    });

    process.exit(1);
  }

  try {
    await kafka.producer.connect();
  } catch (error) {
    logger.fatal({
      message: 'Rest server failed to connect to kafka brokers. Exiting process...',
      error_message: error.message,
      error_stack: error.stack,
    });

    process.exit(1);
  }

  const server = restApplication.listen(PORT, () => {
    logger.info({
      message: 'Rest server is up and kicking',
      port: PORT,
      env: NODE_ENV,
    });
  });

  server.setTimeout(REST_SERVER_TIMEOUT);
}

run();
