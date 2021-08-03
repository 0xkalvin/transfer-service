const kafkaClient = require('./client');
const logger = require('../../lib/logger')('CONSUMER');

function makeConsumer({
  groupId,
}) {
  const consumer = kafkaClient.consumer({
    groupId,
  });

  const connect = async () => {
    await consumer.connect();

    logger.info({
      message: 'Consumer has connected to kafka brokers',
    });
  };

  const disconnect = async () => {
    await consumer.disconnect();

    logger.info({
      message: 'Consumer has disconnected from kafka brokers',
    });
  };

  const subscribe = async ({ topic }) => {
    await consumer.subscribe({ topic });

    logger.info({
      message: `Consumer has subscribed to topic ${topic}`,
    });
  };

  const run = async ({ eachMessage }) => {
    await consumer.run({
      eachMessage,
    });
  };

  return {
    connect,
    disconnect,
    run,
    subscribe,
  };
}

module.exports = makeConsumer;
