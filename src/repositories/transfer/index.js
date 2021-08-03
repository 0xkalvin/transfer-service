const postgres = require('../../data-sources/postgres');
const kafka = require('../../data-sources/kafka');

const {
  KAFKA_TRANSFERS_PROCESSOR_TOPIC,
} = process.env;

async function create(payload, options) {
  const { Transfer } = postgres.connectionPool.models;

  const createdTransfer = await Transfer.create(payload, options);

  return createdTransfer;
}

async function findById(id, options) {
  const { Transfer } = postgres.connectionPool.models;

  const transfer = await Transfer.findOne({
    where: {
      id,
    },
    raw: true,
    ...options,
  });

  return transfer;
}

async function findBySourceAccountId(sourceAccountId, options) {
  const { Transfer } = postgres.connectionPool.models;

  const transfers = await Transfer.findAll({
    where: {
      source_account_id: sourceAccountId,
    },
    raw: true,
    order: [
      ['created_at', 'DESC'],
    ],
    options,
  });

  return transfers;
}

async function enqueue(payload) {
  await kafka.producer.sendMessages({
    messages: [
      {
        key: payload.id,
        value: payload,
      },
    ],
    topic: KAFKA_TRANSFERS_PROCESSOR_TOPIC,
  });
}

async function update(filter, updates, options) {
  const { Transfer } = postgres.connectionPool.models;

  const updatedTransfers = await Transfer.update(updates, {
    where: filter,
    ...options,
  });

  return updatedTransfers;
}

module.exports = {
  create,
  enqueue,
  findById,
  findBySourceAccountId,
  update,
};
