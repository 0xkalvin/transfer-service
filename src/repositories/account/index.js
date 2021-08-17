const postgres = require('../../data-sources/postgres');
const elasticseach = require('../../data-sources/elasticsearch');
const logger = require('../../lib/logger')('ACCOUNT_REPOSITORY');

async function create(payload) {
  const { Account } = postgres.connectionPool.models;

  const createdAccount = await Account.create(payload);

  const accountAsJSON = createdAccount.toJSON();

  return {
    ...accountAsJSON,
    createdAt: accountAsJSON.createdAt.toISOString(),
    updatedAt: accountAsJSON.updatedAt.toISOString(),
  };
}

async function findById(id, options) {
  const { Account } = postgres.connectionPool.models;

  const account = await Account.findOne({
    where: {
      id,
    },
    raw: true,
    ...options,
  });

  return account;
}

async function update(filter, updates, options) {
  const { Account } = postgres.connectionPool.models;

  const updatedAccounts = await Account.update(updates, {
    where: filter,
    returning: true,
    plain: true,
    raw: true,
    ...options,
  });

  return updatedAccounts[1];
}

async function index(payload) {
  await elasticseach.connectionPool.index({
    index: 'accounts',
    body: {
      id: payload.id,
      balance: payload.balance,
      holder_name: payload.holderName,
      holder_document_number: payload.holderDocumentNumber,
      created_at: payload.created_at,
      updated_at: payload.updated_at,
    },
    id: payload.id,
  });
}

async function indexUpdate(payload) {
  try {
    await elasticseach.connectionPool.update({
      index: 'accounts',
      body: {
        doc: payload,
      },
      id: payload.id,
    });
  } catch (error) {
    logger.error({
      message: 'Failed to update elasticsearch account document',
      error_message: error.message,
    });
  }
}

async function search(filters) {
  const { body } = await elasticseach.connectionPool.search({
    index: 'accounts',
    body: filters,
  });

  // eslint-disable-next-line no-underscore-dangle
  const accounts = body.hits.hits.map((item) => item._source);

  return accounts;
}

async function get(accountId) {
  const { body } = await elasticseach.connectionPool.get({
    index: 'accounts',
    id: accountId,
  });

  // eslint-disable-next-line no-underscore-dangle
  const account = body._source;

  return account;
}

module.exports = {
  create,
  findById,
  get,
  index,
  indexUpdate,
  search,
  update,
};
