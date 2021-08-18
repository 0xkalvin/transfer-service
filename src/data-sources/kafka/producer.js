const kafkaClient = require('./client');
const logger = require('../../lib/logger')('PRODUCER');

const producer = kafkaClient.producer();

const connect = async () => {
  await producer.connect();

  logger.info({
    message: 'Successfully connected to kafka brokers',
  });
};

const disconnect = async () => {
  await producer.disconnect();

  logger.info({
    message: 'Producer has disconnected from kafka brokers',
  });
};

const sendMessages = async ({ messages, topic }) => {
  const normalizedMessages = messages.map((message) => {
    const { key, value, headers } = message;

    return {
      key: String(key),
      value: Buffer.from(JSON.stringify(value)),
      headers,
    };
  });

  await producer
    .send({
      topic,
      messages: normalizedMessages,
    });
};

module.exports = {
  connect,
  disconnect,
  sendMessages,
};
