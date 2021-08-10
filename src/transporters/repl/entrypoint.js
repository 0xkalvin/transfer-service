const repl = require('repl');

const kafka = require('../../data-sources/kafka');
const postgres = require('../../data-sources/postgres');
const accountService = require('../../services/account');
const transferService = require('../../services/transfer');
const logger = require('../../lib/logger')('REPL_ENTRYPOINT');

function wrapAction(action) {
  return async function wrapper(parameters) {
    try {
      const result = await action(parameters);

      return result;
    } catch (error) {
      logger.error({
        message: 'Failed to execute action',
        error_message: error.message,
        error_stack: error.stack,
      });

      return error;
    }
  };
}

async function run() {
  try {
    await postgres.connect();
  } catch (error) {
    logger.fatal({
      message: 'REPL failed to connect to postgres. Exiting process...',
    });

    process.exit(1);
  }

  try {
    await kafka.producer.connect();
  } catch (error) {
    logger.fatal({
      message: 'REPL failed to connect to kafka brokers. Exiting process...',
      error_message: error.message,
      error_stack: error.stack,
    });

    process.exit(1);
  }

  const availableActions = {
    createAccount: wrapAction(accountService.create),
    showAccount: wrapAction(accountService.show),
    createTransfer: wrapAction(transferService.create),
    processTransfer: wrapAction(transferService.process),
  };

  const replServer = repl.start('Transfer service repl > ');

  Object.assign(replServer.context, availableActions);
}

run();
