const accountRepository = require('../../repositories/account');
const transferRepository = require('../../repositories/transfer');

async function create(payload) {
  const createdAccount = await accountRepository.create(payload);

  return createdAccount;
}

async function show(accountId) {
  const account = await accountRepository.findById(accountId);

  return account;
}

async function listAccountTransfers(accountId) {
  const transfers = await transferRepository.findBySourceAccountId(accountId);

  return transfers;
}

module.exports = {
  create,
  listAccountTransfers,
  show,
};
