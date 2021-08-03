const Sequelize = require('sequelize');
const config = require('./config')[process.env.NODE_ENV];
const rawModels = require('./models');
const logger = require('../../lib/logger')('POSTGRES_INDEX');

const connectionPool = new Sequelize(config);

const createInstance = (model) => ({
  model,
  instance: model.create(connectionPool),
});

const associateModels = ({ model, instance }) => {
  if (model.associate) {
    model.associate(instance, connectionPool.models);
  }
};

async function connect() {
  Object.values(rawModels)
    .map(createInstance)
    .map(associateModels);

  try {
    await connectionPool.authenticate();

    logger.info({
      message: 'Successfully connected to postgres',
    });
  } catch (error) {
    logger.error({
      message: 'Failed to connect to postgres',
    });

    throw error;
  }
}

async function openTransaction(options) {
  const transaction = connectionPool.transaction(options);

  return transaction;
}

async function commitTransaction(transaction) {
  try {
    await transaction.commit();
  } catch (error) {
    transaction.rollback();

    throw error;
  }
}

module.exports = {
  connectionPool,
  connect,
  commitTransaction,
  openTransaction,
};
