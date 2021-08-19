const {
  postgres,
  elasticsearch,
  kafka,
  redis,
} = require('../../data-sources');
const logger = require('../../lib/logger')('TRANSFER_REPOSITORY');
const tracer = require('../../lib/tracer');

const {
  KAFKA_TRANSFERS_PROCESSOR_TOPIC,
} = process.env;

async function create(payload, options) {
  const { Transfer } = postgres.connectionPool.models;

  const createdTransfer = await Transfer.create(payload, {
    ...options,
  });

  const transferAsJSON = createdTransfer.toJSON ? createdTransfer.toJSON() : createdTransfer;

  return transferAsJSON;
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
        headers: {
          'x-trace-id': tracer.getTraceId(),
        },
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

async function settle(payload) {
  const {
    transferId,
    sourceAccountId,
    targetAccountId,
    amount,
  } = payload;

  const transactionOptions = {
    isolationLevel: postgres.Sequelize.Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  };

  const result = await postgres.connectionPool.transaction(transactionOptions, (transaction) => {
    const queryText = `
      UPDATE "Transfers" SET status = 'settled' WHERE id = :transfer_id RETURNING *;
      UPDATE "Accounts" SET balance = balance - :amount WHERE id = :source_account_id RETURNING *;
      UPDATE "Accounts" SET balance = balance + :amount WHERE id = :target_account_id RETURNING *;
    `;

    const replacements = {
      amount,
      source_account_id: sourceAccountId,
      target_account_id: targetAccountId,
      transfer_id: transferId,
    };

    return postgres.connectionPool.query(queryText, {
      plain: false,
      raw: true,
      returning: true,
      replacements,
      transaction,
      type: postgres.Sequelize.QueryTypes.UPDATE,
    });
  });

  const transfer = result[0][0];
  const sourceAccount = result[0][1];
  const targetAccount = result[0][2];

  return [
    {
      ...transfer,
      amount: Number(transfer.amount),
      created_at: transfer.created_at.toISOString(),
      updated_at: transfer.updated_at.toISOString(),
    },
    {
      ...sourceAccount,
      balance: Number(sourceAccount.balance),
      created_at: sourceAccount.created_at.toISOString(),
      updated_at: sourceAccount.updated_at.toISOString(),
    },
    {
      ...targetAccount,
      balance: Number(targetAccount.balance),
      created_at: targetAccount.created_at.toISOString(),
      updated_at: targetAccount.updated_at.toISOString(),
    },
  ];
}

async function index(payload) {
  await elasticsearch.connectionPool.index({
    index: 'transfers',
    body: {
      id: payload.id,
      amount: payload.amount,
      source_account_id: payload.sourceAccountId,
      target_account_id: payload.targetAccountId,
      status: payload.status,
      created_at: payload.createdAt,
      updated_at: payload.updatedAt,
    },
    id: payload.id,
  });
}

async function indexUpdate(payload) {
  try {
    await elasticsearch.connectionPool.update({
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
  const { body } = await elasticsearch.connectionPool.search({
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
  settle,
};
