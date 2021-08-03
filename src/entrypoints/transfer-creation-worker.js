const postgres = require('../data-sources/postgres');
const kafka = require('../data-sources/kafka');
const sqs = require('../data-sources/sqs');
const logger = require('../lib/logger')('TRANSFER_CREATION_WORKER');
const { processEvent } = require('../transporters/sqs');

const {
  SQS_TRANSFER_CREATION_QUEUE,
} = process.env;

async function run() {
  try {
    await postgres.connect();
  } catch (error) {
    logger.fatal({
      message: 'Transfer creation worker failed to connect to postgres. Exiting process...',
    });

    process.exit(1);
  }

  try {
    await kafka.producer.connect();
  } catch (error) {
    logger.fatal({
      message: 'Transfer creation worker failed to connect to kafka brokers. Exiting process...',
      error_message: error.message,
      error_stack: error.stack,
    });

    process.exit(1);
  }

  const poller = sqs.makePoller({
    queueUrl: SQS_TRANSFER_CREATION_QUEUE,
  });

  poller.poll({
    eachMessage: processEvent,
    onError: logger.error,
  });
}

run();
