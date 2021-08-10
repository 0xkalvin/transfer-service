const accountRepository = require('../../repositories/account');
const transferRepository = require('../../repositories/transfer');
const logger = require('../../lib/logger')('ACCOUNT_SERVICE');

async function create(payload) {
  const createdAccount = await accountRepository.create(payload);

  accountRepository.index(createdAccount);

  return createdAccount;
}

async function show(accountId) {
  try {
    const account = await accountRepository.get(accountId);

    return account;
  } catch (error) {
    logger.error({
      message: 'Failed to fetch account in elasticsearch, falling back to postgres',
      error_message: error.message,
      error_stack: error.stack,
    });
  }

  const account = await accountRepository.findById(accountId);

  return account;
}

async function listAccountTransfers(accountId) {
  try {
    const transfers = await transferRepository.search({
      query: {
        match: {
          source_account_id: accountId,
        },
      },
    });

    return transfers;
  } catch (error) {
    logger.error({
      message: 'Failed to fetch transfers in elasticsearch, falling back to postgres',
      error_message: error.message,
      error_stack: error.stack,
    });
  }

  const transfers = await transferRepository.findBySourceAccountId(accountId);

  return transfers;
}

module.exports = {
  create,
  listAccountTransfers,
  show,
};
