const postgres = require('../../data-sources/postgres');
const kafka = require('../../data-sources/kafka');
const elasticseach = require('../../data-sources/elasticsearch');
const redis = require('../../data-sources/redis');

const {
  KAFKA_TRANSFERS_PROCESSOR_TOPIC,
} = process.env;

async function create(payload, options) {
  const { Transfer } = postgres.connectionPool.models;

  const createdTransfer = await Transfer.create(payload, {
    ...options,
  });

  const transferAsJSON = createdTransfer.toJSON ? createdTransfer.toJSON() : createdTransfer;

  return {
    ...transferAsJSON,
    created_at: transferAsJSON.created_at.toISOString(),
    updated_at: transferAsJSON.updated_at.toISOString(),
  };
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

function checkIdempotency(sourceAccount, idempotencyKey) {
  return new Promise((resolve, reject) => {
    const key = `${sourceAccount}.${idempotencyKey}`;

    redis.client.get(key, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);
    });
  });
}

function saveIdempotency(sourceAccount, idempotencyKey, expiresInSeconds) {
  return new Promise((resolve, reject) => {
    const key = `${sourceAccount}.${idempotencyKey}`;

    redis.client.setex(key, expiresInSeconds, true, (error, result) => {
      if (error) {
        reject(error);
      }

      resolve(result);
    });
  });
}

module.exports = {
  checkIdempotency,
  create,
  enqueue,
  index,
  findById,
  findBySourceAccountId,
  saveIdempotency,
  search,
  update,
};
