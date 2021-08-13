const postgres = require('../../data-sources/postgres');
const elasticseach = require('../../data-sources/elasticsearch');

async function create(payload) {
  const { Account } = postgres.connectionPool.models;

  const createdAccount = await Account.create(payload);

  const accountAsJSON = createdAccount.toJSON();

  return {
    ...accountAsJSON,
    created_at: accountAsJSON.created_at.toISOString(),
    updated_at: accountAsJSON.updated_at.toISOString(),
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
    ...options,
  });

  return updatedAccounts;
}

async function index(payload) {
  await elasticseach.connectionPool.index({
    index: 'accounts',
    body: payload,
    id: payload.id,
  });
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
  search,
  update,
};
