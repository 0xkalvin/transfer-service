const postgres = require('../data-sources/postgres');
const kafka = require('../data-sources/kafka');
const transferService = require('../services/transfer');

const logger = require('../lib/logger')('TRANSFER_PROCESSOR_WORKER');

const {
  KAFKA_TRANSFERS_PROCESSOR_TOPIC,
  KAFKA_TRANSFER_PROCESSOR_GROUP_ID,
  NODE_ENV,
} = process.env;

async function run() {
  try {
    await postgres.connect();
  } catch (error) {
    logger.fatal({
      message: 'Transfer processor worker failed to connect to postgres. Exiting process...',
    });

    process.exit(1);
  }

  const consumer = kafka.makeConsumer({
    groupId: KAFKA_TRANSFER_PROCESSOR_GROUP_ID,
  });

  try {
    await consumer.connect();
  } catch (error) {
    logger.fatal({
      message: 'Transfer processor worker failed to connect to kafka brokers. Exiting process...',
      error_message: error.message,
      error_stack: error.stack,
    });

    process.exit(1);
  }

  await consumer.subscribe({ topic: KAFKA_TRANSFERS_PROCESSOR_TOPIC });

  logger.info({
    message: 'Transfer processor worker is up and kicking',
    env: NODE_ENV,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const processPayload = JSON.parse(message.value.toString());

        await transferService.process(processPayload);
      } catch (error) {
        logger.error({
          message: 'Failed to process message',
          error_message: error.message,
          error_stack: error.stack,
        });
      }
    },
  });
}

run();
