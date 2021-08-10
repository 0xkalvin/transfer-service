const postgres = require('../../data-sources/postgres');
const kafka = require('../../data-sources/kafka');
const elasticseach = require('../../data-sources/elasticsearch');

const {
  KAFKA_TRANSFERS_PROCESSOR_TOPIC,
} = process.env;

async function create(payload, options) {
  const { Transfer } = postgres.connectionPool.models;

  const createdTransfer = await Transfer.create(payload, {
    ...options,
  });

  return createdTransfer.toJSON ? createdTransfer.toJSON() : createdTransfer;
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

async function index(payload) {
  await elasticseach.connectionPool.index({
    index: 'transfers',
    body: payload,
    id: payload.id,
  });
}

async function search(filters) {
  const { body } = await elasticseach.connectionPool.search({
    index: 'transfers',
    body: filters,
  });

  // eslint-disable-next-line no-underscore-dangle
  const transfers = body.hits.hits.map((item) => item._source);

  return transfers;
}

module.exports = {
  create,
  enqueue,
  index,
  findById,
  findBySourceAccountId,
  search,
  update,
};
