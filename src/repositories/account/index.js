const postgres = require('../../data-sources/postgres');

async function create(payload) {
  const { Account } = postgres.connectionPool.models;

  const createdAccount = await Account.create(payload);

  return createdAccount;
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

module.exports = {
  create,
  findById,
  update,
};
