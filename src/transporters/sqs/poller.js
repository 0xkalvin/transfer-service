const {
  DeleteMessageCommand,
  ReceiveMessageCommand,
} = require('@aws-sdk/client-sqs');

const sqsClient = require('../../data-sources/sqs/client');
const logger = require('../../lib/logger')('SQS_POLLER');

function makePoller(options) {
  const {
    queueUrl,
    visibilityTimeout = 20,
    waitTimeSeconds = 10,
    pollingTimeout = 5,
  } = options;

  async function processMessage({
    eachMessage,
  }, message) {
    try {
      await eachMessage(message);

      const deleteCommand = new DeleteMessageCommand({
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle,
      });

      await sqsClient.send(deleteCommand);
    } catch (error) {
      logger.error({
        message: 'Failed to process SQS message',
        error_message: error.message,
        error_stack: error.stack,
      });
    }
  }

  async function poll({
    eachMessage,
    onError,
  }) {
    const receiveMessagesCommand = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      MessageAttributeNames: ['All'],
      VisibilityTimeout: visibilityTimeout,
      WaitTimeSeconds: waitTimeSeconds,
    });

    const result = await sqsClient.send(receiveMessagesCommand);

    if (result.Messages) {
      const promises = result.Messages.map((message) => processMessage({
        eachMessage,
        onError,
      }, message));

      await Promise.all(promises);
    }

    setTimeout(() => {
      poll({
        eachMessage,
        onError,
      });
    }, pollingTimeout);
  }

  return {
    poll,
  };
}

module.exports = makePoller;
