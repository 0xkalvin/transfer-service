const transferService = require('../../services/transfer');
const logger = require('../../lib/logger')('TRANSFER_PROCESSOR_WORKER');
const {
  BaseError,
  DataSourceUnavailableError,
} = require('../../lib/errors');

const {
  KAFKA_TRANSFERS_PROCESSOR_TOPIC,
} = process.env;

function parseMessage(rawMessage) {
  try {
    const parsedMessage = JSON.parse(rawMessage.value.toString());

    return parsedMessage;
  } catch (error) {
    return rawMessage && rawMessage.value;
  }
}

function eachMessage(consumer) {
  return async ({ message }) => {
    const startTime = Date.now();
    const parsedMessage = parseMessage(message);

    try {
      await transferService.process({
        sourceAccountId: parsedMessage.sourceAccountId,
        targetAccountId: parsedMessage.targetAccountId,
        transferId: parsedMessage.transferId,
      });

      logger.info({
        message: 'Transfer message successfully processed',
        transfer_id: parsedMessage.transferId,
        latency: Date.now() - startTime,
      });
    } catch (error) {
      if (error instanceof BaseError && !error.isRetryable) {
        logger.error({
          message: 'Failed to process transfer message with non retriable error',
          error_message: error.message,
          message_payload: parsedMessage,
        });

        return;
      }

      if (error instanceof DataSourceUnavailableError) {
        consumer.pause([{
          topic: KAFKA_TRANSFERS_PROCESSOR_TOPIC,
        }]);

        setTimeout(() => consumer.resume([{
          topic: KAFKA_TRANSFERS_PROCESSOR_TOPIC,
        }]), error.retryAfter);

        logger.error({
          message: 'Data source is unavailable, pausing message consumption for a while...',
          data_source_name: error.dataSourceName,
          retry_after: error.retryAfter,
        });
      }

      logger.error({
        message: 'Failed to process message',
        error_message: error.message,
        error_stack: error.stack,
      });

      throw error;
    }
  };
}

module.exports = {
  eachMessage,
};
