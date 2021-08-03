const net = require('net');
const tls = require('tls');
const { logLevel } = require('kafkajs');

const {
  KAFKA_CONNECTION_TIMEOUT,
  KAFKA_ENDPOINTS,
  KAFKA_INITIAL_KEEPALIVE_DELAY,
  KAFKA_INITIAL_RETRY_TIME,
  KAFKA_MAX_RETRIES,
  KAFKA_MAX_RETRY_TIME,
  KAFKA_REQUEST_TIMEOUT,
  KAFKA_RETRY_MULTIPLIER,
} = process.env;

const initialKeepAliveDelay = parseInt(KAFKA_INITIAL_KEEPALIVE_DELAY || 30000, 10);

const defaultSettings = {
  brokers: [KAFKA_ENDPOINTS],
  logLevel: logLevel.ERROR,
  connectionTimeout: parseInt(KAFKA_CONNECTION_TIMEOUT || 2000, 10),
  requestTimeout: parseInt(KAFKA_REQUEST_TIMEOUT || 30000, 10),
  retry: {
    maxRetryTime: parseInt(KAFKA_MAX_RETRY_TIME || 30000, 10),
    initialRetryTime: parseInt(KAFKA_INITIAL_RETRY_TIME || 100, 10),
    retries: parseInt(KAFKA_MAX_RETRIES || 20, 10),
    multiplier: parseFloat(KAFKA_RETRY_MULTIPLIER || 1.5, 10),
  },
  socketFactory: ({
    host, port, ssl, onConnect,
  }) => {
    const socket = ssl
      ? tls.connect(
        { host, port, ...ssl },
        onConnect,
      )
      : net.connect(
        { host, port },
        onConnect,
      );

    socket.setKeepAlive(true, initialKeepAliveDelay);

    return socket;
  },
};

module.exports = {
  development: defaultSettings,
  test: defaultSettings,
  production: defaultSettings,
};
