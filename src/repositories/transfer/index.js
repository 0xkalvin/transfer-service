const postgres = require('../../data-sources/postgres');
const kafka = require('../../data-sources/kafka');
const elasticseach = require('../../data-sources/elasticsearch');
const redis = require('../../data-sources/redis');
const logger = require('../../lib/logger')('TRANSFER_REPOSITORY');

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
    createdAt: transferAsJSON.createdAt.toISOString(),
    updatedAt: transferAsJSON.updatedAt.toISOString(),
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
    returning: true,
    plain: true,
    raw: true,
    ...options,
  });

  return updatedTransfers[1];
}

async function index(payload) {
  await elasticseach.connectionPool.index({
    index: 'transfers',
    body: {
      id: payload.id,
      amount: payload.amount,
      source_account_id: payload.sourceAccountId,
      target_account_id: payload.targetAccountId,
      created_at: payload.created_at,
      updated_at: payload.updated_at,
    },
    id: payload.id,
  });
}

async function indexUpdate(payload) {
  try {
    await elasticseach.connectionPool.update({
      index: 'transfers',
      body: {
        doc: payload,
      },
      id: payload.id,
    });
  } catch (error) {
    logger.error({
      message: 'Failed to update elasticsearch transfer document',
      error_message: error.message,
    });
  }
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
  indexUpdate,
  findById,
  findBySourceAccountId,
  saveIdempotency,
  search,
  update,
};
