const {
  ConnectionError,
  ConnectionRefusedError,
  ConnectionTimedOutError,
  HostNotFoundError,
  HostNotReachableError,
  InvalidConnectionError,
} = require('sequelize');

const logger = require('../../lib/logger');

const defaultSettings = {
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,

  },
  pool: {
    max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || 50, 10),
    min: parseInt(process.env.POSTGRES_MIN_CONNECTIONS || 1, 10),
    idle: parseInt(process.env.POSTGRES_MAX_IDLE_TIME || 10000, 10),
    acquire: parseInt(process.env.POSTGRES_MAX_CONNECTION_TIME || 10000, 10),
  },
  replication: {
    write: {
      host: process.env.POSTGRES_WRITE_HOST,
      post: process.env.POSTGRES_WRITE_PORT,
      username: process.env.POSTGRES_WRITE_USER,
      password: process.env.POSTGRES_WRITE_PASSWORD,
      database: process.env.POSTGRES_WRITE_NAME,
    },
    read: [
      {
        host: process.env.POSTGRES_READ_HOST,
        post: process.env.POSTGRES_READ_PORT,
        username: process.env.POSTGRES_READ_USER,
        password: process.env.POSTGRES_READ_PASSWORD,
        database: process.env.POSTGRES_READ_NAME,
      },
    ],
  },
  retry: {
    max: parseInt(process.env.POSTGRES_RETRY_MAX || 2, 10),
    match: [
      ConnectionError,
      ConnectionRefusedError,
      ConnectionTimedOutError,
      HostNotFoundError,
      HostNotReachableError,
      InvalidConnectionError,
    ],
    report: (message, options) => {
      if (options.$current > 1) {
        logger('SEQUELIZE_RETRIES').warn(message);
      }
    },
    name: 'query',
    backoffBase: parseInt(process.env.POSTGRES_RETRY_BACKOFFBASE || 100, 10),
    backoffExponent: parseFloat(process.env.POSTGRES_RETRY_BACKOFFEXPONENT || 1.1, 10),
    timeout: parseInt(process.env.POSTGRES_RETRY_TIMEOUT || 60000, 10),
  },
};

module.exports = {
  development: defaultSettings,
  test: defaultSettings,
  production: defaultSettings,
};
