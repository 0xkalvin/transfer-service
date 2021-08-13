const protoLoader = require('@grpc/proto-loader');
const grpc = require('@grpc/grpc-js');
const path = require('path');

const kafka = require('../../data-sources/kafka');
const postgres = require('../../data-sources/postgres');
const elasticsearch = require('../../data-sources/elasticsearch');
const redis = require('../../data-sources/redis');
const logger = require('../../lib/logger')('GRPC_SERVER_ENTRYPOINT');

const accountControllers = require('./controllers/account');
const transferControllers = require('./controllers/transfer');

const protoLoadOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

const accountProto = protoLoader.loadSync(path.resolve(__dirname, './proto/account.proto'), protoLoadOptions);
const accountDefinitions = grpc.loadPackageDefinition(accountProto);

const transferProto = protoLoader.loadSync(path.resolve(__dirname, './proto/transfer.proto'), protoLoadOptions);
const transferDefinitions = grpc.loadPackageDefinition(transferProto);

const {
  PORT = 3001,
  NODE_ENV,
} = process.env;

const shutdown = (server) => (signal) => {
  logger.info({
    message: 'GRPC server is shutting down...',
    signal,
  });

  server.tryShutdown((error) => {
    if (error) {
      logger.error({
        message: 'GRPC server failed to gracefully shutdown. Exiting now...',
        signal,
      });

      server.forceShutdown();

      process.exit(0);
    }
  });
};

async function run() {
  try {
    await postgres.connect();
  } catch (error) {
    logger.fatal({
      message: 'GRPC server failed to connect to postgres. Exiting process...',
    });

    process.exit(1);
  }

  try {
    await redis.connect();
  } catch (error) {
    logger.fatal({
      message: 'GRPC server failed to connect to redis. Exiting process...',
    });

    process.exit(1);
  }

  try {
    await elasticsearch.connect();
  } catch (error) {
    logger.fatal({
      message: 'GRPC server failed to connect to elasticsearch. Exiting process...',
    });

    process.exit(1);
  }

  try {
    await kafka.producer.connect();
  } catch (error) {
    logger.fatal({
      message: 'GRPC server failed to connect to kafka brokers. Exiting process...',
      error_message: error.message,
      error_stack: error.stack,
    });

    process.exit(1);
  }

  const server = new grpc.Server();

  server.addService(accountDefinitions.AccountService.service, accountControllers);
  server.addService(transferDefinitions.TransferService.service, transferControllers);

  server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (error) => {
    if (error) {
      logger.fatal({
        message: `GRPC server failed to bind port ${PORT}. Exiting process...`,
        error_message: error.message,
        error_stack: error.stack,
      });

      process.exit(1);
    }

    server.start();

    logger.info({
      message: 'GRPC server is up and kicking',
      port: PORT,
      env: NODE_ENV,
    });
  });

  process.once('SIGTERM', shutdown(server));
  process.once('SIGINT', shutdown(server));
}

run();
